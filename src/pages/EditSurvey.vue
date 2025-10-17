<template>
  <AuthGuard>
    <div class="edit-survey-container">
      <!-- 載入狀態 -->
      <div v-if="isLoadingSurvey" class="loading-container">
        <div class="loading-text">載入問卷資料中...</div>
      </div>

      <!-- 編輯表單 -->
      <div v-else-if="surveyData" class="edit-form">
        <!-- 進度指示器 -->
        <div class="progress-header">
          <div class="progress-info">
            <h1 class="page-title">編輯問卷</h1>
            <p class="page-description">修改問卷資訊，驗證連結保持不變</p>
          </div>
        </div>

        <!-- 表單內容 -->
        <div class="form-content">
          <div class="form-grid">
            <BaseInput
              v-model="form.title"
              label="問卷標題"
              placeholder="請輸入問卷標題"
              required
              :error="errors.title"
            />

            <BaseInput
              v-model="form.description"
              type="textarea"
              label="問卷描述"
              placeholder="請簡要描述問卷的目的和內容"
              :rows="4"
            />

            <div class="form-group">
              <label class="label required">發起單位</label>
              <div class="organization-container">
                <BaseSelect
                  v-model="form.organizationType"
                  class="organization-type-select"
                  required
                >
                  <option value="">類型</option>
                  <option 
                    v-for="option in allOptions.organizationTypes || []" 
                    :key="option.id" 
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </BaseSelect>
                <BaseInput
                  v-model="form.organization"
                  placeholder="請輸入發起單位名稱"
                  required
                  :readonly="form.organizationType === 'individual'"
                  :error="errors.organization"
                  class="organization-input"
                />
              </div>
            </div>

            <div class="form-row">
              <BaseSelect
                v-model="form.field"
                label="領域"
                required
              >
                <option 
                  v-for="option in allOptions.fields || []" 
                  :key="option.id" 
                  :value="option.id"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>

              <BaseSelect
                v-model="form.purpose"
                label="用途"
                required
              >
                <option 
                  v-for="option in allOptions.purposes || []" 
                  :key="option.id" 
                  :value="option.id"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>
            </div>

            <TopicSelector
              v-model="form.tags"
              :topics="allOptions.topics || []"
              label="主題標籤"
              help-text="選擇與您問卷相關的主題標籤，最多可選擇 3 個"
              :max-selection="3"
            />

            <div class="form-row">
              <BaseSelect
                v-model="form.language"
                label="語言"
                required
              >
                <option 
                  v-for="option in allOptions.languages || []" 
                  :key="option.id" 
                  :value="option.id"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>

              <div class="form-group">
                <label class="label required">預估填寫時間</label>
                <div class="input-with-unit">
                  <BaseInput
                    v-model.number="form.minutes"
                    type="number"
                    :min="1"
                    :max="60"
                    :error="errors.minutes"
                    style="padding-right: 60px;"
                  />
                  <span class="unit">分鐘</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <BaseInput
                v-model.number="form.targetCount"
                type="number"
                label="目標人數"
                placeholder="100"
                :min="10"
                required
                :error="errors.targetCount"
              />

              <BaseSelect
                v-model.number="form.incentive"
                label="獎勵積分"
                help-text="完成問卷後給予的積分獎勵"
              >
                <option :value="3">3 積分</option>
                <option :value="5">5 積分</option>
                <option :value="10">10 積分</option>
              </BaseSelect>
            </div>

            <BaseInput
              v-model="form.link"
              type="url"
              label="問卷連結"
              placeholder="https://forms.google.com/..."
              required
              :error="errors.link"
              help-text="請提供您的外部問卷連結（Google Forms、SurveyCake等）"
            />

            <!-- 驗證連結顯示（只讀） -->
            <div class="form-group">
              <label class="label">驗證連結（不可修改）</label>
              <div class="link-container">
                <BaseInput
                  :model-value="verificationLink"
                  readonly
                  style="flex: 1; font-family: monospace; font-size: 13px;"
                />
                <CopyButton :text="verificationLink" />
              </div>
              <div class="help-text">此連結在問卷創建時已固定，編輯時不會改變</div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="form-actions">
          <BaseButton 
            variant="secondary"
            size="default"
            @click="goBack"
          >
            取消
          </BaseButton>
          
          <BaseButton 
            variant="primary"
            size="default"
            @click="saveChanges"
            :disabled="isSaving || !canSave"
          >
            {{ isSaving ? '儲存中...' : '儲存變更' }}
          </BaseButton>
        </div>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else class="error-container">
        <div class="error-text">載入問卷失敗</div>
        <BaseButton variant="secondary" @click="loadSurveyData">重試</BaseButton>
      </div>
    </div>
  </AuthGuard>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthGuard from '../components/AuthGuard.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'
import BaseButton from '../components/BaseButton.vue'
import CopyButton from '../components/CopyButton.vue'
import TopicSelector from '../components/TopicSelector.vue'
import { useOptions } from '../composables/useOptions.js'
import { useAuth } from '../composables/useAuth.js'
import { surveyService } from '../services/firebase.js'
import { responsesService } from '../services/responses.js'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { allOptions, initOptions } = useOptions()

