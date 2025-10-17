<template>
  <AuthGuard>
    <div class="page-wrapper">
    <div class="success-container">
      <h2 class="title">發布成功 🎉</h2>
      <p class="description">您的問卷已成功發布到平台</p>
      <p class="description">驗證連結已在發布流程中提供，請確認已添加到外部問卷</p>
      <p class="description">建議自行測試一次完整流程確保驗證連結正常運作</p>
    
      <div class="button-group">
        <BaseButton variant="primary" size="default" to="/me/surveys">前往「我發布的」</BaseButton>
        <BaseButton variant="secondary" size="default" to="/">回首頁</BaseButton>
      </div>
    </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import BaseButton from '../components/BaseButton.vue'
import AuthGuard from '../components/AuthGuard.vue'
</script>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 24px;
}

.success-container {
  background: var(--card);
  border: none;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 700px;
  width: 100%;
  /* 移除陰影和 hover 效果 */
}

.title{
  font-size: 40px;
  font-weight: 400;
  color: var(--text);
  margin: 0;
  line-height: 1.3;
}


.description{
  font-size: 14px;
  color: var(--muted);
  margin: 24px 0;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 32px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 24px 16px;
    align-items: flex-start;
    padding-top: 80px;
  }
  
  .success-container {
    padding: 24px;
    max-width: 100%;
  }
  
  .title {
    font-size: 28px;
  }
  
  .description {
    font-size: 13px;
    margin: 16px 0;
  }
  
  
  .button-group {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }
}

@media (max-width: 480px) {
  .page-wrapper {
    padding: 16px 12px;
    padding-top: 70px;
  }
  
  .success-container {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .description {
    font-size: 12px;
    margin: 12px 0;
  }
  
  /* 手機版連結樣式由 BaseInput 組件處理 */
}
</style>
