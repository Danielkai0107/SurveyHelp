<template>
  <AuthGuard>
    <div class="card text-center p-8">
    <!-- 載入狀態 -->
    <div v-if="isLoading" class="mb-6">
      <div style="font-size:48px; margin-bottom:16px">⏳</div>
      <h2 class="mb-3">準備中...</h2>
      <p class="text-muted">正在建立作答會話，請稍候</p>
    </div>
    
    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="mb-6">
      <div style="font-size:48px; margin-bottom:16px">❌</div>
      <h2 class="mb-3">載入失敗</h2>
      <p class="text-muted">{{ error }}</p>
    </div>
    
    <!-- 正常狀態 -->
    <div v-else class="mb-6">
      <div style="font-size:48px; margin-bottom:16px">🚀</div>
      <h2 class="mb-3">準備開始填答</h2>
      <p class="text-muted">已建立作答會話，將在 <span class="font-semibold" style="color:var(--primary)">{{ sec }}</span> 秒後自動開啟外部問卷</p>
    </div>
    
    <div class="mb-6">
      <div class="progress" style="height:4px; margin:0 auto; max-width:200px">
        <div :style="{ width: ((3-sec)/3*100) + '%' }"></div>
      </div>
    </div>
    
    <div v-if="!isLoading && !error" class="flex gap-3 justify-center">
      <BaseButton variant="primary" size="default" @click="openSurvey">
        ⚡ 立即前往
      </BaseButton>
      <BaseButton variant="secondary" size="default" :to="`/s/${$route.params.id}`">
        ← 取消返回
      </BaseButton>
    </div>
    
    <div class="mt-6 p-4 rounded-lg" style="background:var(--hover)">
      <p class="text-muted" style="font-size:14px; margin:0">
        💡 提醒：完成問卷後，請點擊問卷最後的「返回驗證」連結來獲得積分獎勵
      </p>
    </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import AuthGuard from '../components/AuthGuard.vue'
import { responsesService } from '../services/responses.js'
import { surveyService } from '../services/firebase.js'
const route = useRoute()
const sec = ref(3)
const surveyLink = ref('')
const isLoading = ref(true)
const error = ref('')
let timer

// 初始化：載入問卷並創建 pending response
onMounted(async () => {
  try {
    const surveyId = route.params.id
    console.log('開始作答流程，問卷 ID:', surveyId)
    
    // 1. 載入問卷資訊
    const survey = await surveyService.getSurvey(surveyId)
    surveyLink.value = survey.link
    console.log('問卷連結:', survey.link)
    
    // 2. 創建待驗證回應記錄
    const response = await responsesService.createPendingResponse(surveyId)
    console.log('待驗證記錄:', response)
    
    isLoading.value = false
    
    // 3. 開始倒數計時
    timer = setInterval(() => {
      sec.value--
      if (sec.value <= 0) {
        openSurvey()
        clearInterval(timer)
      }
    }, 1000)
    
  } catch (err) {
    console.error('初始化失敗:', err)
    error.value = '載入失敗，請稍後再試'
    isLoading.value = false
  }
})

// 開啟問卷
const openSurvey = () => {
  if (surveyLink.value) {
    window.open(surveyLink.value, '_blank', 'noopener,noreferrer')
  } else {
    alert('問卷連結不存在')
  }
}

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