// 狀態管理
const surveyData = ref(null)
const isLoadingSurvey = ref(true)
const isSaving = ref(false)
const errors = ref({})

// 表單資料
const form = ref({
  title: '',
  description: '',
  organizationType: 'individual',
  organization: '',
  field: 'academic',
  purpose: 'research',
  language: 'zh',
  tags: [],
  minutes: 6,
  targetCount: 100,
  incentive: 10,
  link: ''
})

// 驗證連結（只讀）
const verificationLink = computed(() => {
  if (!surveyData.value) return ''
  return responsesService.generateVerifyLink(surveyData.value.id)
})

// 用戶名稱
const currentUserName = computed(() => {
  return user.value?.displayName || user.value?.email || ''
})

// 載入問卷資料
const loadSurveyData = async () => {
  try {
    isLoadingSurvey.value = true
    const surveyId = route.params.id
    
    const survey = await surveyService.getSurvey(surveyId)
    
    // 檢查是否為問卷擁有者
    if (survey.createdBy !== user.value?.uid) {
      alert('您沒有權限編輯此問卷')
      router.push('/me/surveys')
      return
    }
    
    surveyData.value = survey
    
    // 填充表單資料
    form.value = {
      title: survey.title || '',
      description: survey.description || '',
      organizationType: survey.organizationType || 'individual',
      organization: survey.organization || '',
      field: survey.field || 'academic',
      purpose: survey.purpose || 'research',
      language: survey.language || 'zh',
      tags: survey.tags || [],
      minutes: survey.minutes || 6,
      targetCount: survey.targetCount || 100,
      incentive: survey.incentive || 10,
      link: survey.link || ''
    }
    
    console.log('問卷資料載入完成:', survey)
    
  } catch (error) {
    console.error('載入問卷失敗:', error)
  } finally {
    isLoadingSurvey.value = false
  }
}

// 監聽組織類型變化
watch(() => form.value.organizationType, (newType) => {
  if (newType === 'individual') {
    form.value.organization = currentUserName.value
  } else if (newType === 'school' || newType === 'company') {
    form.value.organization = ''
  }
})

// 驗證表單
const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.title.trim()) {
    newErrors.title = '請輸入問卷標題'
  }
  
  if (!form.value.organization.trim()) {
    newErrors.organization = '請輸入發起單位名稱'
  }
  
  if (!form.value.minutes || form.value.minutes < 1) {
    newErrors.minutes = '請輸入有效的填寫時間'
  }
  
  if (!form.value.targetCount || form.value.targetCount < 10) {
    newErrors.targetCount = '目標人數至少為10人'
  }
  
  if (!form.value.link.trim()) {
    newErrors.link = '請輸入問卷連結'
  } else if (!isValidUrl(form.value.link)) {
    newErrors.link = '請輸入有效的網址'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 檢查URL格式
const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// 是否可以儲存
const canSave = computed(() => {
  return form.value.title.trim() !== '' && 
         form.value.organization.trim() !== '' &&
         form.value.link.trim() !== '' &&
         form.value.minutes > 0 &&
         form.value.targetCount >= 10
})

// 儲存變更
const saveChanges = async () => {
  if (!validateForm()) return
  
  try {
    isSaving.value = true
    
    // 準備更新資料
    const updateData = {
      ...form.value
    }
    
    // 移除可能的 undefined 值
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        updateData[key] = null
      }
    })
    
    console.log('儲存問卷變更:', updateData)
    
    // 更新到 Firestore
    await surveyService.updateSurvey(surveyData.value.id, updateData)
    
    console.log('問卷更新成功')
    alert('問卷已成功更新')
    
    // 返回我的問卷頁面
    router.push('/me/surveys')
    
  } catch (error) {
    console.error('儲存問卷失敗:', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

// 返回
const goBack = () => {
  router.push('/me/surveys')
}

// 初始化
onMounted(async () => {
  try {
    await initOptions()
    await loadSurveyData()
    
    // 如果是個人用戶且有用戶資料，自動填入名稱
    if (form.value.organizationType === 'individual' && currentUserName.value) {
      form.value.organization = currentUserName.value
    }
  } catch (error) {
    console.error('初始化失敗:', error)
  }
})
</script>

<style scoped>
.edit-survey-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 載入狀態 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-text {
  font-size: 16px;
  color: var(--muted);
}

/* 錯誤狀態 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.error-text {
  font-size: 16px;
  color: #ef4444;
}

/* 進度頭部 */
.progress-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 40px;
  font-weight: 400;
  color: var(--text);
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.page-description {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

/* 表單內容 */
.form-content {
  flex: 1;
  margin-bottom: 32px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 組織容器 */
.organization-container {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.organization-type-select {
  flex: 0 0 120px;
  min-width: 120px;
}

.organization-input {
  flex: 1;
}

/* 時間輸入 */
.input-with-unit {
  position: relative;
}

.input-with-unit .input {
  padding-right: 60px;
}

.unit {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--muted);
}

/* 連結容器 */
.link-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 操作按鈕 */
.form-actions {
  display: flex;
  justify-content: space-between;
  padding: 32px 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .edit-survey-container {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .organization-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .organization-type-select {
    flex: 1;
    min-width: auto;
  }
}
</style>
