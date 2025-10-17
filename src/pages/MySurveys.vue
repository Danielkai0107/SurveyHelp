<template>
  <AuthGuard>
    <div class="my-surveys-page">
      <!-- 固定標題區域 -->
      <div class="sticky-controls">
        <!-- 頁面標題 -->
        <div class="page-header">
          <h1 class="page-title">我的貼文</h1>
        </div>

        <!-- 標籤篩選 -->
        <div class="tabs-container">
          <button :class="['tab-btn', { active: tab === 'all' }]" @click="tab='all'">全部</button>
          <button :class="['tab-btn', { active: tab === 'active' }]" @click="tab='active'">上架中</button>
          <button :class="['tab-btn', { active: tab === 'inactive' }]" @click="tab='inactive'">已下架</button>
          <button :class="['tab-btn', { active: tab === 'completed' }]" @click="tab='completed'">已完成</button>
        </div>
      </div>

      <!-- 可滾動內容區域 -->
      <div class="scrollable-content">
        <!-- 載入狀態 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-text">載入中...</div>
        </div>
        
        <!-- 問卷列表 -->
        <div v-else-if="filteredSurveys.length" class="surveys-container">
          <SurveyItem 
            v-for="survey in filteredSurveys" 
            :key="survey.id" 
            :survey="survey"
            @click="goToSurveyDetail"
          />
        </div>
        
        <!-- 空狀態 -->
        <div v-else class="empty-state">
          <div class="empty-title">暫無問卷</div>
          <div class="empty-description">
            發布您的第一個問卷吧
          </div>
        </div>
      </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import SurveyItem from '../components/SurveyItem.vue'
import AuthGuard from '../components/AuthGuard.vue'
import { surveyService } from '../services/firebase.js'
import { useAuth } from '../composables/useAuth.js'

const { user } = useAuth()

// 狀態管理
const tab = ref('all')
const allSurveys = ref([])
const isLoading = ref(false)

// 載入我的問卷
const loadMySurveys = async () => {
  if (!user.value) return
  
  try {
    isLoading.value = true
    console.log('載入我的問卷...')
    
    // 獲取用戶發布的問卷
    const surveys = await surveyService.getUserSurveys(user.value.uid)
    
    // 載入詳細資訊
    const enrichedSurveys = await Promise.all(
      surveys.map(async (survey) => {
        try {
          const detailedSurvey = await surveyService.getSurveyWithLabels(survey.id)
          return {
            ...detailedSurvey,
            status: getSurveyStatus(detailedSurvey)
          }
        } catch (error) {
          console.error('載入問卷詳情失敗:', error)
          return {
            ...survey,
            status: 'error'
          }
        }
      })
    )
    
    allSurveys.value = enrichedSurveys
    console.log('載入完成，共', enrichedSurveys.length, '個問卷')
    
  } catch (error) {
    console.error('載入我的問卷失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 計算問卷狀態
const getSurveyStatus = (survey) => {
  const filled = survey.filled || 0
  const target = survey.targetCount || survey.target || 1
  const progress = (filled / target) * 100
  
  if (survey.isActive === false) {
    return 'inactive'
  } else if (progress >= 100) {
    return 'completed'
  } else {
    return 'active'
  }
}

// 獲取狀態文字
const getStatusText = (survey) => {
  switch (survey.status) {
    case 'active': return '上架中'
    case 'inactive': return '已下架'
    case 'completed': return '已完成'
    default: return '未知'
  }
}

// 獲取狀態樣式
const getStatusClass = (survey) => {
  switch (survey.status) {
    case 'active': return 'success'
    case 'completed': return 'info'
    case 'inactive': return 'warn'
    default: return ''
  }
}

// 篩選問卷
const filteredSurveys = computed(() => {
  if (tab.value === 'all') return allSurveys.value
  
  return allSurveys.value.filter(survey => {
    return survey.status === tab.value
  })
})

// 跳轉到問卷詳情
const goToSurveyDetail = (survey) => {
  window.location.href = `/s/${survey.id}`
}

// 初始化
onMounted(() => {
  loadMySurveys()
})
</script>

<style scoped>
.my-surveys-page {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 固定標題區域 */
.sticky-controls {
  position: sticky;
  top: 64px;
  background: #ffffff;
  z-index: 160;
  padding: 24px 32px;
  width: calc(100% + 64px);
  margin-left: -32px;
  overflow: visible;
  min-width: 0;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  display: flex;
  align-items: center;
  height: 64px;
  font-size: 40px;
  font-weight: 400;
  color: var(--text);
  margin: 0;
}

/* 標籤篩選 */
.tabs-container {
  display: flex;
  gap: 0;
  margin-bottom: 0;
  border-bottom: 1px solid var(--border);
}

/* 可滾動內容區域 */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 400;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  color: var(--text);
  border-bottom-color: var(--text);
}

/* 載入狀態 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-text {
  font-size: 16px;
  color: var(--muted);
}

/* 空狀態 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 400;
  color: #6c6c6c;
}

.empty-description {
  font-size: 13px;
  color: #9d9d9d;
  max-width: 400px;
  line-height: 1.5;
}

/* 列表容器 */
.surveys-container {
  display: flex;
  flex-direction: column;
}


/* 響應式設計 */
@media (max-width: 1200px) {
  .sticky-controls {
    padding: 20px 24px;
    width: calc(100% + 48px);
    margin-left: -24px;
  }
  
  .scrollable-content {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .sticky-controls {
    padding: 16px 20px;
    width: calc(100% + 40px);
    margin-left: -20px;
  }
  
  .scrollable-content {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .tabs-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-btn {
    flex-shrink: 0;
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .sticky-controls {
    padding: 12px 16px;
    width: calc(100% + 32px);
    margin-left: -16px;
  }
  
  .scrollable-content {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
