import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

/**
 * 檢查用戶的積分記錄
 * 在瀏覽器 console 中執行: window.checkPointsRecords()
 */
export async function checkPointsRecords() {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ 請先登入！');
    return;
  }

  console.log('🔍 開始檢查積分記錄...');
  console.log('當前用戶ID:', currentUser.uid);
  
  try {
    // 1. 檢查 users 集合中的總積分
    console.log('\n📊 檢查用戶總積分：');
    const { pointsService } = await import('../services/points.js');
    const userProfile = await pointsService.getUserProfile(currentUser.uid);
    console.log('用戶檔案:', userProfile);
    console.log('總積分:', userProfile?.totalPoints || 0);
    
    // 2. 檢查 pointsRecords 集合
    console.log('\n📝 檢查積分記錄：');
    const q = query(
      collection(db, 'pointsRecords'),
      where('userId', '==', currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('找到', querySnapshot.size, '筆記錄');
    
    if (querySnapshot.empty) {
      console.warn('⚠️ 沒有找到任何積分記錄！');
      console.log('💡 這可能表示：');
      console.log('   1. 你還沒有完成過任何問卷驗證');
      console.log('   2. 可以使用 window.addTestPoints() 添加測試積分');
    } else {
      console.table(querySnapshot.docs.map(doc => ({
        ID: doc.id,
        積分: doc.data().points,
        類型: doc.data().type,
        描述: doc.data().description,
        時間: doc.data().createdAt?.toDate().toLocaleString() || '未知'
      })));
      
      // 計算統計
      let totalFromRecords = 0;
      const typeStats = {};
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalFromRecords += data.points || 0;
        
        const type = data.type || 'unknown';
        if (!typeStats[type]) {
          typeStats[type] = { count: 0, points: 0 };
        }
        typeStats[type].count++;
        typeStats[type].points += data.points || 0;
      });
      
      console.log('\n📈 統計資訊：');
      console.log('記錄總積分:', totalFromRecords);
      console.log('用戶總積分:', userProfile?.totalPoints || 0);
      console.log('是否一致:', totalFromRecords === (userProfile?.totalPoints || 0) ? '✅ 是' : '⚠️ 否');
      
      console.log('\n📊 按類型統計：');
      console.table(typeStats);
    }
    
    // 3. 檢查 matches 集合
    console.log('\n🤝 檢查互填配對：');
    const { matchesService } = await import('../services/matches.js');
    const matches = await matchesService.getUserMatches(currentUser.uid);
    console.log('找到', matches.length, '個配對');
    
    if (matches.length > 0) {
      console.table(matches.map(match => ({
        ID: match.id,
        角色: match.role === 'requester' ? '發起者' : '接受者',
        狀態: match.status,
        已完成: match.role === 'requester' ? match.requesterDone : match.counterpartDone,
        積分: match.role === 'requester' ? match.requesterPoints : match.counterpartPoints
      })));
    }
    
    // 4. 檢查 responses 集合
    console.log('\n📋 檢查回應記錄：');
    const responsesQuery = query(
      collection(db, 'responses'),
      where('respondentUidOrAnon', '==', currentUser.uid)
    );
    
    const responsesSnapshot = await getDocs(responsesQuery);
    console.log('找到', responsesSnapshot.size, '筆回應');
    
    if (responsesSnapshot.size > 0) {
      console.table(responsesSnapshot.docs.map(doc => ({
        ID: doc.id,
        狀態: doc.data().status,
        問卷ID: doc.data().surveyId,
        配對ID: doc.data().matchId || '無',
        積分: doc.data().pointsAwarded,
        完成時間: doc.data().completedAt?.toDate().toLocaleString() || '未完成'
      })));
    }
    
    console.log('\n✅ 檢查完成！');
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  }
}

// 掛載到 window 對象供 console 使用
if (typeof window !== 'undefined') {
  window.checkPointsRecords = checkPointsRecords;
}

