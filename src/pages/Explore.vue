<template>
  <div class="explore-page">
    <!-- 貼齊控制區域 -->
    <div class="sticky-controls">
      <!-- 標題和標籤區域 -->
      <div class="header-section">
        <div class="header-left">
          <div class="header-title">探索問卷</div>
        </div>
        <div class="header-right">
          <div class="controls-right">
          <BaseSelect 
            v-model="selectedFieldFilter" 
            @update:model-value="applyFilters" 
            style="min-width:120px"
            placeholder="所有領域"
          >
            <option value="">所有領域</option>
            <option v-for="field in fieldFilters" :key="field.id" :value="field.id">
              {{ field.label }}
            </option>
          </BaseSelect>
          <BaseSelect 
            v-model="selectedTopicFilter" 
            @update:model-value="applyFilters" 
            style="min-width:120px"
            placeholder="所有主題"
          >
            <option value="">所有主題</option>
            <option v-for="topic in topicFilters" :key="topic.id" :value="topic.id">
              {{ topic.label }}
            </option>
          </BaseSelect>
          <BaseSelect 
            v-model="sortBy" 
            @update:model-value="applySort" 
            style="min-width:140px"
          >
            <option value="date">最新</option>
            <option value="popularity">最受歡迎</option>
            <option value="title">標題</option>
          </BaseSelect>
        </div>
        </div>
      </div>
       <!-- 主要標籤區域 -->
    <div class="main-tabs-section">
      <div class="main-tabs">
        <button 
          v-for="tab in mainTabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeMainTab === tab.id }]"
          @click="setActiveMainTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    </div>

   

    <!-- 內容區域 -->
    <div class="content-area">
      <!-- 載入狀態 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">載入中...</div>
      </div>
      
      <!-- 內容列表 -->
      <div v-else-if="paginatedContent.length > 0" class="survey-container list">
        <SurveyCard 
          v-for="(item, index) in paginatedContent" 
          :key="item.id" 
          :survey="item"
          :index="index"
          :viewMode="'list'"
        />
      </div>
      
      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <div class="empty-title">暫無問卷</div>
        <div class="empty-description">
          目前沒有符合條件的問卷，請嘗試調整篩選條件或稍後再來看看。
        </div>
      </div>

      <!-- 顯示更多按鈕 -->
      <div class="load-more-section" v-if="hasMoreItems">
        <button class="load-more-btn" @click="loadMore">
          顯示更多
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import SurveyCard from '../components/SurveyCard.vue'
import BaseSelect from '../components/BaseSelect.vue'
import { useOptions } from '../composables/useOptions.js'
import { useAuth } from '../composables/useAuth.js'
import { surveyService } from '../services/firebase.js'
import { responsesService } from '../services/responses.js'

// 主要標籤
const mainTabs = ref([
  { id: 'all', label: '全部' },
  { id: 'earn-points', label: '賺積分' },
  { id: 'mutual', label: '互惠專區' }
])

const activeMainTab = ref('all')

// 使用 Firestore 選項
const { allOptions, initOptions } = useOptions()
const { user } = useAuth()

// 計算篩選選項
const fieldFilters = computed(() => allOptions.value.fields || [])
const topicFilters = computed(() => allOptions.value.topics || [])

// 選中的篩選項
const selectedFieldFilter = ref('')
const selectedTopicFilter = ref('')

// 排序
const sortBy = ref('date')
const displayCount = ref(15) // 預設顯示15個
const loadMoreIncrement = 5 // 每次加載5個

// 移除滾動狀態相關變數

// 問卷資料（從 Firestore 載入）
const allContent = ref([])
// 用戶已完成的問卷ID列表
const completedSurveyIds = ref(new Set())

// 篩選後的內容
const filteredContent = computed(() => {
  let content = allContent.value

  // 過濾掉用戶自己發布的問卷
  if (user.value) {
    content = content.filter(item => item.createdBy !== user.value.uid)
  }

  // 過濾掉用戶已完成的問卷
  if (user.value && completedSurveyIds.value.size > 0) {
    content = content.filter(item => !completedSurveyIds.value.has(item.id))
  }

  // 主要標籤篩選
  if (activeMainTab.value !== 'all') {
    content = content.filter(item => {
      switch (activeMainTab.value) {
        case 'earn-points':
          // 賺積分：顯示高積分獎勵的問卷（≥3積分）
          return (item.incentive || 0) >= 3
        case 'mutual':
          // 互惠專區：顯示適合互填的問卷（可以根據需要調整條件）
          return (item.incentive || 0) >= 8 && (item.filled || 0) < (item.targetCount || item.target || 1) * 0.8
        default:
          return true
      }
    })
  }

  return content
})

// 顯示內容（基於 displayCount）
const paginatedContent = computed(() => {
  return filteredContent.value.slice(0, displayCount.value)
})

// 是否還有更多項目
const hasMoreItems = computed(() => {
  return filteredContent.value.length > displayCount.value
})

// 方法
const setActiveMainTab = (tabId) => {
  activeMainTab.value = tabId
  displayCount.value = 15 // 重置顯示數量
}

const applyFilters = async () => {
  displayCount.value = 15 // 重置顯示數量
  await loadSurveys()
}

const clearFilters = async () => {
  selectedFieldFilter.value = ''
  selectedTopicFilter.value = ''
  displayCount.value = 15 // 重置顯示數量
  await loadSurveys()
}

const applySort = () => {
  // 排序邏輯可以在這裡實現
  displayCount.value = 15 // 重置顯示數量
}

const loadMore = () => {
  displayCount.value += loadMoreIncrement
}

