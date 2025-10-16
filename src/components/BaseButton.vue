<template>
  <!-- Router Link 按鈕 -->
  <router-link
    v-if="to"
    :to="to"
    :class="[
      'base-button',
      variant,
      size,
      {
        'disabled': disabled,
        'loading': loading
      }
    ]"
  >
    <!-- 載入中圖示 -->
    <span v-if="loading" class="loading-spinner"></span>
    
    <!-- 圖示 -->
    <span v-if="icon && !loading" class="button-icon">
      {{ icon }}
    </span>
    
    <!-- 按鈕文字 -->
    <span v-if="$slots.default" class="button-text">
      <slot></slot>
    </span>
  </router-link>

  <!-- 一般按鈕 -->
  <button
    v-else
    :type="buttonType"
    :disabled="disabled"
    :class="[
      'base-button',
      variant,
      size,
      {
        'disabled': disabled,
        'loading': loading
      }
    ]"
    @click="handleClick"
  >
    <!-- 載入中圖示 -->
    <span v-if="loading" class="loading-spinner"></span>
    
    <!-- 圖示 -->
    <span v-if="icon && !loading" class="button-icon">
      {{ icon }}
    </span>
    
    <!-- 按鈕文字 -->
    <span v-if="$slots.default" class="button-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  // 按鈕樣式變體
  variant: {
    type: String,
    default: 'secondary',
    validator: (value) => ['primary', 'secondary'].includes(value)
  },
  // 按鈕尺寸
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default'].includes(value)
  },
  // 按鈕類型
  buttonType: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否載入中
  loading: {
    type: Boolean,
    default: false
  },
  // 圖示
  icon: {
    type: String,
    default: ''
  },
  // Router Link 目標路徑
  to: {
    type: [String, Object],
    default: null
  }
})

const emit = defineEmits(['click'])

// 處理點擊事件
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
  outline: none;
  position: relative;
  overflow: hidden;
}

/* 尺寸變體 */
.base-button.small {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
}

.base-button.default {
  height: 48px;
  padding: 0 24px;
  font-size: 14px;
}

/* 樣式變體 */
.base-button.primary {
  background-color: #000000;
  color: #ffffff;
}

.base-button.primary:hover:not(:disabled):not(.loading) {
  background-color: #333333;
  transform: translateY(-1px);
}

.base-button.secondary {
  background-color: #f5f5f5;
  color: #000000;
}

.base-button.secondary:hover:not(:disabled):not(.loading) {
  background-color: #e1e1e1;
  transform: translateY(-1px);
}

/* 禁用狀態 */
.base-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 載入中狀態 */
.base-button.loading {
  cursor: wait;
  transform: none !important;
}

/* 按鈕內容 */
.button-icon {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.button-text {
  display: flex;
  align-items: center;
}

/* 載入中動畫 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 焦點狀態 */
.base-button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* 按下狀態 */
.base-button:active:not(:disabled):not(.loading) {
  transform: translateY(0px);
}

/* 響應式調整 */
@media (max-width: 768px) {
  .base-button.default {
    height: 44px;
    padding: 0 20px;
    font-size: 14px;
  }
  
  .base-button.small {
    height: 36px;
    padding: 0 16px;
    font-size: 13px;
  }
}
</style>
