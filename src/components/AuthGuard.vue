<template>
  <div class="auth-guard">
    <!-- 載入狀態 -->
    <div v-if="isLoading" class="auth-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">載入中...</div>
    </div>
    
    <!-- 已登入：顯示內容 -->
    <div v-else-if="user" class="auth-content">
      <slot />
    </div>
    
    <!-- 未登入：顯示登入提示 -->
    <div v-else class="auth-required">
      <div class="auth-prompt">
        <h2 class="auth-title">請先註冊會員</h2>
        <p class="auth-message">此功能需要登入後才能使用</p>
        
        <div class="auth-actions">
          <BaseButton 
            variant="primary" 
            size="default" 
            @click="goToLogin"
            class="login-btn"
          >
            前往登入
          </BaseButton>
          
          <BaseButton 
            variant="secondary" 
            size="default" 
            @click="goToExplore"
            class="explore-btn"
          >
            瀏覽問卷
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseButton from './BaseButton.vue'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { user, isLoading } = useAuth()

// 前往登入頁面
const goToLogin = () => {
  router.push('/auth')
}

// 前往探索頁面
const goToExplore = () => {
  router.push('/')
}
</script>

<style scoped>
.auth-guard {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 24px;
}

.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--text);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--muted);
}

.auth-content {
  width: 100%;
}

.auth-required {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.auth-prompt {
  text-align: center;
  max-width: 400px;
}

.auth-icon {
  font-size: 48px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.auth-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
}

.auth-message {
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.auth-actions {
  display: flex;
  gap: 12px;
}

.login-btn,
.explore-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.google-icon {
  flex-shrink: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .auth-guard {
    min-height: 70vh;
    padding: 24px 16px;
  }
  
  .auth-title {
    font-size: 20px;
  }
  
  .auth-prompt {
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .auth-guard {
    min-height: 60vh;
    padding: 16px 12px;
  }
  
  .auth-title {
    font-size: 18px;
  }
  
  .auth-prompt {
    max-width: 280px;
  }
}
</style>
