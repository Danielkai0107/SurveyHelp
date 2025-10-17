<template>
  <AuthGuard>
    <div class="profile-page">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1 class="page-title">個人檔案</h1>
      </div>

      <!-- 用戶資訊卡片 -->
      <div class="user-card">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="user?.photoURL" :src="user.photoURL" :alt="user.displayName" />
            <div v-else class="avatar-placeholder">
              {{ (user?.displayName || user?.email || '用戶').charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ user?.displayName || user?.email || '用戶' }}</h2>
            <p class="user-email">{{ user?.email }}</p>
            <p class="join-date">加入時間：{{ formatDate(user?.metadata?.creationTime) }}</p>
          </div>
        </div>
        
        <div class="points-summary">
          <div class="total-points">
            <div class="points-number">{{ userProfile?.totalPoints || 0 }}</div>
            <div class="points-label">總積分</div>
          </div>
        </div>
      </div>

      <!-- 積分統計 -->
      <div class="stats-section">
        <h3 class="section-title">積分統計</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ pointsStats.earned }}</div>
            <div class="stat-label">累計獲得</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ pointsStats.thisMonth }}</div>
            <div class="stat-label">本月獲得</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ Object.keys(pointsStats.byType).length }}</div>
            <div class="stat-label">積分來源</div>
          </div>
        </div>
      </div>

      <!-- 積分記錄 -->
      <div class="records-section">
        <div class="section-header">
          <h3 class="section-title">積分記錄</h3>
          <div class="filter-tabs">
            <button :class="['filter-tab', { active: recordFilter === 'all' }]" @click="recordFilter = 'all'">
              全部
            </button>
            <button :class="['filter-tab', { active: recordFilter === 'earned' }]" @click="recordFilter = 'earned'">
              獲得
            </button>
            <button :class="['filter-tab', { active: recordFilter === 'spent' }]" @click="recordFilter = 'spent'">
              消費
            </button>
          </div>
        </div>

        <!-- 載入狀態 -->
        <div v-if="isLoadingRecords" class="loading-container">
          <div class="loading-text">載入記錄中...</div>
        </div>

        <!-- 積分記錄列表 -->
        <div v-else-if="filteredRecords.length" class="records-list">
          <div v-for="record in filteredRecords" :key="record.id" class="record-item">
            <div class="record-content">
              <div class="record-header">
                <div class="record-type">
                  <span class="type-icon">{{ getTypeConfig(record.type).icon }}</span>
                  <span class="type-label">{{ getTypeConfig(record.type).label }}</span>
                </div>
                <div class="record-date">{{ formatRelativeTime(record.createdAt) }}</div>
              </div>
              
              <div class="record-description">{{ record.description }}</div>
            </div>
            
            <div class="record-points" :class="{ negative: record.points < 0 }">
              {{ formatPoints(record.points) }}
            </div>
          </div>
        </div>

        <!-- 空狀態 -->
        <div v-else class="empty-records">
          <div class="empty-icon">💰</div>
          <div class="empty-title">暫無積分記錄</div>
          <div class="empty-description">完成問卷後積分記錄會顯示在這裡</div>
        </div>
      </div>
    </div>
  </AuthGuard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AuthGuard from '../components/AuthGuard.vue'
import { useAuth } from '../composables/useAuth.js'
import { pointsService } from '../services/points.js'
import { formatDate, formatRelativeTime } from '../utils/dateFormatter.js'

const { user } = useAuth()

// 狀態管理
const userProfile = ref(null)
const pointsRecords = ref([])
const isLoadingProfile = ref(false)
const isLoadingRecords = ref(false)
const recordFilter = ref('all')

// 載入用戶檔案
const loadUserProfile = async () => {
  if (!user.value) return
  
  try {
    isLoadingProfile.value = true
    const profile = await pointsService.getUserProfile(user.value.uid)
    userProfile.value = profile
    console.log('用戶檔案:', profile)
  } catch (error) {
    console.error('載入用戶檔案失敗:', error)
  } finally {
    isLoadingProfile.value = false
  }
}

// 載入積分記錄
const loadPointsRecords = async () => {
  if (!user.value) return
  
  try {
    isLoadingRecords.value = true
    const records = await pointsService.getUserPointsRecords(user.value.uid)
    pointsRecords.value = records
    console.log('積分記錄:', records.length, '筆')
  } catch (error) {
    console.error('載入積分記錄失敗:', error)
  } finally {
    isLoadingRecords.value = false
  }
}

// 計算積分統計
const pointsStats = computed(() => {
  return pointsService.calculatePointsStats(pointsRecords.value)
})

// 篩選積分記錄
const filteredRecords = computed(() => {
  if (recordFilter.value === 'all') {
    return pointsRecords.value
  } else if (recordFilter.value === 'earned') {
    return pointsRecords.value.filter(record => record.points > 0)
  } else if (recordFilter.value === 'spent') {
    return pointsRecords.value.filter(record => record.points < 0)
  }
  return pointsRecords.value
})

// 獲取積分類型配置
const getTypeConfig = (type) => {
  return pointsService.getPointTypeConfig(type)
}

// 格式化積分顯示
const formatPoints = (points) => {
  return pointsService.formatPoints(points)
}

// 初始化
onMounted(async () => {
  await Promise.all([
    loadUserProfile(),
    loadPointsRecords()
  ])
})
</script>

<style scoped>
.profile-page {
  margin: 0 auto;
  padding: 0;
}

.page-header {
  margin-top: 20px;
  margin-bottom: 32px;
}

.page-title {
  font-size: 40px;
  font-weight: 400;
  color: var(--text);
  margin: 0;
}

/* 用戶資訊卡片 */
.user-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: var(--text);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.user-email {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

.join-date {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
}

.points-summary {
  text-align: center;
}

.total-points {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.points-number {
  font-size: 48px;
  font-weight: 700;
  color: #22c55e;
  line-height: 1;
}

.points-label {
  font-size: 14px;
  color: var(--muted);
  font-weight: 500;
}

/* 統計區域 */
.stats-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--muted);
  font-weight: 500;
}

/* 記錄區域 */
.records-section {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
}

.filter-tab {
  padding: 8px 16px;
  background: white;
  border: none;
  border-right: 1px solid var(--border);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  transition: all 0.2s ease;
}

.filter-tab:last-child {
  border-right: none;
}

.filter-tab:hover {
  background: var(--hover);
  color: var(--text);
}

.filter-tab.active {
  background: var(--text);
  color: white;
}

/* 記錄列表 */
.records-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}

.record-item:last-child {
  border-bottom: none;
}

.record-content {
  flex: 1;
  min-width: 0;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.record-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 16px;
}

.type-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.record-date {
  font-size: 12px;
  color: var(--muted);
}

.record-description {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
}

.record-points {
  font-size: 18px;
  font-weight: 700;
  color: #22c55e;
  flex-shrink: 0;
}

.record-points.negative {
  color: #ef4444;
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
.empty-records {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: var(--muted);
}

/* 響應式設計 */


@media (max-width: 768px) {
  .profile-page {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .user-card {
    flex-direction: column;
    gap: 24px;
    text-align: center;
    padding: 24px;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
  }
  
  .avatar-placeholder {
    font-size: 24px;
  }
  
  .user-name {
    font-size: 20px;
  }
  
  .points-number {
    font-size: 36px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .records-section {
    padding: 24px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .record-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 20px 0;
  }
  
  .record-points {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .user-card {
    padding: 20px;
  }
  
  .records-section {
    padding: 20px;
  }
  
  .filter-tabs {
    width: 100%;
  }
  
  .filter-tab {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
