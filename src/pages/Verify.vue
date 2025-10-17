<template>
  <div class="card text-center p-8">
    <!-- 未登入提示 -->
    <div v-if="!isAuthenticated && !loading" class="mb-6">
      <div style="font-size:48px; margin-bottom:16px">🔐</div>
      <h2 class="mb-3">請先登入</h2>
      <p class="text-muted mb-6">驗證填答記錄需要登入帳號</p>
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
          <div style="font-size:64px; margin-bottom:16px">🎉</div>
          <h2 class="mb-3" style="color:var(--success)">驗證成功！</h2>
          <div class="p-4 rounded-lg mb-4" style="background:#f0fff4; border:1px solid #9ae6b4">
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
            🏠 回到首頁
          </BaseButton>
          <BaseButton variant="secondary" size="default" to="/me/answers">
            📋 查看我的填答
          </BaseButton>
        </div>
      </template>
      
      <template v-else>
        <div class="mb-6">
          <div style="font-size:48px; margin-bottom:16px">❌</div>
          <h2 class="mb-3" style="color:var(--danger)">驗證失敗</h2>
          <div class="p-4 rounded-lg mb-4" style="background:#fed7d7; border:1px solid #fc8181">
            <p class="font-medium" style="color:#c53030; margin:0">{{ reason }}</p>
          </div>
          <p class="text-muted">請檢查填答是否完整，或聯繫客服協助處理</p>
        </div>
        
        <div class="flex gap-3 justify-center">
          <BaseButton variant="primary" size="default" :to="detailLink">
            🔄 重新嘗試
          </BaseButton>
          <BaseButton variant="secondary" size="default" to="/">
            🏠 回到首頁
          </BaseButton>
        </div>
      </template>
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
</style>
