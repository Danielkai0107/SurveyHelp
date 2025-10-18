import { pointsService } from '../services/points.js';
import { auth } from '../firebase.js';

/**
 * 為當前用戶添加測試積分記錄
 * 在瀏覽器 console 中執行: window.addTestPoints()
 */
export async function addTestPoints() {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('請先登入！');
    return;
  }

  console.log('開始為用戶添加測試積分記錄...', currentUser.uid);

  try {
    // 1. 完成問卷積分
    await pointsService.addPointsRecord(
      currentUser.uid,
      10,
      'survey_complete',
      '完成問卷：消費者行為調查',
      'survey_test_1'
    );
    console.log('✓ 添加問卷完成積分記錄 1');

    await pointsService.addPointsRecord(
      currentUser.uid,
      15,
      'survey_complete',
      '完成問卷：產品滿意度調查',
      'survey_test_2'
    );
    console.log('✓ 添加問卷完成積分記錄 2');

    await pointsService.addPointsRecord(
      currentUser.uid,
      12,
      'survey_complete',
      '完成問卷：市場趨勢研究',
      'survey_test_3'
    );
    console.log('✓ 添加問卷完成積分記錄 3');

    // 2. 互惠加成積分
    await pointsService.addPointsRecord(
      currentUser.uid,
      2,
      'mutual_bonus',
      '互填配對完成加成：消費者行為調查',
      'match_test_1'
    );
    console.log('✓ 添加互惠加成積分記錄 1');

    await pointsService.addPointsRecord(
      currentUser.uid,
      2,
      'mutual_bonus',
      '互填配對完成加成：產品滿意度調查',
      'match_test_2'
    );
    console.log('✓ 添加互惠加成積分記錄 2');

    // 3. 特殊獎勵
    await pointsService.addPointsRecord(
      currentUser.uid,
      5,
      'bonus',
      '新用戶註冊獎勵',
      null
    );
    console.log('✓ 添加特殊獎勵積分記錄');

    // 4. 推薦獎勵
    await pointsService.addPointsRecord(
      currentUser.uid,
      3,
      'referral',
      '推薦好友註冊獎勵',
      null
    );
    console.log('✓ 添加推薦獎勵積分記錄');

    // 5. 逾期扣分（負數）
    await pointsService.addPointsRecord(
      currentUser.uid,
      -5,
      'penalty',
      '未在期限內完成問卷',
      'match_test_expired'
    );
    console.log('✓ 添加逾期扣分記錄');

    console.log('');
    console.log('🎉 測試積分記錄添加完成！');
    console.log('請重新載入頁面查看結果');
    
    // 顯示當前總積分
    const totalPoints = await pointsService.getUserTotalPoints(currentUser.uid);
    console.log(`當前總積分: ${totalPoints}`);

  } catch (error) {
    console.error('添加測試積分記錄失敗:', error);
  }
}

// 掛載到 window 對象供 console 使用
if (typeof window !== 'undefined') {
  window.addTestPoints = addTestPoints;
}

