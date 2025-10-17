<template>
  <div :class="['survey-item', viewMode]" @click="goToDetail">
    <div class="survey-item-container">
      <!-- 左側內容 -->
      <div class="survey-content">
        <div class="survey-header">
          <div class="survey-category">{{ displayField }}</div>
          <div class="survey-date">{{ formattedDate }}</div>
        </div>
        
        <h3 class="survey-title">{{ survey.title }}</h3>
        
        <div class="survey-info">
          <div class="info-item">
            <span class="info-label">發布機構：</span>
            <span class="info-value">{{ displayOrganization }}</span>
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
      </div>

      <!-- 右側狀態和進度 -->
      <div class="survey-status-info">
        <!-- 標籤 -->
        <div v-if="displayTags.length > 0" class="tags-section">
          <span v-for="tag in displayTags" :key="tag" class="tag-badge">
            {{ tag }}
          </span>
          <span v-if="remainingTagsCount > 0" class="tag-badge more">
            +{{ remainingTagsCount }}
          </span>
        </div>
        
        <!-- 進度條 -->
        <div v-if="survey.filled !== undefined && displayTarget" class="progress-info">
          <div class="progress-text">{{ survey.filled }}/{{ displayTarget }} 人</div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: Math.min(100, Math.round((survey.filled/displayTarget)*100)) + '%' }"
            ></div>
          </div>
          <div class="progress-percentage">{{ Math.round((survey.filled/displayTarget)*100) }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '../utils/dateFormatter.js'

const router = useRouter()

const props = defineProps({ 
  survey: { type: Object, required: true },
  viewMode: { type: String, default: 'list' }
})

// 標籤顯示邏輯：最多顯示3個標籤
const displayTags = computed(() => {
  // 優先使用轉換後的標籤，否則使用原始標籤
  const tags = props.survey.tagsLabels || props.survey.tags || []
  return tags.slice(0, 3)
})

const remainingTagsCount = computed(() => {
  const tags = props.survey.tagsLabels || props.survey.tags || []
  return Math.max(0, tags.length - 3)
})

// 格式化日期
const formattedDate = computed(() => {
  return formatRelativeTime(props.survey.createdAt || props.survey.date)
})

// 顯示的領域標籤
const displayField = computed(() => {
  return props.survey.fieldLabel || props.survey.field || ''
})

// 顯示的機構名稱
const displayOrganization = computed(() => {
  return props.survey.organization || props.survey.org || ''
})

// 顯示的目標人數
const displayTarget = computed(() => {
  return props.survey.targetCount || props.survey.target || 0
})


// 點擊處理
const goToDetail = () => {
  router.push(`/s/${props.survey.id}`)
}
</script>

<style scoped>
/* 列表項目樣式 */
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

.survey-item:hover .survey-title {
  transform: scale(1.1);
}

.survey-item:last-child {
  border-bottom: none;
}

.survey-item-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

/* 右側狀態資訊 */
.survey-status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
  min-width: 200px;
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
@media (max-width: 768px) {
  .survey-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px 0;
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
}
</style>
