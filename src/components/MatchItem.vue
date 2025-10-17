<template>
  <div class="match-item" @click="handleClick">
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
      <div class="status-badge" :class="statusClass">
        {{ match.statusText }}
      </div>
      
      <!-- 操作按鈕 -->
      <div class="action-buttons" @click.stop>
        <!-- 未開始狀態 -->
        <BaseButton 
          v-if="match.status === 'pending'" 
          variant="primary" 
          size="small"
          @click="$emit('start', match)"
        >
          開始作答
        </BaseButton>
        
        <!-- 進行中狀態 -->
        <BaseButton 
          v-else-if="match.status === 'doing'"
          variant="primary" 
          size="small"
          @click="$emit('continue', match)"
        >
          繼續填答
        </BaseButton>
        
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
</template>

<script setup>
import BaseButton from './BaseButton.vue'
import { formatRelativeTime } from '../utils/dateFormatter.js'
import { computed } from 'vue'

const props = defineProps({
  match: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'start', 'continue'])

const handleClick = () => {
  emit('click', props.match)
}

const statusClass = computed(() => {
  switch (props.match.status) {
    case 'done': return 'success'
    case 'doing': return 'warn'
    case 'pending': return 'info'
    case 'expired': return 'danger'
    default: return ''
  }
})
</script>

<style scoped>
/* 列表項目 */
.match-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
@media (max-width: 768px) {
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
  
  .match-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .match-item {
    padding: 20px 0;
  }
  
  .match-title {
    font-size: 16px;
  }
  
  .match-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>

