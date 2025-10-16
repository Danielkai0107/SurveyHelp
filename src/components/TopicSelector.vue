<template>
  <div class="topic-selector">
    <label v-if="label" class="label" :class="{ required }">{{ label }}</label>
    
    <div class="topic-grid">
      <button
        v-for="topic in topics"
        :key="topic.id"
        type="button"
        :class="['topic-btn', { active: selectedTopics.includes(topic.id) }]"
        @click="toggleTopic(topic.id)"
      >
        {{ topic.label }}
      </button>
    </div>
    
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
    <div v-if="error" class="error-text">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  topics: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  maxSelection: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedTopics = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

const toggleTopic = (topicId) => {
  const current = [...selectedTopics.value]
  const index = current.indexOf(topicId)
  
  if (index > -1) {
    // 移除標籤
    current.splice(index, 1)
  } else {
    // 添加標籤（檢查最大選擇數量）
    if (current.length < props.maxSelection) {
      current.push(topicId)
    }
  }
  
  selectedTopics.value = current
}

const removeTopic = (topicId) => {
  const current = selectedTopics.value.filter(id => id !== topicId)
  selectedTopics.value = current
}
</script>

<style scoped>
.topic-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.label.required::after {
  content: ' *';
  color: #ef4444;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.topic-btn {
  padding: 8px 4px;
  border: 1px solid transparent;
  border-radius: 20px;
  background: #f5f5f5;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-align: center;
}

.topic-btn:hover {
  background: #e1e1e1;
}

.topic-btn.active {
  background: var(--text);
  color: white;
  border-color: var(--text);
}

.topic-btn.active:hover {
  background: #000;
}

.help-text {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  line-height: 1.4;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .topic-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 6px;
  }
  
  .topic-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .topic-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
}</style>
