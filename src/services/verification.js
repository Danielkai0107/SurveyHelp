import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc,
  query, 
  where, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

// 驗證服務
export const verificationService = {
  // 處理驗證請求
  async processVerification(verificationId, userInfo = {}) {
    try {
      // 1. 查找對應的問卷
      const surveyQuery = query(
        collection(db, 'surveys'),
        where('verificationId', '==', verificationId),
        where('isActive', '==', true)
      );
      const surveySnapshot = await getDocs(surveyQuery);
      
      if (surveySnapshot.empty) {
        throw new Error('驗證連結無效或問卷已關閉');
      }
      
      const surveyDoc = surveySnapshot.docs[0];
      const surveyData = surveyDoc.data();
      
      // 2. 檢查問卷是否已達到目標人數
      if (surveyData.filled >= surveyData.targetCount) {
        return {
          success: false,
          message: '此問卷已達到目標人數，感謝您的關注',
          survey: surveyData
        };
      }
      
      // 3. 檢查是否重複驗證 (可選邏輯)
      const duplicateCheck = await this.checkDuplicateVerification(
        verificationId, 
        userInfo.userId || userInfo.sessionId
      );
      
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          message: '您已經驗證過此問卷',
          survey: surveyData,
          lastVerification: duplicateCheck.lastVerification
        };
      }
      
      // 4. 記錄驗證
      await addDoc(collection(db, 'verifications'), {
        verificationId,
        surveyId: surveyDoc.id,
        userId: userInfo.userId || null,
        userAgent: userInfo.userAgent || '',
        ipAddress: userInfo.ipAddress || '',
        verifiedAt: serverTimestamp(),
        status: 'completed',
        metadata: {
          referrer: userInfo.referrer || '',
          sessionId: userInfo.sessionId || ''
        }
      });
      
      // 5. 更新問卷統計
      await updateDoc(doc(db, 'surveys', surveyDoc.id), {
        verificationCount: increment(1),
        filled: increment(1),
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: '驗證成功！感謝您的參與',
        survey: surveyData,
        incentive: surveyData.incentive || 0
      };
      
    } catch (error) {
      console.error('驗證處理失敗:', error);
      throw error;
    }
  },
  
  // 檢查重複驗證
  async checkDuplicateVerification(verificationId, identifier) {
    if (!identifier) return { isDuplicate: false };
    
    try {
      const duplicateQuery = query(
        collection(db, 'verifications'),
        where('verificationId', '==', verificationId),
        where('userId', '==', identifier)
      );
      
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      if (!duplicateSnapshot.empty) {
        return {
          isDuplicate: true,
          lastVerification: duplicateSnapshot.docs[0].data()
        };
      }
      
      // 如果沒有 userId，檢查 sessionId
      if (!identifier.startsWith('session_')) {
        return { isDuplicate: false };
      }
      
      const sessionQuery = query(
        collection(db, 'verifications'),
        where('verificationId', '==', verificationId),
        where('metadata.sessionId', '==', identifier)
      );
      
      const sessionSnapshot = await getDocs(sessionQuery);
      
      return {
        isDuplicate: !sessionSnapshot.empty,
        lastVerification: sessionSnapshot.empty ? null : sessionSnapshot.docs[0].data()
      };
      
    } catch (error) {
      console.error('檢查重複驗證失敗:', error);
      return { isDuplicate: false };
    }
  },
  
  // 獲取問卷的驗證統計
  async getVerificationStats(surveyId) {
    try {
      const statsQuery = query(
        collection(db, 'verifications'),
        where('surveyId', '==', surveyId)
      );
      
      const statsSnapshot = await getDocs(statsQuery);
      const verifications = statsSnapshot.docs.map(doc => doc.data());
      
      // 按狀態分組統計
      const statusCounts = verifications.reduce((acc, verification) => {
        acc[verification.status] = (acc[verification.status] || 0) + 1;
        return acc;
      }, {});
      
      // 按日期分組統計
      const dailyStats = verifications.reduce((acc, verification) => {
        if (verification.verifiedAt) {
          const date = verification.verifiedAt.toDate().toDateString();
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {});
      
      return {
        total: verifications.length,
        statusCounts,
        dailyStats,
        completed: statusCounts.completed || 0,
        timeline: verifications
          .filter(v => v.verifiedAt)
          .map(v => ({
            date: v.verifiedAt.toDate(),
            status: v.status,
            userId: v.userId
          }))
          .sort((a, b) => b.date - a.date)
      };
    } catch (error) {
      console.error('獲取驗證統計失敗:', error);
      throw error;
    }
  },
  
  // 生成唯一驗證 ID
  generateVerificationId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `verify_${timestamp}_${randomStr}`;
  },
  
  // 生成驗證連結
  generateVerificationLink(verificationId, baseUrl = window.location.origin) {
    return `${baseUrl}/verify?id=${verificationId}&return=true`;
  },
  
  // 生成會話 ID
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 12);
  }
};
