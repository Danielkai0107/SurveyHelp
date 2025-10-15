<template>
  <div class="survey-detail-container">
    <!-- 返回按鈕 -->
    <div class="back-button-container">
      <button @click="goBack" class="back-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    </div>

    <!-- 主要內容區 -->
    <div class="main-content">
      <!-- 左側內容 -->
      <div class="left-content">
        <!-- 問卷標題區 -->
        <div class="survey-header">
          <div class="survey-meta">
            <span class="survey-category">{{ s.field }}</span>
            <span class="survey-date">{{ formatDate(s.date) }}</span>
          </div>
          <h1 class="survey-title">{{ s.title }} (目標{{ s.target }}人)</h1>
          <p class="survey-subtitle">{{ s.description }}</p>
        </div>

        <!-- 進度條區 -->
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-percentage">{{ Math.round((s.filled/s.target)*100) }}%</span>
            <span class="progress-label">已完成 {{ Math.round((s.filled/s.target)*100) }}% 目標</span>
          </div>
          <ProgressBar :value="Math.min(100, Math.round((s.filled/s.target)*100))" />
          <div class="progress-range">
            <span>0%</span>
            <span>100%</span>
          </div>
          <div class="progress-stats">
            <span>已填答 {{ s.filled }} 人</span>
            <span>目標 {{ s.target }} 人</span>
          </div>
        </div>

        <!-- 問卷詳情區 -->
        <div class="survey-details">
          <h3 class="details-title">問卷詳情</h3>
          
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-icon">🏷️</span>
              <div class="detail-content">
                <span class="detail-label">領域</span>
                <span class="detail-value">{{ s.field }}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <span class="detail-icon">🌐</span>
              <div class="detail-content">
                <span class="detail-label">語言</span>
                <span class="detail-value">{{ s.language }}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <span class="detail-icon">⏱️</span>
              <div class="detail-content">
                <span class="detail-label">預估時間</span>
                <span class="detail-value">{{ s.minutes }} 分鐘</span>
              </div>
            </div>
            
            <div class="detail-item">
              <span class="detail-icon">🎁</span>
              <div class="detail-content">
                <span class="detail-label">獎勵</span>
                <span class="detail-value">+{{ s.incentive }} 積分</span>
              </div>
            </div>
          </div>
          
          <!-- 標籤區 -->
          <div class="survey-tags" v-if="s.tags && s.tags.length > 0">
            <span v-for="tag in s.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        
        <!-- 操作按鈕區 -->
        <div class="action-buttons">
          <router-link class="btn btn-primary" :to="`/s/${s.id}/start`">
            🚀 開始作答
          </router-link>
        </div>

      </div>

      <!-- 右側信息區 -->
      <div class="right-sidebar">
        <div class="info-section">
          <h4 class="info-title">問卷資訊</h4>
          
          <div class="info-item">
            <span class="info-label">發布日期</span>
            <span class="info-value">{{ formatDate(s.date) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">發布機構</span>
            <div class="assignee">
              <span class="assignee-icon">🏢</span>
              <span class="assignee-name">{{ s.org }}</span>
              <span class="assignee-role">{{ s.field }}</span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-label">問卷狀態</span>
            <span class="info-value status" :class="getStatusClass(s)">{{ getStatusText(s) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">完成率</span>
            <span class="info-value">{{ Math.round((s.filled/s.target)*100) }}%</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">參與統計</span>
            <div class="participation-stats">
              <div class="stat-item">
                <span class="stat-number">{{ s.filled }}</span>
                <span class="stat-label">已參與</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ s.target - s.filled }}</span>
                <span class="stat-label">剩餘名額</span>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h4 class="actions-title">快速操作</h4>
          <button class="action-btn" @click="shareSurvey">
            <span class="action-icon">📤</span>
            分享問卷
          </button>
          <button class="action-btn" @click="bookmarkSurvey">
            <span class="action-icon">⭐</span>
            收藏問卷
          </button>
          <button class="action-btn" @click="reportSurvey">
            <span class="action-icon">🚨</span>
            舉報問題
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProgressBar from '../components/ProgressBar.vue'

const route = useRoute()
const router = useRouter()

// 返回功能
const goBack = () => {
  router.back()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未設定'
  return date
}

// 獲取問卷狀態
const getStatusText = (survey) => {
  const progress = (survey.filled / survey.target) * 100
  if (progress >= 100) return '已完成'
  if (progress >= 80) return '即將完成'
  if (survey.isNew) return '新發布'
  return '進行中'
}

const getStatusClass = (survey) => {
  const progress = (survey.filled / survey.target) * 100
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
// 使用與 Explore 頁面相同的資料
const surveyData = {
  "s001": {
    id: "s001",
    title: "大學生消費習慣研究",
    org: "NTU Marketing Lab",
    tags: ["校園", "消費行為", "生活型態"],
    field: "學術",
    language: "中文",
    minutes: 6,
    incentive: 10,
    filled: 18,
    target: 50,
    isNew: true,
    date: "2024年1月15日",
    description: "探索大學生在不同情境下的消費決策與偏好。"
  },
  "s002": {
    id: "s002",
    title: "外送平台滿意度與留存因素",
    org: "Biz Research Co.",
    tags: ["餐飲", "服務體驗", "NPS"],
    field: "商業",
    language: "中文",
    minutes: 7,
    incentive: 10,
    filled: 120,
    target: 300,
    isNew: false,
    date: "2024年2月8日",
    description: "評估外送平台的滿意度、推薦意願與流失原因。"
  },
  "s003": {
    id: "s003",
    title: "Remote 工作型態與生產力",
    org: "HR Analytics Group",
    tags: ["遠端工作", "效率", "工具使用"],
    field: "商業",
    language: "English",
    minutes: 8,
    incentive: 12,
    filled: 64,
    target: 120,
    isNew: true,
    date: "2024年3月12日",
    description: "探討混合辦公對個人與團隊生產力的影響。"
  },
  "s004": {
    id: "s004",
    title: "城市綠地使用與心理健康",
    org: "NTPU Soc Lab",
    tags: ["公共空間", "心理健康", "城市規劃"],
    field: "學術",
    language: "中文",
    minutes: 9,
    incentive: 10,
    filled: 27,
    target: 80,
    isNew: false,
    date: "2024年1月20日",
    description: "研究市民接觸綠地的頻率與情緒穩定的關聯。"
  },
  "s005": {
    id: "s005",
    title: "Z 世代金融 App 使用偏好",
    org: "FinTech Insight",
    tags: ["理財", "APP體驗", "通知策略"],
    field: "商業",
    language: "中文",
    minutes: 5,
    incentive: 10,
    filled: 95,
    target: 150,
    isNew: true,
    date: "2024年3月5日",
    description: "了解年輕族群對金融 App 的核心需求與痛點。"
  }
}

const s = computed(() => surveyData[route.params.id] || Object.values(surveyData)[0])
</script>

<style scoped>
.survey-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 返回按鈕 */
.back-button-container {
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: var(--hover);
  border-color: var(--muted);
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
  border-radius: 12px;
  padding: 32px;
}

/* 問卷標題區 */
.survey-header {
  margin-bottom: 32px;
}

.survey-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
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

.survey-subtitle {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

/* 進度條區 */
.progress-section {
  margin-bottom: 32px;
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
  margin-bottom: 32px;
}

.details-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.detail-icon {
  font-size: 16px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}

.survey-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 操作按鈕區 */
.action-buttons {
  margin-top: 24px;
}

.action-buttons .btn {
  width: 100%;
  text-align: center;
  text-decoration: none;
  display: block;
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
  border-radius: 12px;
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

/* 快速操作區 */
.quick-actions {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 24px;
}

.actions-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--hover);
  border-color: var(--primary);
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-icon {
  font-size: 16px;
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
