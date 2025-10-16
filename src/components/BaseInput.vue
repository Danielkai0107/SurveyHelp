<template>
  <div class="base-input-wrapper">
    <label v-if="label" :class="['label', { required: required }]">
      {{ label }}
    </label>
    
    <!-- 文字輸入框 -->
    <input
      v-if="type !== 'textarea'"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus', $event)"
      @blur="handleBlur"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :min="min"
      :max="max"
      :step="step"
      :class="[
        'base-input',
        size,
        {
          'error': error || hasError,
          'disabled': disabled,
          'readonly': readonly
        }
      ]"
    />
    
    <!-- 文字區域 -->
    <textarea
      v-else
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus', $event)"
      @blur="handleBlur"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :class="[
        'base-input',
        'textarea',
        size,
        {
          'error': error || hasError,
          'disabled': disabled,
          'readonly': readonly
        }
      ]"
    ></textarea>
    
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
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'email', 'password', 'number', 'url', 'tel', 'search', 'textarea'
    ].includes(value)
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
  readonly: {
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
  // 數字輸入框專用
  min: {
    type: [String, Number],
    default: undefined
  },
  max: {
    type: [String, Number],
    default: undefined
  },
  step: {
    type: [String, Number],
    default: undefined
  },
  // textarea 專用
  rows: {
    type: [String, Number],
    default: 4
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
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.base-input {
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
}

/* 統一高度 48px */
.base-input:not(.textarea) {
  height: 48px;
  padding: 0 20px;
}

/* textarea 樣式 */
.base-input.textarea {
  padding: 16px 20px;
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
  border-radius: 16px;
}

/* 尺寸變體 */
.base-input.small:not(.textarea) {
  height: 40px;
  padding: 0 16px;
  font-size: 13px;
  border-radius: 20px;
}

.base-input.large:not(.textarea) {
  height: 56px;
  padding: 0 24px;
  font-size: 16px;
  border-radius: 28px;
}

/* 狀態樣式 */
.base-input:focus {
  outline: none;
  border-color: #d1d5db;
  background: #ffffff;
  box-shadow: none;
}

.base-input:hover:not(:disabled):not(:focus) {
  border-color: #d1d5db;
}

.base-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.base-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.base-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.base-input:readonly {
  background: #f9fafb;
  cursor: default;
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
