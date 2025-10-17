import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc,
  query, 
  where, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase.js';

// 互填配對服務
export const matchesService = {
  // 創建互填配對
  async createMatch(ownerSurveyId, selectedMySurveyId = null) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('用戶未登入');
      }

      // 獲取對方問卷的擁有者
      const ownerSurvey = await this.getSurveyOwner(ownerSurveyId);
      if (!ownerSurvey) {
        throw new Error('找不到問卷擁有者');
      }

      // 計算過期時間（48小時後）
      const now = new Date();
      const expireAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const matchData = {
        ownerSurveyId,
        requesterUid: currentUser.uid,
        requesterResponseId: null, // 稍後更新
        selectedMySurveyId,
        counterpartUid: ownerSurvey.createdBy,
        counterpartResponseId: null,
        
        // 狀態與時效
        status: 'open',
        createdAt: serverTimestamp(),
        expireAt: Timestamp.fromDate(expireAt),
        
        // 完成標記
        requesterDone: false,
        counterpartDone: false,
        
        // 積分
        requesterPoints: 0,
        counterpartPoints: 0,
        mutualBonus: 2 // 互惠加成
      };

      const docRef = await addDoc(collection(db, 'matches'), matchData);
      
      console.log('已創建互填配對:', docRef.id);
      
      return {
        matchId: docRef.id,
        ...matchData
      };
    } catch (error) {
      console.error('創建互填配對失敗:', error);
      throw error;
    }
  },

  // 更新配對的 response ID
  async updateMatchResponseId(matchId, responseId, isRequester = true) {
    try {
      const docRef = doc(db, 'matches', matchId);
      const updateData = isRequester 
        ? { requesterResponseId: responseId }
        : { counterpartResponseId: responseId };
      
      await updateDoc(docRef, updateData);
      console.log('已更新配對的 response ID:', { matchId, responseId, isRequester });
    } catch (error) {
      console.error('更新配對 response ID 失敗:', error);
      throw error;
    }
  },

  // 標記配對完成
  async markMatchCompleted(matchId, completedBy) {
    try {
      const docRef = doc(db, 'matches', matchId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('配對不存在');
      }

      const matchData = docSnap.data();
      const isRequester = completedBy === matchData.requesterUid;
      
      // 更新完成狀態
      const updateData = {
        [isRequester ? 'requesterDone' : 'counterpartDone']: true,
        [`${isRequester ? 'requester' : 'counterpart'}Points`]: 10 // 基本積分
      };

      // 檢查是否雙方都完成
      const otherDone = isRequester ? matchData.counterpartDone : matchData.requesterDone;
      
      if (otherDone) {
        // 雙方都完成，給予互惠加成
        updateData.status = 'closed';
        updateData.requesterPoints = (matchData.requesterPoints || 0) + matchData.mutualBonus;
        updateData.counterpartPoints = (matchData.counterpartPoints || 0) + matchData.mutualBonus;
        
        console.log('互填配對完成，雙方獲得互惠加成');
      }

      await updateDoc(docRef, updateData);
      
      return {
        matchCompleted: otherDone,
        mutualBonus: otherDone ? matchData.mutualBonus : 0,
        totalPoints: updateData[`${isRequester ? 'requester' : 'counterpart'}Points`]
      };
    } catch (error) {
      console.error('標記配對完成失敗:', error);
      throw error;
    }
  },

  // 獲取用戶的配對記錄
  async getUserMatches(userId = null) {
    try {
      const currentUser = userId || auth.currentUser?.uid;
      if (!currentUser) return [];

      // 查找用戶作為 requester 的配對
      const requesterQuery = query(
        collection(db, 'matches'),
        where('requesterUid', '==', currentUser)
      );

      // 查找用戶作為 counterpart 的配對
      const counterpartQuery = query(
        collection(db, 'matches'),
        where('counterpartUid', '==', currentUser)
      );

      const [requesterSnap, counterpartSnap] = await Promise.all([
        getDocs(requesterQuery),
        getDocs(counterpartQuery)
      ]);

      const matches = [];
      
      // 處理作為 requester 的配對
      requesterSnap.docs.forEach(doc => {
        matches.push({
          id: doc.id,
          ...doc.data(),
          role: 'requester' // 我去填別人的
        });
      });

      // 處理作為 counterpart 的配對
      counterpartSnap.docs.forEach(doc => {
        matches.push({
          id: doc.id,
          ...doc.data(),
          role: 'counterpart' // 別人來填我的
        });
      });

      // 按創建時間排序
      matches.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      return matches;
    } catch (error) {
      console.error('獲取用戶配對失敗:', error);
      throw error;
    }
  },

  // 獲取問卷擁有者
  async getSurveyOwner(surveyId) {
    try {
      const docRef = doc(db, 'surveys', surveyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      
      return null;
    } catch (error) {
      console.error('獲取問卷擁有者失敗:', error);
      return null;
    }
  },

  // 檢查過期配對（定時任務用）
  async expireMatches() {
    try {
      const now = new Date();
      const expiredQuery = query(
        collection(db, 'matches'),
        where('status', '==', 'open'),
        where('expireAt', '<=', Timestamp.fromDate(now))
      );

      const expiredSnap = await getDocs(expiredQuery);
      
      const expirePromises = expiredSnap.docs.map(async (doc) => {
        await updateDoc(doc.ref, {
          status: 'closed_expired'
        });
        
        // 同時更新相關的 responses 為 expired
        const matchData = doc.data();
        if (matchData.requesterResponseId && !matchData.requesterDone) {
          await this.expireResponse(matchData.requesterResponseId);
        }
        if (matchData.counterpartResponseId && !matchData.counterpartDone) {
          await this.expireResponse(matchData.counterpartResponseId);
        }
      });

      await Promise.all(expirePromises);
      
      console.log(`已處理 ${expiredSnap.docs.length} 個過期配對`);
      return expiredSnap.docs.length;
    } catch (error) {
      console.error('處理過期配對失敗:', error);
      throw error;
    }
  },

  // 標記 response 為過期
  async expireResponse(responseId) {
    try {
      const docRef = doc(db, 'responses', responseId);
      await updateDoc(docRef, {
        status: 'expired'
      });
    } catch (error) {
      console.error('標記 response 過期失敗:', error);
    }
  },

  // 計算剩餘時間
  calculateTimeRemaining(expireAt) {
    if (!expireAt) return { expired: true, text: '已過期' };
    
    const expireDate = expireAt.toDate ? expireAt.toDate() : new Date(expireAt);
    const now = new Date();
    const diffMs = expireDate - now;
    
    if (diffMs <= 0) {
      return { expired: true, text: '已過期' };
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return { 
        expired: false, 
        text: `${diffHours}小時${diffMinutes}分鐘`,
        hours: diffHours,
        minutes: diffMinutes
      };
    } else {
      return { 
        expired: false, 
        text: `${diffMinutes}分鐘`,
        minutes: diffMinutes
      };
    }
  }
};
