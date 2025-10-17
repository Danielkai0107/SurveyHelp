<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">歡迎使用 SurveyHelp</h1>
        <p class="auth-subtitle">使用 Google 帳號快速登入</p>
      </div>
      
      <div class="auth-content">
        <BaseButton 
          variant="primary" 
          size="default" 
          @click="signInWithGoogle"
          :disabled="isLoading"
          class="google-signin-btn"
        >
          <svg class="google-icon" style="margin-right: 12px;" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ isLoading ? '登入中...' : '使用 Google 登入' }}
        </BaseButton>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      
      <div class="auth-footer">
        <p class="terms-text">
          登入即表示您同意我們的
          <router-link to="/terms?tab=terms" class="terms-link">服務條款</router-link>
          和
          <router-link to="/terms?tab=privacy" class="terms-link">隱私政策</router-link>
        </p>
      </div>
    </div>

    <!-- 用户资料设置弹窗 -->
    <ProfileSetupModal
      :visible="showProfileSetup"
      :userId="currentUserId"
      @submit="handleProfileSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import ProfileSetupModal from '../components/ProfileSetupModal.vue'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../firebase.js'
import { usersService } from '../services/users.js'

const router = useRouter()
const isLoading = ref(false)
const error = ref('')
const showProfileSetup = ref(false)
const currentUserId = ref('')

// Google 登入
const signInWithGoogle = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const provider = new GoogleAuthProvider()
    
    // 設定 Google 登入參數
    provider.addScope('email')
    provider.addScope('profile')
    
    // 強制顯示帳號選擇器，不自動使用已登入的帳號
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    
    console.log('Google 登入成功:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    })
    
    // 初始化用户资料
    await usersService.initUserProfile(user.uid, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    })
    
    // 检查用户资料是否完整
    const isComplete = await usersService.isProfileComplete(user.uid)
    
    if (!isComplete) {
      // 显示资料设置弹窗
      currentUserId.value = user.uid
      showProfileSetup.value = true
      isLoading.value = false
    } else {
      // 资料完整，处理跳转
      handlePostLoginRedirect()
    }
    
  } catch (err) {
    console.error('Google 登入失敗:', err)
    
    // 處理不同的錯誤類型
    switch (err.code) {
      case 'auth/popup-closed-by-user':
        error.value = '登入已取消'
        break
      case 'auth/popup-blocked':
        error.value = '彈出視窗被阻擋，請允許彈出視窗後重試'
        break
      case 'auth/network-request-failed':
        error.value = '網路連線失敗，請檢查網路後重試'
        break
      default:
        error.value = '登入失敗，請稍後再試'
    }
  } finally {
    // 如果没有显示弹窗，才设置 isLoading 为 false
    if (!showProfileSetup.value) {
      isLoading.value = false
    }
  }
}

// 处理资料设置提交
const handleProfileSubmit = async (profileData) => {
  try {
    // 更新用户资料
    await usersService.updateUserProfile(currentUserId.value, profileData)
    
    console.log('用户资料已保存:', profileData)
    
    // 关闭弹窗
    showProfileSetup.value = false
    
    // 检查是否有待验证的 URL
    const verifyUrl = sessionStorage.getItem('verifyUrl')
    if (verifyUrl) {
      sessionStorage.removeItem('verifyUrl')
      window.location.href = verifyUrl
    } else {
      // 跳转到首页
      router.push('/')
    }
    
  } catch (err) {
    console.error('保存用户资料失败:', err)
    error.value = '保存失败，请稍后再试'
  }
}

// 登入后的跳转处理
const handlePostLoginRedirect = () => {
  // 检查是否有待验证的 URL
  const verifyUrl = sessionStorage.getItem('verifyUrl')
  if (verifyUrl) {
    sessionStorage.removeItem('verifyUrl')
    window.location.href = verifyUrl
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 48px 32px;
  background: white;
  /* 移除陰影 */
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

.auth-content {
  margin-bottom: 32px;
}

.google-signin-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
}

.google-icon {
  flex-shrink: 0;
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

.auth-footer {
  text-align: center;
}

.terms-text {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

.terms-link {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    padding: 32px 24px;
  }
  
  .auth-title {
    font-size: 24px;
  }
  
  .google-signin-btn {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 20px;
  }
  
  .auth-title {
    font-size: 22px;
  }
  
  .google-signin-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
