<template>
  <div class="base-select-wrapper">
    <label v-if="label" :class="['label', { required: required }]">
      {{ label }}
    </label>
    
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus', $event)"
      @blur="handleBlur"
      :disabled="disabled"
      :class="[
        'base-select',
        size,
        {
          'error': error || hasError,
          'disabled': disabled
        }
      ]"
    >
      <!-- 預設選項 -->
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      
      <!-- 選項列表 -->
      <template v-if="options && options.length">
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
          :disabled="getOptionDisabled(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </template>
      
      <!-- 插槽選項 -->
      <slot v-else></slot>
    </select>
    
    <!-- 錯誤訊息 -->
    <div v-if="error || hasError" class="error-message">
      {{ error || errorMessage }}
    </div>
    
    <!-- 幫助文字 -->
    <div v-if="helpText && !error && !hasError" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  options: {
    type: Array,
    default: () => []
  },
  // 當 options 為物件陣列時使用
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  disabledKey: {
    type: String,
    default: 'disabled'
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// 處理失焦事件
const handleBlur = (event) => {
  emit('blur', event)
}

// 計算是否有錯誤（只顯示外部傳入的錯誤）
const hasError = computed(() => {
  // 只顯示外部傳入的錯誤，不進行內建驗證
  return !!props.error
})

// 錯誤訊息（只顯示外部傳入的錯誤訊息）
const errorMessage = computed(() => {
  return props.error || ''
})

// 取得選項值
const getOptionValue = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

// 取得選項標籤
const getOptionLabel = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.labelKey]
  }
  return option
}

// 取得選項是否禁用
const getOptionDisabled = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.disabledKey] || false
  }
  return false
}
</script>

<style scoped>
.base-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.base-select {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 400;
  color: var(--text);
  transition: all 0.2s ease;
  box-shadow: none;
  font-family: inherit;
  cursor: pointer;
  
  /* 統一高度 48px */
  height: 48px;
  padding: 0 52px 0 20px;
  
  /* 自訂下拉箭頭 */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 20px center;
  background-repeat: no-repeat;
  background-size: 16px;
  
  /* 移除預設樣式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* 尺寸變體 */
.base-select.small {
  height: 40px;
  padding: 0 44px 0 16px;
  font-size: 13px;
  border-radius: 20px;
  background-position: right 16px center;
  background-size: 14px;
}

.base-select.large {
  height: 56px;
  padding: 0 60px 0 24px;
  font-size: 16px;
  border-radius: 28px;
  background-position: right 24px center;
  background-size: 18px;
}

/* 狀態樣式 */
.base-select:focus {
  outline: none;
  border-color: #d1d5db;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  box-shadow: none;
}

.base-select:hover:not(:disabled):not(:focus) {
  border-color: #d1d5db;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}

.base-select.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.base-select.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-select:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d1d5db' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}

/* 選項樣式 */
.base-select option {
  padding: 8px 12px;
  background: white;
  color: var(--text);
}

.base-select option:disabled {
  color: #9ca3af;
  background: #f9fafb;
}

/* 標籤樣式 */
.label {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 10px;
  display: block;
  font-weight: 500;
  line-height: 1.4;
}

.label.required::after {
  content: ' *';
  color: #ef4444;
  font-weight: 400;
}

/* 錯誤和幫助文字 */
.error-message {
  font-size: 12px;
  color: #ef4444;
  line-height: 1.4;
  margin-top: 4px;
}

.help-text {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
  margin-top: 4px;
}
</style>
