<template>
  <div class="page-wrapper">
    <div class="verify-container">
    <!-- 未登入提示 -->
    <div v-if="!isAuthenticated && !loading" class="auth-container">
      <h2 class="auth-title">請先登入再進行驗證</h2>
      <p class="auth-message">驗證填答記錄需要登入帳號</p>
      <BaseButton variant="primary" size="default" @click="goToLogin">
        前往登入
      </BaseButton>
    </div>

    <!-- 驗證中 -->
    <div v-else-if="loading" class="mb-6">
      <LoadingSpinner />
      <h2 class="mb-3 mt-4">正在驗證中...</h2>
      <p class="text-muted">請稍候，我們正在確認您的填答記錄</p>
    </div>
    
    <!-- 驗證結果 -->
    <div v-else>
      <template v-if="ok">
        <div class="mb-6">
          <h2 class="title">驗證成功 🎉</h2>
          <div class="points-container">
            <div class="points-breakdown">
              <div class="points-item">
                <span>填答積分：</span>
                <span class="points">+{{ basePoints }}</span>
              </div>
              <div v-if="mutualBonus > 0" class="points-item bonus">
                <span>互惠加成：</span>
                <span class="points">+{{ mutualBonus }}</span>
              </div>
              <div class="points-total">
                <span>總計：</span>
                <span class="points total">+{{ totalPoints }}</span>
              </div>
            </div>
            <div v-if="matchCompleted" class="mutual-completed">
              🎊 互填配對完成！雙方都獲得額外加成
            </div>
          </div>
          <p class="text-muted">感謝您的參與，積分已自動入帳到您的帳戶</p>
        </div>
        
        <div class="flex gap-3 justify-center">
          <BaseButton variant="primary" size="default" to="/">
            回到首頁
          </BaseButton>
          <BaseButton variant="secondary" size="default" to="/me/answers">
            查看我的填答
          </BaseButton>
        </div>
      </template>
      
      <template v-else>
        <div class="mb-6">
          <h2 class="title">驗證失敗 ❌</h2>
          <div class="error-msg-container">
            <p class="error-msg" >{{ reason }}</p>
          </div>
          <p class="text-muted">請檢查填答是否完整，或聯繫客服協助處理</p>
        </div>
        
        <div class="flex gap-3 justify-center">
          <BaseButton variant="primary" size="default" :to="detailLink">
            重新嘗試
          </BaseButton>
          <BaseButton variant="secondary" size="default" to="/">
            回到首頁
          </BaseButton>
        </div>
      </template>
    </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { responsesService } from '../services/responses.js'
import { useAuth } from '../composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { user, isLoading: authLoading } = useAuth()

const loading = ref(true)
const verificationResult = ref(null)
const error = ref('')

// 检查是否已登入
const isAuthenticated = computed(() => {
  return !authLoading.value && !!user.value
})

// 前往登入页面，并保存当前 URL 以便登入后返回
const goToLogin = () => {
  // 保存验证 URL 到 sessionStorage
  sessionStorage.setItem('verifyUrl', window.location.href)
  router.push('/auth')
}

// 驗證流程
onMounted(async () => {
  try {
    const surveyId = route.query.surveyId
    console.log('開始驗證流程，問卷 ID:', surveyId)
    
    if (!surveyId) {
      throw new Error('缺少問卷 ID 參數')
    }
    
    // 等待认证状态加载
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 检查是否已登入
    if (!user.value) {
      console.log('用户未登入，等待登入')
      loading.value = false
      return
    }
    
    // 執行驗證
    const result = await responsesService.verifyResponse(surveyId)
    verificationResult.value = result
    
    console.log('驗證結果:', result)
    
  } catch (err) {
    console.error('驗證過程發生錯誤:', err)
    error.value = err.message || '驗證過程發生錯誤'
  } finally {
    loading.value = false
  }
})

// 計算屬性
const ok = computed(() => verificationResult.value?.success || false)
const reason = computed(() => verificationResult.value?.message || error.value || '未知錯誤')
const basePoints = computed(() => verificationResult.value?.basePoints || 0)
const mutualBonus = computed(() => verificationResult.value?.mutualBonus || 0)
const totalPoints = computed(() => verificationResult.value?.totalPoints || 0)
const matchCompleted = computed(() => verificationResult.value?.matchCompleted || false)
const surveyTitle = computed(() => verificationResult.value?.surveyTitle || '')
const detailLink = computed(() => `/s/${route.query.surveyId || 'a1'}`)
</script>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 40px 24px;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
}

.auth-message {
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.title{
  font-size: 40px;
  font-weight: 400;
  color: var(--text);
  margin: 0;
  line-height: 1.3;
  margin-bottom: 24px;
}

.verify-container {
  background: var(--card);
  border: none;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 700px;
  width: 100%;
  /* 移除陰影和 hover 效果 */
}

.points-container {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.error-msg-container {
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.error-msg {
  color: #c53030;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.mt-4 {
  margin-top: 16px;
}

.p-4 {
  padding: 16px;
}

.rounded-lg {
  border-radius: 12px;
}

.text-muted {
  color: var(--muted);
  font-size: 14px;
  margin: 24px 0;
}

.font-medium {
  font-weight: 500;
}

.flex {
  display: flex;
}

.gap-3 {
  gap: 12px;
}

.justify-center {
  justify-content: center;
}

.points-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.points-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #22543d;
}

.points-item.bonus {
  color: #f59e0b;
}

.points-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #22543d;
  padding-top: 8px;
  border-top: 1px solid #9ae6b4;
  margin-top: 8px;
}

.points {
  font-weight: 600;
}

.points.total {
  font-size: 18px;
}

.mutual-completed {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 24px 16px;
    align-items: flex-start;
    padding-top: 80px;
  }
  
  .verify-container {
    padding: 24px;
    max-width: 100%;
  }
  
  .flex {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-wrapper {
    padding: 16px 12px;
    padding-top: 70px;
  }
  
  .verify-container {
    padding: 20px;
  }
}
</style>