// 載入問卷資料
const isLoading = ref(false)

// 監聽用戶登入狀態變化
watch(user, async (newUser, oldUser) => {
  // 當用戶從未登入變為登入，或從登入變為未登入時
  if (newUser?.uid !== oldUser?.uid) {
    console.log('用戶狀態變化，重新載入已完成問卷列表')
    await loadCompletedSurveys()
  }
})

// 載入用戶已完成的問卷
const loadCompletedSurveys = async () => {
  if (!user.value) {
    completedSurveyIds.value = new Set()
    return
  }
  
  try {
    const responses = await responsesService.getUserResponses(user.value.uid)
    // 只統計已完成狀態的回應
    const completedIds = responses
      .filter(r => r.status === 'completed')
      .map(r => r.surveyId)
    completedSurveyIds.value = new Set(completedIds)
    console.log('用戶已完成的問卷數量:', completedSurveyIds.value.size)
  } catch (error) {
    console.error('載入已完成問卷失敗:', error)
    completedSurveyIds.value = new Set()
  }
}

const loadSurveys = async () => {
  isLoading.value = true
  try {
    // 根據篩選條件載入問卷
    const filters = {}
    if (selectedFieldFilter.value) {
      filters.field = selectedFieldFilter.value
    }
    if (selectedTopicFilter.value) {
      filters.topics = [selectedTopicFilter.value]
    }
    
    const surveys = await surveyService.getSurveysWithFilters(filters)
    allContent.value = surveys
  } catch (error) {
    console.error('載入問卷失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 監聽積分更新事件（驗證完成後觸發）
const handlePointsUpdate = async () => {
  console.log('Explore: 收到積分更新事件，重新載入已完成問卷列表')
  await loadCompletedSurveys()
}

// 初始化
onMounted(async () => {
  try {
    // 先載入問卷（不管用戶是否登入）
    await Promise.all([
      initOptions(),
      loadSurveys()
    ])
    // 如果用戶已登入，再載入已完成的問卷列表
    if (user.value) {
      await loadCompletedSurveys()
    }
    
    // 監聽積分更新事件
    window.addEventListener('points-updated', handlePointsUpdate)
  } catch (error) {
    console.error('初始化失敗:', error)
  }
})

// 清理
onUnmounted(() => {
  window.removeEventListener('points-updated', handlePointsUpdate)
})
</script>

<style scoped>
.explore-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* 貼齊控制區域 */
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


/* 標題和標籤區域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 主要標籤區域 */
.main-tabs-section {
  margin-top: 32px;
}

.main-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
}

.main-tabs .tab-btn {
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

.main-tabs .tab-btn:hover {
  color: var(--text);
}

.main-tabs .tab-btn.active {
  color: var(--text);
  border-bottom-color: var(--text);
}


.header-left h1 {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  color: var(--text);
}

.header-title {
  font-size: 40px;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 主要標籤 */
.main-tabs {
  display: flex;
  gap: 0;
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

/* 控制區域 */
.content-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0; /* 允許彈性收縮 */
  overflow: visible;
}


.controls-left {
  color: var(--muted);
  font-size: 14px;
  flex-shrink: 0; /* 保持固定尺寸 */
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  flex: 1; /* 填滿可用空間 */
  justify-content: flex-end;
  min-width: 0; /* 允許內部元素彈性收縮 */
  max-width: 100%; /* 不超出容器 */
}

/* Explore 頁面專用的下拉選單樣式 */
.controls-right .input {
  height: 40px;
  padding: 8px 16px;
  padding-right: 40px;
  font-size: 14px;
  border-radius: 20px;
  min-width: 100px;
  flex: 1; /* 彈性填滿可用空間 */
  max-width: 140px; /* 限制最大寬度 */
}

.controls-right select.input {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
}

.controls-right select.input:focus,
.controls-right select.input:hover {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}


/* 內容區域 */
.content-area {
  min-height: 600px;
  padding: 0 20px;
}

/* 載入狀態 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
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

/* 內容容器 */
.survey-container.list {
  display: flex;
  flex-direction: column;
}

/* 顯示更多按鈕 */
.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.load-more-btn {
  padding: 12px 32px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: var(--hover);
  border-color: var(--text);
}

/* 響應式設計 */

@media (max-width: 1200px) {
  .explore-page {
    max-width: 100%;
    padding: 0 24px;
  }
  
  .sticky-controls {
    padding: 20px 24px;
    width: calc(100% + 48px);
    margin-left: -24px;
  }
}

@media (max-width: 768px) {
  .explore-page {
    padding: 0 16px;
  }
  
  .sticky-controls {
    padding: 16px 20px;
    width: calc(100% + 40px);
    margin-left: -20px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-title {
    font-size: 28px;
  }
  
  .controls-right {
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    justify-content: flex-start;
  }
  
  .controls-right > * {
    min-width: 100px;
    flex: 1;
    max-width: 140px;
  }
  
  .load-more-section {
    margin-top: 32px;
    padding-top: 20px;
  }
  
  .load-more-btn {
    padding: 10px 24px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .explore-page {
    padding: 0 12px;
  }
  
  .sticky-controls {
    padding: 12px 16px;
    width: calc(100% + 32px);
    margin-left: -16px;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .controls-right {
    gap: 6px;
  }
  
  .controls-right > * {
    min-width: 80px;
    max-width: 120px;
    font-size: 13px;
  }
  
  .load-more-btn {
    padding: 8px 20px;
    font-size: 12px;
  }
  
  .survey-container.list {
    gap: 16px;
  }
}
</style>