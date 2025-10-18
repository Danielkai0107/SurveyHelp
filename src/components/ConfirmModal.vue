<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button @click="handleCancel" class="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <p class="modal-message">{{ message }}</p>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="modal-actions">
          <BaseButton 
            variant="secondary" 
            @click="handleCancel"
            :disabled="isProcessing"
          >
            {{ cancelText }}
          </BaseButton>
          <BaseButton 
            :variant="confirmVariant" 
            @click="handleConfirm"
            :disabled="isProcessing"
            :style="confirmStyle"
          >
            {{ isProcessing ? processingText : confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '確認操作'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '確認'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  processingText: {
    type: String,
    default: '處理中...'
  },
  confirmVariant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary'].includes(value)
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'danger', 'warning'].includes(value)
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'confirm', 'cancel'])

const isProcessing = ref(false)

// 根據類型設置按鈕樣式
const confirmStyle = props.type === 'danger' ? {
  backgroundColor: '#ef4444',
  borderColor: '#ef4444',
  color: 'white'
} : props.type === 'warning' ? {
  backgroundColor: '#f59e0b',
  borderColor: '#f59e0b',
  color: 'white'
} : {}

// 處理確認
const handleConfirm = async () => {
  isProcessing.value = true
  emit('confirm')
}

// 處理取消
const handleCancel = () => {
  if (isProcessing.value) return
  emit('cancel')
  emit('close')
}

// 處理點擊遮罩
const handleOverlayClick = () => {
  if (props.closeOnOverlayClick && !isProcessing.value) {
    handleCancel()
  }
}

// 重置處理狀態（父組件可以調用）
defineExpose({
  resetProcessing: () => {
    isProcessing.value = false
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e5e5;
}

.modal-body {
  padding: 24px;
}

.modal-message {
  font-size: 15px;
  color: var(--text);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 20px 24px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 16px 20px 20px;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .modal-content {
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-title {
    font-size: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-message {
    font-size: 14px;
  }
  
  .modal-footer {
    padding: 12px 16px 16px;
  }
}
</style>

