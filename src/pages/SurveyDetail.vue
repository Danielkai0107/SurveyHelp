<template>
  <div class="survey-detail-container">
    <!-- 頂部操作區 -->
    <div class="header-actions">
      <button @click="goBack" class="back-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <div class="action-buttons-header">
        <button class="action-btn-icon" @click="shareSurvey" title="分享問卷">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16,6 12,2 8,6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
        <button class="action-btn-icon" @click="bookmarkSurvey" title="收藏問卷">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </button>
        <button class="action-btn-icon" @click="reportSurvey" title="舉報問題">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-text">載入中...</div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-container">
      <div class="error-text">{{ error }}</div>
      <BaseButton variant="secondary" @click="loadSurvey">重試</BaseButton>
    </div>

    <!-- 主要內容區 -->
    <div v-else class="main-content">
      <!-- 左側內容 -->
      <div class="left-content">
        <!-- 問卷標題區 -->
        <div class="survey-header">
          <div class="survey-meta">
            <span class="survey-category">{{ s.fieldLabel || s.field }}</span>
            <span class="survey-date">{{ formatDate(s.createdAt || s.date) }}</span>
          </div>
          <h1 class="survey-title">{{ s.title }} (目標{{ s.targetCount || s.target }}人)</h1>
        </div>

        <!-- 問卷詳情區 -->
        <div class="survey-details">
          <div class="survey-details-content">
            <div class="detail-item">
              <span class="detail-label">領域：</span>
              <span class="detail-value">{{ s.fieldLabel || s.field }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">語言：</span>
              <span class="detail-value">{{ s.languageLabel || s.language }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">時間：</span>
              <span class="detail-value">{{ s.minutes }} 分鐘</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">獎勵：</span>
              <span class="detail-value">+{{ s.incentive }} 積分</span>
            </div>
          </div>
          
          <!-- 標籤區 -->
          <div class="survey-tags" v-if="(s.tagsLabels || s.tags) && (s.tagsLabels || s.tags).length > 0">
            <span v-for="tag in (s.tagsLabels || s.tags)" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        
        <!-- 問卷介紹 -->
        <div class="survey-description">
          <p>{{ s.description }}</p>
        </div>
        
        <!-- 操作按鈕區 -->
        <div class="action-buttons">
          <!-- 未登入用戶 -->
          <BaseButton v-if="!user" variant="primary" size="default" to="/auth">
            前往登入
          </BaseButton>
          
          <!-- 已登入用戶 -->
          <BaseButton v-else variant="primary" size="default" @click="startSurvey">
            開始作答
          </BaseButton>
        </div>

      </div>

      <!-- 右側信息區 -->
      <div class="right-sidebar">
        <!-- 進度條區 -->
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-percentage">{{ Math.round(((s.filled || 0)/(s.targetCount || s.target || 1))*100) }}%</span>
            <span class="progress-label">已完成 {{ Math.round(((s.filled || 0)/(s.targetCount || s.target || 1))*100) }}% 目標</span>
          </div>
          <el-progress 
            :percentage="Math.min(100, Math.round(((s.filled || 0)/(s.targetCount || s.target || 1))*100))" 
            :show-text="false"
            :stroke-width="6"
          />
          <div class="progress-range">
            <span>0%</span>
            <span>100%</span>
          </div>
          <div class="progress-stats">
            <span>已填答 {{ s.filled || 0 }} 人</span>
            <span>目標 {{ s.targetCount || s.target || 0 }} 人</span>
          </div>
        </div>
        
        <div class="info-section">
          <h4 class="info-title">問卷資訊</h4>
          
          <div class="info-item">
            <span class="info-label">發布日期</span>
            <span class="info-value">{{ formatDate(s.createdAt || s.date) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">發布機構</span>
            <div class="assignee">
              <span class="assignee-icon">🏢</span>
              <span class="assignee-name">{{ s.organization || s.org }}</span>
              <span class="assignee-role">{{ s.fieldLabel || s.field }}</span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-label">問卷狀態</span>
            <span class="info-value status" :class="getStatusClass(s)">{{ getStatusText(s) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">完成率</span>
            <span class="info-value">{{ Math.round(((s.filled || 0)/(s.targetCount || s.target || 1))*100) }}%</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">參與統計</span>
            <div class="participation-stats">
              <div class="stat-item">
                <span class="stat-number">{{ s.filled || 0 }}</span>
                <span class="stat-label">已參與</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ (s.targetCount || s.target || 0) - (s.filled || 0) }}</span>
                <span class="stat-label">剩餘名額</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import { surveyService } from '../services/firebase.js'
import { formatDate } from '../utils/dateFormatter.js'
import { useAuth } from '../composables/useAuth.js'

const route = useRoute()
const router = useRouter()

// 問卷資料
const survey = ref(null)
const isLoading = ref(true)
const error = ref(null)

// 認證狀態
const { user } = useAuth()

// 返回功能
const goBack = () => {
  router.back()
}

// 格式化日期函數已從 utils 導入

// 獲取問卷狀態
const getStatusText = (survey) => {
  if (!survey || (!survey.filled && survey.filled !== 0)) return '載入中'
  
  const filled = survey.filled || 0
  const target = survey.targetCount || survey.target || 1
  const progress = (filled / target) * 100
  
  if (progress >= 100) return '已完成'
  if (progress >= 80) return '即將完成'
  if (survey.isNew) return '新發布'
  return '進行中'
}

const getStatusClass = (survey) => {
  if (!survey || (!survey.filled && survey.filled !== 0)) return 'muted'
  
  const filled = survey.filled || 0
  const target = survey.targetCount || survey.target || 1
  const progress = (filled / target) * 100
  
  if (progress >= 100) return 'success'
  if (progress >= 80) return 'warn'
  if (survey.isNew) return 'success'
  return 'muted'
}

// 快速操作功能
const shareSurvey = () => {
  // 分享問卷功能
  if (navigator.share) {
    navigator.share({
      title: s.value.title,
      text: s.value.description,
      url: window.location.href
    })
  } else {
    // 複製連結到剪貼板
    navigator.clipboard.writeText(window.location.href)
    alert('問卷連結已複製到剪貼板')
  }
}

const bookmarkSurvey = () => {
  // 收藏問卷功能
  alert('問卷已加入收藏')
}

const reportSurvey = () => {
  // 舉報問題功能
  alert('感謝您的回報，我們會盡快處理')
}

// 開始作答功能
const startSurvey = () => {
  if (!survey.value || !survey.value.link) {
    alert('問卷連結不存在')
    return
  }
  
  // 在新分頁開啟問卷連結
  window.open(survey.value.link, '_blank', 'noopener,noreferrer')
}
// 載入問卷資料
const loadSurvey = async () => {
  try {
    isLoading.value = true
    const surveyId = route.params.id
    const surveyData = await surveyService.getSurveyWithLabels(surveyId)
    survey.value = surveyData
  } catch (err) {
    console.error('載入問卷失敗:', err)
    error.value = err.message || '載入問卷失敗'
  } finally {
    isLoading.value = false
  }
}

// 初始化
onMounted(() => {
  loadSurvey()
})

// 計算屬性
const s = computed(() => survey.value || {})

// 移除備用資料，完全使用 Firestore
</script>

<style scoped>
.survey-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 頂部操作區 */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: white;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  border-color: var(--text);
}

.action-buttons-header {
  display: flex;
  gap: 8px;
}

.action-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: white;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-icon:hover {
  border-color: var(--text);
}

/* 主要內容區 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

/* 左側內容 */
.left-content {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

/* 問卷標題區 */
.survey-header {
  margin-bottom: 12px;
}

.survey-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
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
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
  color: var(--text);
}


/* 進度條區 */
.progress-section {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.progress-label {
  font-size: 14px;
  color: var(--muted);
}

.progress-range {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
}

/* 問卷詳情區 */
.survey-details {
  margin-bottom: 24px;
}

.survey-details-content {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  gap: 4px;
  font-size: 13px;
}

.detail-label {
  color: var(--muted);
}

.detail-value {
  color: var(--text);
  font-weight: 500;
}

.survey-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-block;
  font-size: 12px;
  background: #f7fafc;
  border: 1px solid var(--border);
  padding: 4px 12px;
  border-radius: 20px;
  color: var(--text);
  font-weight: 500;
  margin: 0 !important;
}

/* 問卷介紹 */
.survey-description {
  margin-bottom: 32px;
}

.survey-description p {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

/* 操作按鈕區 */
.action-buttons {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.action-buttons .btn {
  text-align: center;
  text-decoration: none;
}

/* 進度統計 */
.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
}

/* 右側信息區 */
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 24px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
}

.info-value {
  font-size: 13px;
  color: var(--text);
}

.assignee {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-icon {
  font-size: 16px;
}

.assignee-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.assignee-role {
  font-size: 12px;
  color: var(--muted);
  background: #f7fafc;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.members {
  display: flex;
  align-items: center;
}

.member-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-avatars img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border);
}

.member-count {
  font-size: 12px;
  color: var(--muted);
  background: #f7fafc;
  padding: 2px 6px;
  border-radius: 12px;
  border: 1px solid var(--border);
  margin-left: 4px;
}

/* 參與統計 */
.participation-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
}

.stat-label {
  font-size: 12px;
  color: var(--muted);
}


/* 狀態樣式 */
.status.success {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #22543d;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status.warn {
  background: #fffbeb;
  border: 1px solid #f6e05e;
  color: #744210;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status.muted {
  background: #f8f9fa;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* 載入和錯誤狀態 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-text,
.error-text {
  font-size: 16px;
  color: var(--muted);
}

.error-text {
  color: #ef4444;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .survey-detail-container {
    padding: 16px;
  }
  
  .left-content {
    padding: 24px;
  }
}
</style>
