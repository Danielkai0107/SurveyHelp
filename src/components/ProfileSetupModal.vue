<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">完善您的個人資料</h2>
        <p class="modal-subtitle">這將幫助我們為您提供更好的服務</p>
      </div>

      <div class="modal-body">
        <!-- 年齡區間 -->
        <div class="form-group">
          <label class="form-label">年齡區間 <span class="required">*</span></label>
          <BaseSelect v-model="formData.ageRange" placeholder="請選擇年齡區間">
            <option value="">請選擇年齡區間</option>
            <option v-for="age in ageOptions" :key="age.id" :value="age.id">
              {{ age.label }}
            </option>
          </BaseSelect>
        </div>

        <!-- 性別 -->
        <div class="form-group">
          <label class="form-label">性別 <span class="required">*</span></label>
          <BaseSelect v-model="formData.gender" placeholder="請選擇性別">
            <option value="">請選擇性別</option>
            <option v-for="gender in genderOptions" :key="gender.id" :value="gender.id">
              {{ gender.label }}
            </option>
          </BaseSelect>
        </div>

        <!-- 職業 -->
        <div class="form-group">
          <label class="form-label">職業 <span class="required">*</span></label>
          <BaseSelect v-model="formData.occupation" placeholder="請選擇職業">
            <option value="">請選擇職業</option>
            <option v-for="occupation in occupationOptions" :key="occupation.id" :value="occupation.id">
              {{ occupation.label }}
            </option>
          </BaseSelect>
        </div>

        <!-- 所在地區 -->
        <div class="form-group">
          <label class="form-label">所在地區 <span class="required">*</span></label>
          <BaseSelect v-model="formData.region" placeholder="請選擇所在地區">
            <option value="">請選擇所在地區</option>
            <option v-for="region in regionOptions" :key="region.id" :value="region.id">
              {{ region.label }}
            </option>
          </BaseSelect>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <div class="modal-footer">
        <BaseButton 
          variant="primary" 
          size="default" 
          @click="handleSubmit"
          :disabled="isSubmitting || !isFormValid"
          style="width: 100%;"
        >
          {{ isSubmitting ? '提交中...' : '完成' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import { useOptions } from '../composables/useOptions.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'submit'])

// 表单数据
const formData = ref({
  ageRange: '',
  gender: '',
  occupation: '',
  region: ''
})

const isSubmitting = ref(false)
const error = ref('')

// 使用选项数据
const { allOptions, initOptions } = useOptions()

// 选项数据
const ageOptions = computed(() => allOptions.value.ageRanges || [])
const genderOptions = computed(() => allOptions.value.genders || [])
const occupationOptions = computed(() => allOptions.value.targetGroups || [])
const regionOptions = computed(() => allOptions.value.regions || [])

// 表单验证
const isFormValid = computed(() => {
  return formData.value.ageRange && 
         formData.value.gender && 
         formData.value.occupation &&
         formData.value.region
})

// 关闭弹窗（不允许点击遮罩关闭，必须填写）
const handleClose = () => {
  // 首次设置资料时不允许关闭
  return
}

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = '請填寫所有必填欄位'
    return
  }

  try {
    isSubmitting.value = true
    error.value = ''
    
    emit('submit', {
      ageRange: formData.value.ageRange,
      gender: formData.value.gender,
      occupation: formData.value.occupation,
      region: formData.value.region
    })
    
  } catch (err) {
    console.error('提交失敗:', err)
    error.value = '提交失敗，請稍後再試'
    isSubmitting.value = false
  }
}

// 初始化
onMounted(() => {
  initOptions()
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
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

.modal-body {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

.modal-footer {
  padding: 24px 32px 32px;
  border-top: 1px solid var(--border);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 24px 24px 20px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .modal-footer {
    padding: 20px 24px 24px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .modal-header {
    padding: 20px 20px 16px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .modal-footer {
    padding: 16px 20px 20px;
  }
}
</style>

