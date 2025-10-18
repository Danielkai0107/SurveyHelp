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
  Timestamp,
  increment
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../firebase.js';

// 回應服務
export const responsesService = {
  // 創建待驗證回應記錄
  async createPendingResponse(surveyId, matchId = null) {
    try {
      // 確保用戶已登入（匿名或正式用戶）
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const result = await signInAnonymously(auth);
        currentUser = result.user;
        console.log('已創建匿名用戶:', currentUser.uid);
      }

      // 檢查是否已有待驗證記錄
      const existingQuery = query(
        collection(db, 'responses'),
        where('surveyId', '==', surveyId),
        where('respondentUidOrAnon', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      
      const existingSnap = await getDocs(existingQuery);
      
      if (!existingSnap.empty) {
        console.log('已存在待驗證記錄，使用現有記錄');
        return {
          responseId: existingSnap.docs[0].id,
          isNew: false
        };
      }

      // 計算過期時間（48小時後）
      const now = new Date();
      const expireAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // 創建新的待驗證記錄
      const docRef = await addDoc(collection(db, 'responses'), {
        surveyId: surveyId,
        respondentUidOrAnon: currentUser.uid,
        status: 'pending',
        startedAt: serverTimestamp(),
        completedAt: null,
        expireAt: Timestamp.fromDate(expireAt),
        pointsAwarded: 0,
        matchId: matchId,
        userAgent: navigator.userAgent,
        ipAddress: '', // 可選：如果需要記錄 IP
        metadata: {
          referrer: document.referrer,
          sessionId: this.generateSessionId()
        }
      });

      console.log('已創建待驗證記錄:', docRef.id);
      
      return {
        responseId: docRef.id,
        isNew: true
      };
    } catch (error) {
      console.error('創建待驗證記錄失敗:', error);
      throw error;
    }
  },

  // 驗證回應（在 /verify 頁面使用）
  async verifyResponse(surveyId) {
    try {
      // 確保用戶已登入（匿名或正式用戶）
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const result = await signInAnonymously(auth);
        currentUser = result.user;
        console.log('已創建匿名用戶進行驗證:', currentUser.uid);
      }

      console.log('開始驗證回應:', { surveyId, anonUid: currentUser.uid });

      // 查找待驗證的回應記錄
      const pendingQuery = query(
        collection(db, 'responses'),
        where('surveyId', '==', surveyId),
        where('respondentUidOrAnon', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      const pendingSnap = await getDocs(pendingQuery);

      if (pendingSnap.empty) {
        console.log('未找到待驗證記錄');
        return {
          success: false,
          message: '未找到您的填寫紀錄，請回平台重新點「開始作答」再試一次。',
          code: 'NO_PENDING_RESPONSE'
        };
      }

      // 獲取問卷資訊
      const surveyDoc = await this.getSurveyInfo(surveyId);
      if (!surveyDoc) {
        return {
          success: false,
          message: '問卷不存在或已關閉',
          code: 'SURVEY_NOT_FOUND'
        };
      }

      // 更新回應狀態為已完成
      const responseDoc = pendingSnap.docs[0];
      const responseData = responseDoc.data();
      const basePoints = surveyDoc.incentive || 3;
      
      await updateDoc(responseDoc.ref, {
        status: 'completed',
        completedAt: serverTimestamp(),
        pointsAwarded: basePoints
      });

      console.log('驗證成功，已更新回應狀態');

      // 更新問卷的填答人數
      try {
        const { surveyService } = await import('./firebase.js');
        const surveyRef = doc(db, 'surveys', surveyId);
        await updateDoc(surveyRef, {
          filled: increment(1),
          updatedAt: serverTimestamp()
        });
        console.log('問卷填答人數已更新');
      } catch (error) {
        console.error('更新問卷填答人數失敗:', error);
      }

      // 處理互填配對和積分記錄
      let mutualBonus = 0;
      let matchCompleted = false;
      
      try {
        // 動態導入服務避免循環依賴
        const { pointsService } = await import('./points.js');
        
        // 添加基本積分記錄
        await pointsService.addPointsRecord(
          currentUser.uid,
          basePoints,
          'survey_complete',
          `完成問卷：${surveyDoc.title}`,
          surveyId
        );
        
      // 處理互填配對（如果有）
      if (responseData.matchId) {
        console.log('🔍 開始處理互填配對:', {
          matchId: responseData.matchId,
          userId: currentUser.uid,
          surveyId: surveyId
        });
        
        const { matchesService } = await import('./matches.js');
        const matchResult = await matchesService.markMatchCompleted(
          responseData.matchId, 
          currentUser.uid
        );
        
        mutualBonus = matchResult.mutualBonus;
        matchCompleted = matchResult.matchCompleted;
        
        console.log('✅ 互填配對處理結果:', matchResult);
        
        // 如果雙方都完成了，當前用戶獲得互惠加成
        if (mutualBonus > 0) {
          await pointsService.addPointsRecord(
            currentUser.uid,
            mutualBonus,
            'mutual_bonus',
            `互填配對完成加成：${surveyDoc.title}`,
            responseData.matchId
          );
          console.log(`✅ 當前用戶獲得互惠加成 +${mutualBonus} 分`);
        } else {
          console.log('ℹ️ 第一個完成，暫無互惠加成（等待對方完成）');
        }
      } else {
        console.log('ℹ️ 此回應沒有關聯的配對記錄（非互填）');
      }
      } catch (error) {
        console.error('處理積分記錄失敗:', error);
      }

      // 觸發積分更新事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('points-updated'))
        console.log('✅ 已觸發積分更新事件')
      }

      return {
        success: true,
        message: '驗證完成！感謝您的參與',
        basePoints,
        mutualBonus,
        totalPoints: basePoints + mutualBonus,
        matchCompleted,
        surveyTitle: surveyDoc.title,
        responseId: responseDoc.id
      };

    } catch (error) {
      console.error('驗證回應失敗:', error);
      return {
        success: false,
        message: '驗證過程發生錯誤，請稍後再試',
        code: 'VERIFICATION_ERROR',
        error: error.message
      };
    }
  },

  // 獲取問卷資訊
  async getSurveyInfo(surveyId) {
    try {
      // 直接通過文檔 ID 查找
      const docRef = doc(db, 'surveys', surveyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      
      return null;
    } catch (error) {
      console.error('獲取問卷資訊失敗:', error);
      return null;
    }
  },

  // 獲取用戶的回應記錄
  async getUserResponses(userId = null) {
    try {
      const currentUser = userId || auth.currentUser?.uid;
      if (!currentUser) return [];

      const responsesQuery = query(
        collection(db, 'responses'),
        where('respondentUidOrAnon', '==', currentUser)
      );

      const responsesSnap = await getDocs(responsesQuery);
      
      return responsesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('獲取用戶回應失敗:', error);
      throw error;
    }
  },

  // 生成會話 ID
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 12);
  },

  // 生成驗證連結
  generateVerifyLink(surveyId, baseUrl = window.location.origin) {
    return `${baseUrl}/verify?surveyId=${surveyId}`;
  }
};

// 導出匿名登入功能
export { signInAnonymously } from 'firebase/auth';
