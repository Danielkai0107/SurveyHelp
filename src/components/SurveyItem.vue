<template>
  <div class="survey-item" @click="$emit('click', survey)">
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
        <div class="status-badge" :class="statusClass">
          {{ statusText }}
        </div>
        
        <!-- 進度條 -->
        <div class="progress-info">
          <div class="progress-text">{{ survey.filled || 0 }}/{{ survey.targetCount || survey.target }} 人</div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <div class="progress-percentage">{{ progressPercentage }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatRelativeTime } from '../utils/dateFormatter.js'

const props = defineProps({
  survey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

// 计算进度百分比
const progressPercentage = computed(() => {
  const filled = props.survey.filled || 0
  const target = props.survey.targetCount || props.survey.target || 1
  return Math.round((filled / target) * 100)
})

// 获取状态文字
const statusText = computed(() => {
  switch (props.survey.status) {
    case 'active': return '上架中'
    case 'inactive': return '已下架'
    case 'completed': return '已完成'
    default: return '未知'
  }
})

// 获取状态样式
const statusClass = computed(() => {
  switch (props.survey.status) {
    case 'active': return 'success'
    case 'completed': return 'info'
    case 'inactive': return 'warn'
    default: return ''
  }
})
</script>

<style scoped>
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

/* 右側操作區 */
.match-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
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
  .survey-item {
    padding: 24px 0;
  }

  .survey-item-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .survey-status-info {
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
  
  .match-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .action-buttons {
    flex-shrink: 0;
  }
  
  .match-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .survey-item {
    padding: 20px 0;
  }
  
  .survey-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .survey-title,
  .match-title {
    font-size: 16px;
  }
  
  .survey-info,
  .match-info {
    gap: 12px;
  }
  
  .tags-section,
  .points-section {
    gap: 6px;
  }
}
</style>

