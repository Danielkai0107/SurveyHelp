<template>
  <div :class="['survey-item', viewMode]" @click="goToDetail">
    <div class="survey-meta">
      <span class="survey-category">{{ survey.field }}</span>
      <span class="survey-date">{{ survey.date }}</span>
    </div>
    <h2 class="survey-title">{{ survey.title }}</h2>
    <p class="survey-org">{{ survey.org }}</p>
    <p class="survey-description">{{ survey.description }}</p>
    
    <!-- 標籤區 -->
    <div class="survey-tags" v-if="survey.tags && survey.tags.length > 0">
      <span v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</span>
      <span v-if="remainingTagsCount > 0" class="tag tag-more">+{{ remainingTagsCount }}</span>
    </div>
    
    <!-- 進度條區 -->
    <div class="survey-progress" v-if="survey.filled !== undefined && survey.target">
      <div class="progress-info">
        <span class="progress-text">填答進度</span>
        <span class="progress-stats">{{ survey.filled }}/{{ survey.target }}</span>
      </div>
      <ProgressBar :value="Math.min(100, Math.round((survey.filled/survey.target)*100))" />
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ProgressBar from './ProgressBar.vue'

const router = useRouter()

const props = defineProps({ 
  survey: { type: Object, required: true },
  viewMode: { type: String, default: 'list' }
})

// 標籤顯示邏輯：最多顯示3個標籤
const displayTags = computed(() => {
  const tags = props.survey.tags || []
  return tags.slice(0, 3)
})

const remainingTagsCount = computed(() => {
  const tags = props.survey.tags || []
  return Math.max(0, tags.length - 3)
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

.survey-item.list:hover {
  background: var(--hover);
  margin: 0 -32px;
  padding: 32px;
  border-radius: 8px;
}

.survey-item.list:last-child {
  border-bottom: none;
}

/* 圖卡檢視樣式 */
.survey-item.grid {
  padding: 24px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.survey-item.grid:hover {
  border-color: #9ca3af;
  box-shadow: var(--shadow);
  transform: translateY(-2px);
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
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 6px 0;
  line-height: 1.3;
  color: var(--text);
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
}

.survey-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
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
</style>
