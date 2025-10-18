import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc,
  setDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth, db } from '../firebase.js';

// 積分系統服務
export const pointsService = {
  // 獲取用戶積分總額
  async getUserTotalPoints(userId = null) {
    try {
      const currentUser = userId || auth.currentUser?.uid;
      if (!currentUser) return 0;

      const userDoc = await this.getUserProfile(currentUser);
      return userDoc?.totalPoints || 0;
    } catch (error) {
      console.error('獲取用戶積分失敗:', error);
      return 0;
    }
  },

  // 獲取用戶檔案
  async getUserProfile(userId = null) {
    try {
      const currentUser = userId || auth.currentUser?.uid;
      if (!currentUser) return null;

      const docRef = doc(db, 'users', currentUser);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        // 創建新的用戶檔案
        const newProfile = {
          uid: currentUser,
          totalPoints: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // 使用 setDoc 而不是 updateDoc
        await setDoc(docRef, newProfile);
        console.log('已創建新的用戶檔案:', currentUser);
        return { id: currentUser, ...newProfile };
      }
    } catch (error) {
      console.error('獲取用戶檔案失敗:', error);
      return null;
    }
  },

  // 添加積分記錄
  async addPointsRecord(userId, points, type, description, relatedId = null) {
    try {
      // 0. 確保用戶檔案存在
      await this.getUserProfile(userId);

      // 1. 創建積分記錄
      const recordData = {
        userId,
        points,
        type, // 'survey_complete', 'mutual_bonus', 'penalty', 'bonus'
        description,
        relatedId, // 相關的 surveyId, matchId 等
        createdAt: serverTimestamp()
      };

      const recordRef = await addDoc(collection(db, 'pointsRecords'), recordData);

      // 2. 更新用戶總積分
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalPoints: increment(points),
        updatedAt: serverTimestamp()
      });

      console.log('積分記錄已添加:', { recordId: recordRef.id, points, type });
      
      return recordRef.id;
    } catch (error) {
      console.error('添加積分記錄失敗:', error);
      throw error;
    }
  },

  // 獲取用戶積分記錄
  async getUserPointsRecords(userId = null, limit = 50) {
    try {
      const currentUser = userId || auth.currentUser?.uid;
      if (!currentUser) return [];

      const q = query(
        collection(db, 'pointsRecords'),
        where('userId', '==', currentUser),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('獲取積分記錄失敗:', error);
      return [];
    }
  },

  // 積分類型配置
  getPointTypeConfig(type) {
    const configs = {
      'survey_complete': {
        label: '完成問卷',
        icon: '📝',
        color: '#22c55e'
      },
      'mutual_bonus': {
        label: '互惠加成',
        icon: '🤝',
        color: '#f59e0b'
      },
      'penalty': {
        label: '逾期扣分',
        icon: '⏰',
        color: '#ef4444'
      },
      'bonus': {
        label: '特殊獎勵',
        icon: '🎁',
        color: '#8b5cf6'
      },
      'referral': {
        label: '推薦獎勵',
        icon: '👥',
        color: '#06b6d4'
      }
    };

    return configs[type] || {
      label: '其他',
      icon: '💰',
      color: '#6b7280'
    };
  },

  // 格式化積分顯示
  formatPoints(points) {
    if (points > 0) {
      return `+${points}`;
    } else if (points < 0) {
      return `${points}`;
    } else {
      return '0';
    }
  },

  // 計算積分統計
  calculatePointsStats(records) {
    const stats = {
      total: 0,
      earned: 0,
      spent: 0,
      thisMonth: 0,
      byType: {}
    };

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    records.forEach(record => {
      const points = record.points || 0;
      const createdAt = record.createdAt?.toDate ? record.createdAt.toDate() : new Date();
      
      // 總積分
      stats.total += points;
      
      // 獲得/消費分類
      if (points > 0) {
        stats.earned += points;
      } else {
        stats.spent += Math.abs(points);
      }
      
      // 本月積分
      if (createdAt >= thisMonthStart) {
        stats.thisMonth += points;
      }
      
      // 按類型統計
      const type = record.type || 'other';
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, points: 0 };
      }
      stats.byType[type].count++;
      stats.byType[type].points += points;
    });

    return stats;
  }
};
