<template>
  <AuthGuard>
    <div class="my-answers-page">
      <!-- 固定標題區域 -->
      <div class="sticky-controls">
        <!-- 頁面標題 -->
        <div class="page-header">
          <h1 class="page-title">互惠管理</h1>
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
          <MatchItem 
            v-for="match in list" 
            :key="match.id" 
            :match="match"
            @click="handleStartAnswer"
            @start="handleStartAnswer"
            @continue="reopenSurvey"
          />
        </div>
        <!-- 空狀態 -->
        <div v-else class="empty-state">
          <div class="empty-title">暫無資料</div>
          <div class="empty-description">
            去探索頁看看吧
          </div>
        </div>
  </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import MatchItem from '../components/MatchItem.vue'
import AuthGuard from '../components/AuthGuard.vue'
import { matchesService } from '../services/matches.js'
import { surveyService } from '../services/firebase.js'
import { useAuth } from '../composables/useAuth.js'

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
          
          // 如果問卷不存在（已被刪除），返回 null
          if (!targetSurvey) {
            return null
          }
          
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
          // 如果是問卷不存在的錯誤，返回 null（過濾掉）
          return null
        }
      })
    )
    
    // 過濾掉已刪除的問卷（null 值）
    allMatches.value = enrichedMatches.filter(match => match !== null)
    console.log('載入完成，共', allMatches.value.length, '個有效配對')
    
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
.matches-container {
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
