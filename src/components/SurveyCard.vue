<template>
  <div :class="['survey-item', viewMode]" @click="goToDetail">
    <div class="survey-meta">
      <span class="survey-category">{{ displayField }}</span>
      <span class="survey-date">{{ formattedDate }}</span>
    </div>
    <!-- 標題和標籤區 -->
    <div class="title-tags-row">
      <h2 class="survey-title">{{ survey.title }}</h2>
      <!-- 標籤區 -->
      <div class="survey-tags" v-if="displayTags.length > 0">
        <span v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</span>
        <span v-if="remainingTagsCount > 0" class="tag tag-more">+{{ remainingTagsCount }}</span>
      </div>
    </div>
    <p class="survey-org">{{ displayOrganization }}</p>
    <p class="survey-description">{{ survey.description }}</p>
    
    <!-- 進度條區 -->
    <div class="survey-progress" v-if="survey.filled !== undefined && displayTarget">
      <div class="progress-info">
        <span class="progress-text">填答進度</span>
        <span class="progress-stats">{{ survey.filled }}/{{ displayTarget }}</span>
      </div>
      <el-progress 
        :percentage="Math.min(100, Math.round((survey.filled/displayTarget)*100))" 
        :show-text="false"
        :stroke-width="6"
      />
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
/* 條列檢視樣式 */
.survey-item.list {
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.survey-item.list:hover .title-tags-row .survey-title {
  transform: scale(1.1);
}

.survey-item.list:last-child {
  border-bottom: none;
}

/* 圖卡檢視樣式 */
.survey-item.grid {
  padding: 24px;
  border-radius: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid transparent;

}

.survey-item.grid:hover {
  border-color: #d1d5db;
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

/* 標題和標籤行 */
.title-tags-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 6px;
}

.survey-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  color: var(--text);
  transition: transform 0.2s ease;
  flex: 1;
  transform-origin: left center;
}

.survey-org {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  margin: 0 0 8px 0;
}

.survey-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0 0 12px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.survey-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
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
}

.tag-more {
  opacity: 0.7;
}

.survey-progress {
  margin-top: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
}

.progress-stats {
  font-size: 12px;
  color: var(--muted);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .title-tags-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .survey-title {
    margin-bottom: 0;
  }
}
</style>
