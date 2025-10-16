import { optionsService, defaultOptions } from '../services/options.js';

// 初始化 Firestore 選項資料
export async function initFirestoreOptions() {
  console.log('開始初始化 Firestore 選項資料...');
  
  try {
    // 檢查是否已經有資料
    const existingOptions = await optionsService.getAllOptions();
    
    // 如果已有完整資料，跳過初始化
    const requiredTypes = Object.keys(defaultOptions);
    const existingTypes = Object.keys(existingOptions);
    const missingTypes = requiredTypes.filter(type => !existingTypes.includes(type));
    
    if (missingTypes.length === 0) {
      console.log('Firestore 選項資料已存在，跳過初始化');
      return existingOptions;
    }
    
    console.log(`需要初始化的選項類型: ${missingTypes.join(', ')}`);
    
    // 初始化缺失的選項類型
    const initPromises = missingTypes.map(async (type) => {
      try {
        await optionsService.updateOptions(type, defaultOptions[type]);
        console.log(`✓ 已初始化 ${type} 選項`);
      } catch (error) {
        console.error(`✗ 初始化 ${type} 選項失敗:`, error);
        throw error;
      }
    });
    
    await Promise.all(initPromises);
    
    console.log('✓ Firestore 選項資料初始化完成');
    
    // 返回完整的選項資料
    return await optionsService.getAllOptions();
    
  } catch (error) {
    console.error('初始化 Firestore 選項資料失敗:', error);
    throw error;
  }
}

// 重置所有選項資料（開發用）
export async function resetFirestoreOptions() {
  console.log('開始重置 Firestore 選項資料...');
  
  try {
    const resetPromises = Object.entries(defaultOptions).map(async ([type, items]) => {
      try {
        await optionsService.updateOptions(type, items);
        console.log(`✓ 已重置 ${type} 選項`);
      } catch (error) {
        console.error(`✗ 重置 ${type} 選項失敗:`, error);
        throw error;
      }
    });
    
    await Promise.all(resetPromises);
    
    // 清除快取
    optionsService.clearCache();
    
    console.log('✓ Firestore 選項資料重置完成');
    
    return await optionsService.getAllOptions();
    
  } catch (error) {
    console.error('重置 Firestore 選項資料失敗:', error);
    throw error;
  }
}

// 檢查選項資料完整性
export async function checkOptionsIntegrity() {
  try {
    const existingOptions = await optionsService.getAllOptions();
    const requiredTypes = Object.keys(defaultOptions);
    
    const report = {
      isComplete: true,
      missingTypes: [],
      existingTypes: Object.keys(existingOptions),
      details: {}
    };
    
    for (const type of requiredTypes) {
      if (!existingOptions[type]) {
        report.isComplete = false;
        report.missingTypes.push(type);
        report.details[type] = { status: 'missing', count: 0 };
      } else {
        report.details[type] = {
          status: 'exists',
          count: existingOptions[type].length,
          items: existingOptions[type].map(item => item.label)
        };
      }
    }
    
    return report;
  } catch (error) {
    console.error('檢查選項完整性失敗:', error);
    throw error;
  }
}
