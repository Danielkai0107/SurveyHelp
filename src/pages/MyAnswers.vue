<template>
  <AuthGuard>
    <div class="my-answers-page">
      <!-- 固定標題區域 -->
      <div class="sticky-header">
        <!-- 頁面標題 -->
        <div class="page-header">
          <h1 class="page-title">回填管理</h1>
        </div>

        <!-- 標籤篩選 -->
        <div class="tabs-container">
          <button :class="['tab-btn', { active: tab === 'all' }]" @click="tab='all'">全部</button>
          <button :class="['tab-btn', { active: tab === 'pending' }]" @click="tab='pending'">未開始</button>
          <button :class="['tab-btn', { active: tab === 'doing' }]" @click="tab='doing'">進行中</button>
          <button :class="['tab-btn', { active: tab === 'done' }]" @click="tab='done'">已完成</button>
          <button :class="['tab-btn', { active: tab === 'expired' }]" @click="tab='expired'">已過期</button>
        </div>
      </div>

      <!-- 可滾動內容區域 -->
      <div class="scrollable-content">
        <!-- 載入狀態 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-text">載入中...</div>
        </div>
        
        <!-- 回填管理列表 -->
        <div v-else-if="list.length" class="matches-container">
        <div v-for="match in list" :key="match.id" class="match-item" @click="handleStartAnswer(match)">
          <!-- 左側內容 -->
          <div class="match-content">
            <div class="match-header">
              <div class="match-category">{{ match.targetSurvey?.fieldLabel || '載入中' }}</div>
              <div class="match-date">{{ formatRelativeTime(match.createdAt) }}</div>
            </div>
            
            <h3 class="match-title">{{ match.targetSurvey?.title || '載入中...' }}</h3>
            
            <div class="match-info">
              <div class="info-item">
                <span class="info-label">角色：</span>
                <span class="info-value">{{ match.role === 'requester' ? '我去填' : '對方幫我填' }}</span>
              </div>
              
              <div v-if="match.mySurvey" class="info-item">
                <span class="info-label">配對問卷：</span>
                <span class="info-value">{{ match.mySurvey.title }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">截止時間：</span>
                <span class="info-value" :class="{ expired: match.timeRemaining?.expired }">
                  {{ match.timeRemaining?.text || '計算中...' }}
                </span>
              </div>
            </div>

            <!-- 積分資訊 -->
            <div class="points-section">
              <span v-if="match.points?.earned > 0" class="point-badge earned">
                已得 +{{ match.points.earned }}
              </span>
              <span v-if="match.points?.potential > 0" class="point-badge potential">
                可得 +{{ match.points.potential }}
              </span>
              <span v-if="match.points?.pendingMutual > 0" class="point-badge mutual">
                互惠待觸發 +{{ match.points.pendingMutual }}
              </span>
            </div>
          </div>

          <!-- 右側狀態和操作 -->
          <div class="match-actions">
            <div class="status-badge" :class="badge(match.status)">
              {{ match.statusText }}
            </div>
            
            <!-- 操作按鈕 -->
            <div class="action-buttons" @click.stop>
              <!-- 未開始狀態 -->
              <BaseButton 
                v-if="match.status === 'pending'" 
                variant="primary" 
                size="small"
                @click="handleStartAnswer(match)"
              >
                開始作答
              </BaseButton>
              
              <!-- 進行中狀態 -->
              <template v-else-if="match.status === 'doing'">
                <BaseButton 
                  variant="primary" 
                  size="small"
                  @click="reopenSurvey(match)"
                >
                  繼續填答
                </BaseButton>
              </template>
              
              <!-- 已完成狀態 -->
              <div v-else-if="match.status === 'done'" class="completed-badge">
                ✅ 已完成
              </div>
              
              <!-- 已過期狀態 -->
              <div v-else-if="match.status === 'expired'" class="expired-badge">
                ⏰ 已過期
              </div>
    </div>
          </div>
        </div>
      </div>
    <EmptyState v-else title="暫無資料" subtitle="去探索頁看看吧" ctaText="探索問卷" to="/" />
  </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import BaseButton from '../components/BaseButton.vue'
import AuthGuard from '../components/AuthGuard.vue'
import { matchesService } from '../services/matches.js'
import { responsesService } from '../services/responses.js'
import { surveyService } from '../services/firebase.js'
import { useAuth } from '../composables/useAuth.js'
import { formatRelativeTime } from '../utils/dateFormatter.js'
const { user } = useAuth()

// 狀態管理
const tab = ref('all')
const allMatches = ref([])
const isLoading = ref(false)

// 載入回填管理資料
const loadMatches = async () => {
  if (!user.value) return
  
  try {
    isLoading.value = true
    console.log('載入回填管理資料...')
    
    // 獲取用戶的所有配對記錄
    const matches = await matchesService.getUserMatches(user.value.uid)
    
    // 為每個配對載入詳細資訊
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        try {
          // 載入目標問卷資訊
          const targetSurvey = await surveyService.getSurveyWithLabels(
            match.role === 'requester' ? match.ownerSurveyId : match.selectedMySurveyId
          )
          
          // 載入我的問卷資訊（如果有選擇）
          let mySurvey = null
          if (match.selectedMySurveyId && match.role === 'requester') {
            mySurvey = await surveyService.getSurveyWithLabels(match.selectedMySurveyId)
          } else if (match.ownerSurveyId && match.role === 'counterpart') {
            mySurvey = await surveyService.getSurveyWithLabels(match.ownerSurveyId)
          }
          
          // 計算狀態
          const status = getMatchStatus(match)
          const timeRemaining = matchesService.calculateTimeRemaining(match.expireAt)
          
          return {
            ...match,
            targetSurvey,
            mySurvey,
            status: status.status,
            statusText: status.text,
            timeRemaining,
            points: calculatePoints(match)
          }
        } catch (error) {
          console.error('載入配對詳情失敗:', error)
          return {
            ...match,
            targetSurvey: { title: '載入失敗', id: match.ownerSurveyId },
            status: 'error',
            statusText: '載入失敗'
          }
        }
      })
    )
    
    allMatches.value = enrichedMatches
    console.log('載入完成，共', enrichedMatches.length, '個配對')
    
  } catch (error) {
    console.error('載入回填管理失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 計算配對狀態
const getMatchStatus = (match) => {
  const now = new Date()
  const expireDate = match.expireAt?.toDate ? match.expireAt.toDate() : new Date(match.expireAt)
  
  if (match.status === 'closed_expired') {
    return { status: 'expired', text: '已過期' }
  }
  
  if (now > expireDate) {
    return { status: 'expired', text: '已過期' }
  }
  
  if (match.role === 'requester') {
    if (match.requesterDone) {
      return { status: 'done', text: '已完成' }
    } else {
      return { status: 'doing', text: '進行中' }
    }
  } else {
    // counterpart
    if (match.counterpartDone) {
      return { status: 'done', text: '已完成' }
    } else if (match.counterpartResponseId) {
      return { status: 'doing', text: '進行中' }
    } else {
      return { status: 'pending', text: '未開始' }
    }
  }
}

// 計算積分
const calculatePoints = (match) => {
  const role = match.role
  const isDone = role === 'requester' ? match.requesterDone : match.counterpartDone
  const points = role === 'requester' ? match.requesterPoints : match.counterpartPoints
  
  return {
    earned: points || 0,
    potential: isDone ? 0 : 10,
    mutualBonus: (match.status === 'closed' && isDone) ? match.mutualBonus : 0,
    pendingMutual: (match.status === 'open' && isDone) ? match.mutualBonus : 0
  }
}

// 篩選列表
const filteredMatches = computed(() => {
  if (tab.value === 'all') return allMatches.value
  
  return allMatches.value.filter(match => {
    switch (tab.value) {
      case 'pending':
        return match.status === 'pending'
      case 'doing':
        return match.status === 'doing'
      case 'done':
        return match.status === 'done'
      case 'expired':
        return match.status === 'expired'
      default:
        return true
    }
  })
})

const list = computed(() => filteredMatches.value)
const badge = (status) => {
  switch (status) {
    case 'done': return 'success'
    case 'doing': return 'warn'
    case 'pending': return 'info'
    case 'expired': return 'danger'
    default: return ''
  }
}

// 處理開始作答
const handleStartAnswer = (match) => {
  // 跳轉到問卷詳情頁
  window.location.href = `/s/${match.targetSurvey.id}`
}

// 重新前往外部問卷
const reopenSurvey = (match) => {
  if (match.targetSurvey?.link) {
    window.open(match.targetSurvey.link, '_blank', 'noopener,noreferrer')
  } else {
    alert('問卷連結不存在')
  }
}

// 複製驗證連結
const copyVerifyLink = (match) => {
  const link = responsesService.generateVerifyLink(match.targetSurvey.id)
  navigator.clipboard.writeText(link).then(() => {
    alert('驗證連結已複製到剪貼板')
  })
}

// 初始化
onMounted(() => {
  loadMatches()
})
</script>

<style scoped>
.my-answers-page {
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
  padding: 0 32px;
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
.matches-container {
  display: flex;
  flex-direction: column;
}

/* 列表項目 */
.match-item {
  display: flex;
  align-items: center;
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.match-item:hover .match-title {
  transform: scale(1.1);
}

.match-item:last-child {
  border-bottom: none;
}

/* 左側內容 */
.match-content {
  flex: 1;
  min-width: 0;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.match-category {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
}

.match-date {
  font-size: 12px;
  color: var(--muted);
}

.match-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
  line-height: 1.3;
  transition: transform 0.2s ease;
  transform-origin: left center;
}

.match-info {
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

.info-value.expired {
  color: #ef4444;
}

/* 積分區域 */
.points-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.point-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.point-badge.earned {
  background: #dcfce7;
  color: #166534;
}

.point-badge.potential {
  background: #dbeafe;
  color: #1d4ed8;
}

.point-badge.mutual {
  background: #fef3c7;
  color: #92400e;
}

/* 右側操作區 */
.match-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
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

.status-badge.danger {
  background: #fee2e2;
  color: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.completed-badge {
  font-size: 12px;
  color: #22c55e;
  font-weight: 600;
  padding: 4px 8px;
  background: #dcfce7;
  border-radius: 12px;
}

.expired-badge {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
  padding: 4px 8px;
  background: #fee2e2;
  border-radius: 12px;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .sticky-header {
    padding: 20px 24px 0;
    width: calc(100% + 48px);
    margin-left: -24px;
  }
  
  .scrollable-content {
    padding: 0 24px;
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
  
  .match-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px 0;
  }
  
  .match-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .match-info {
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
  
  .match-item {
    padding: 20px 0;
  }
  
  .match-title {
    font-size: 18px;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
