<template>
  <AuthGuard>
    <div class="my-surveys-page">
      <!-- 固定標題區域 -->
      <div class="sticky-header">
        <!-- 頁面標題 -->
        <div class="page-header">
          <h1 class="page-title">我發布的問卷</h1>
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
        <div v-for="survey in filteredSurveys" :key="survey.id" class="survey-item" @click="goToSurveyDetail(survey)">
          <div class="survey-item-container">
      <!-- 左側內容 -->
      <div class="survey-content">
            <div class="survey-header">
              <div class="survey-category">{{ survey.fieldLabel || survey.field }}</div>
              <div class="survey-date">{{ formatRelativeTime(survey.createdAt) }}</div>
            </div>
            
            <h3 class="survey-title">{{ survey.title }}</h3>
            
            <div class="survey-info">
              <div class="info-item">
                <span class="info-label">領域：</span>
                <span class="info-value">{{ survey.fieldLabel || survey.field }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">語言：</span>
                <span class="info-value">{{ survey.languageLabel || survey.language }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">時間：</span>
                <span class="info-value">{{ survey.minutes }} 分鐘</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">獎勵：</span>
                <span class="info-value">+{{ survey.incentive }} 積分</span>
              </div>
            </div>

            <!-- 標籤 -->
            <div v-if="survey.tagsLabels && survey.tagsLabels.length" class="tags-section">
              <span v-for="tag in survey.tagsLabels.slice(0, 3)" :key="tag" class="tag-badge">
                {{ tag }}
              </span>
              <span v-if="survey.tagsLabels.length > 3" class="tag-badge more">
                +{{ survey.tagsLabels.length - 3 }}
              </span>
            </div>
          </div>
          <!-- 右側狀態和操作 -->
          <div class="survey-status-info">
            <div class="status-badge" :class="getStatusClass(survey)">
              {{ getStatusText(survey) }}
            </div>
            
            <!-- 進度條 -->
            <div class="progress-info">
              <div class="progress-text">{{ survey.filled || 0 }}/{{ survey.targetCount || survey.target }} 人</div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.min(100, ((survey.filled || 0) / (survey.targetCount || survey.target || 1)) * 100) + '%' }"
                ></div>
              </div>
              <div class="progress-percentage">{{ Math.round(((survey.filled || 0) / (survey.targetCount || survey.target || 1)) * 100) }}%</div>
            </div>
          </div>
          </div>
    
        </div>
        </div>
        
        <EmptyState v-else title="暫無問卷" subtitle="發布您的第一個問卷吧" ctaText="發起互填" to="/publish" />
      </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import BaseButton from '../components/BaseButton.vue'
import AuthGuard from '../components/AuthGuard.vue'
import { surveyService } from '../services/firebase.js'
import { useAuth } from '../composables/useAuth.js'
import { formatRelativeTime } from '../utils/dateFormatter.js'

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
.sticky-header {
  position: sticky;
  top: 64px;
  background: #ffffff;
  z-index: 160;
  padding: 24px 32px 0;
  width: calc(100% + 64px);
  margin-left: -32px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
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

/* 列表容器 */
.surveys-container {
  display: flex;
  flex-direction: column;
}

/* 列表項目 */
.survey-item {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
}

.survey-item-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.survey-item:hover .survey-title {
  transform: scale(1.1);
}

.survey-item:last-child {
  border-bottom: none;
}

/* 左側內容 */
.survey-content {
  flex: 1;
  min-width: 0;
}

.survey-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.survey-category {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
}

.survey-date {
  font-size: 12px;
  color: var(--muted);
}

.survey-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
  line-height: 1.3;
  transition: transform 0.2s ease;
  transform-origin: left center;
}

.survey-info {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  gap: 4px;
  font-size: 13px;
}

.info-label {
  color: var(--muted);
}

.info-value {
  color: var(--text);
  font-weight: 500;
}

/* 標籤區域 */
.tags-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  background: #f3f4f6;
  color: var(--text);
  font-weight: 500;
}

.tag-badge.more {
  background: #e5e7eb;
  color: var(--muted);
}

/* 右側操作區 */
.survey-actions {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
  min-width: 200px;
}

.survey-status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
  min-width: 200px;
}

.status-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.warn {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.info {
  background: #dbeafe;
  color: #1d4ed8;
}

/* 進度資訊 */
.progress-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  width: 120px;
}

.progress-text {
  font-size: 12px;
  color: var(--muted);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #22c55e;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 11px;
  color: var(--muted);
}


/* 響應式設計 */
@media (max-width: 1200px) {
  .sticky-header {
    padding: 20px 24px 0;
    width: calc(100% + 48px);
    margin-left: -24px;
  }
  
}

@media (max-width: 768px) {
  .sticky-header {
    padding: 16px 20px 0;
    width: calc(100% + 40px);
    margin-left: -20px;
  }
  
  .scrollable-content {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .survey-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px 0;
  }
  
  .survey-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
  }
  
  .progress-info {
    align-items: flex-start;
  }
  
  .survey-info {
    flex-direction: column;
    gap: 8px;
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
  .sticky-header {
    padding: 12px 16px 0;
    width: calc(100% + 32px);
    margin-left: -16px;
  }
  
  .scrollable-content {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .survey-item {
    padding: 20px 0;
  }
  
  .survey-title {
    font-size: 18px;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
