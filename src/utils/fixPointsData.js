import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { pointsService } from '../services/points.js';

/**
 * 修復和同步用戶的積分數據
 * 在瀏覽器 console 中執行: window.fixPointsData()
 */
export async function fixPointsData() {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ 請先登入！');
    return;
  }

  console.log('🔧 開始修復積分數據...');
  console.log('當前用戶ID:', currentUser.uid);
  
  try {
    // 1. 確保用戶檔案存在
    console.log('\n📝 步驟 1: 檢查用戶檔案');
    const userProfile = await pointsService.getUserProfile(currentUser.uid);
    console.log('✅ 用戶檔案:', userProfile);
    
    // 2. 檢查積分記錄
    console.log('\n📝 步驟 2: 檢查積分記錄');
    const recordsQuery = query(
      collection(db, 'pointsRecords'),
      where('userId', '==', currentUser.uid)
    );
    
    const recordsSnapshot = await getDocs(recordsQuery);
    console.log('找到', recordsSnapshot.size, '筆積分記錄');
    
    // 3. 計算積分總和
    let calculatedTotal = 0;
    recordsSnapshot.docs.forEach(doc => {
      const points = doc.data().points || 0;
      calculatedTotal += points;
    });
    
    console.log('記錄中的總積分:', calculatedTotal);
    console.log('用戶檔案中的總積分:', userProfile?.totalPoints || 0);
    
    // 4. 如果不一致，修復
    if (calculatedTotal !== (userProfile?.totalPoints || 0)) {
      console.warn('⚠️ 發現積分不一致！');
      console.log('正在修復...');
      
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        uid: currentUser.uid,
        totalPoints: calculatedTotal,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ 積分已修復為:', calculatedTotal);
    } else {
      console.log('✅ 積分數據一致，無需修復');
    }
    
    // 5. 檢查配對記錄
    console.log('\n📝 步驟 3: 檢查配對記錄');
    const { matchesService } = await import('../services/matches.js');
    const matches = await matchesService.getUserMatches(currentUser.uid);
    console.log('找到', matches.length, '個配對');
    
    // 統計配對積分
    let matchesPoints = 0;
    matches.forEach(match => {
      const points = match.role === 'requester' ? match.requesterPoints : match.counterpartPoints;
      matchesPoints += points || 0;
    });
    console.log('配對中的總積分:', matchesPoints);
    
    // 6. 顯示詳細報告
    console.log('\n📊 詳細報告：');
    console.table({
      '用戶檔案總積分': userProfile?.totalPoints || 0,
      '記錄計算總積分': calculatedTotal,
      '配對獲得積分': matchesPoints,
      '記錄數量': recordsSnapshot.size,
      '配對數量': matches.length
    });
    
    // 7. 如果沒有任何記錄，提供建議
    if (recordsSnapshot.size === 0) {
      console.log('\n💡 建議：');
      console.log('   1. 執行 window.addTestPoints() 添加測試積分');
      console.log('   2. 完成一個問卷驗證流程來獲得真實積分');
      console.log('   3. 檢查 Firebase 規則是否正確設置');
    }
    
    // 8. 觸發積分更新事件
    window.dispatchEvent(new CustomEvent('points-updated'));
    console.log('\n✅ 修復完成！已觸發積分更新事件');
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
    console.error('錯誤詳情:', error);
    
    if (error.code === 'permission-denied') {
      console.error('\n🚫 Firebase 權限錯誤！');
      console.error('請在 Firebase Console 中部署以下規則：');
      console.error(`
        match /pointsRecords/{recordId} {
          allow read: if request.auth != null && resource.data.userId == request.auth.uid;
          allow create: if request.auth != null;
        }
        
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      `);
    }
  }
}

// 掛載到 window 對象供 console 使用
if (typeof window !== 'undefined') {
  window.fixPointsData = fixPointsData;
}

