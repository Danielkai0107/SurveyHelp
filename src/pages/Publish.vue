<template>
  <AuthGuard>
    <div class="publish-container">
    <!-- 進度指示器 -->
    <div class="progress-header">
      <div class="progress-info">
        <h1 class="page-title">{{ steps[currentStep].title }}</h1>
        <p class="page-description">{{ steps[currentStep].description }}</p>
      </div>
      <div class="progress-indicator">
        <span class="progress-text">{{ currentStep + 1 }} / {{ steps.length }}</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: ((currentStep + 1) / steps.length) * 100 + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 步驟內容 -->
    <div class="step-content">
      <!-- 步驟 1: 基本信息 -->
      <div v-if="currentStep === 0" class="step-panel">
        
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
        </div>
      </div>

      <!-- 步驟 2: 問卷設定 -->
      <div v-if="currentStep === 1" class="step-panel">

        <div class="form-grid">
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

          <div class="form-group">
            <label class="label">目標受眾</label>
            <div class="form-row-three">
              <div class="form-group-compact">
                <label class="label-small">年齡區間</label>
                <BaseSelect
                  v-model="form.targetAge"
                  size="small"
                >
                  <option value="">不限</option>
                  <option 
                    v-for="option in allOptions.targetAges || []" 
                    :key="option.id" 
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </BaseSelect>
              </div>
              <div class="form-group-compact">
                <label class="label-small">族群</label>
                <BaseSelect
                  v-model="form.targetGroup"
                  size="small"
                >
                  <option value="">不限</option>
                  <option 
                    v-for="option in allOptions.targetGroups || []" 
                    :key="option.id" 
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </BaseSelect>
              </div>
              <div class="form-group-compact">
                <label class="label-small">性別</label>
                <BaseSelect
                  v-model="form.targetGender"
                  size="small"
                >
                  <option value="">不限</option>
                  <option 
                    v-for="option in allOptions.targetGenders || []" 
                    :key="option.id" 
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </BaseSelect>
              </div>
            </div>
            <div class="help-text">選擇您希望參與此問卷的目標受眾特徵</div>
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
        </div>
      </div>

      <!-- 步驟 3: 驗證設定 -->
      <div v-if="currentStep === 2" class="step-panel">
        <div class="form-grid">
          <!-- 驗證連結生成 -->
          <div class="form-group">
            <label class="label required">驗證連結</label>
            <div class="link-container">
              <BaseInput
                :model-value="verificationLink"
                placeholder="驗證連結將自動生成..."
                readonly
                style="flex: 1; font-family: monospace; font-size: 13px;"
              />
              <CopyButton :text="verificationLink" />
            </div>
            <div class="help-text">請將此連結添加到您問卷的最後一頁，用戶完成問卷後需要點擊此連結來驗證完成。</div>
          </div>

          <!-- 平台教學 -->
          <div class="form-group">
            <label class="label">添加教學</label>
            
            <!-- 平台選擇 -->
            <div class="platform-tabs">
              <button 
                v-for="platform in platforms" 
                :key="platform"
                :class="['platform-tab', { active: selectedPlatform === platform }]"
                @click="selectedPlatform = platform"
              >
                {{ platform }}
              </button>
            </div>

            <!-- 教學圖片區域 -->
            <div class="tutorial-image">
              <div class="image-placeholder">
                <p>{{ selectedPlatform }} 教學圖片</p>
                <small>此處將顯示 {{ selectedPlatform }} 的添加連結教學圖片</small>
              </div>
            </div>
            <div class="help-text">選擇您使用的問卷平台，查看如何添加驗證連結的教學。</div>
          </div>

          <!-- 確認勾選 -->
          <div class="form-group verification-checkbox">
            <CustomCheckbox v-model="verificationAdded">
              我已將驗證連結添加到問卷的最後一頁
            </CustomCheckbox>
          </div>
        </div>
      </div>

      <!-- 步驟 4: 預覽確認 -->
      <div v-if="currentStep === 3" class="step-panel">

        <div class="preview-section">
          <div class="preview-card">
            <div class="survey-preview">
              <div class="survey-meta">
                <span class="survey-category">{{ form.field }}</span>
                <span class="survey-date">{{ new Date().toLocaleDateString() }}</span>
              </div>
              <h3 class="survey-title">{{ form.title || '未填寫標題' }}</h3>
              <p class="survey-org">{{ form.organization ? `由 ${form.organization} 發布` : '由您發布' }}</p>
              <p class="survey-description">{{ form.description || '未填寫描述' }}</p>
              
              <div class="survey-tags" v-if="parsedTags.length > 0">
                <span v-for="tagId in parsedTags" :key="tagId" class="tag">
                  {{ getTopicLabel(tagId) }}
                </span>
              </div>
              
              <div class="survey-details">
                <div class="detail-item">
                  <span class="detail-label">領域：</span>
                  <span class="detail-value">{{ form.field }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">用途：</span>
                  <span class="detail-value">{{ form.purpose }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">語言：</span>
                  <span class="detail-value">{{ form.language }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">時間：</span>
                  <span class="detail-value">{{ form.minutes }} 分鐘</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">獎勵：</span>
                  <span class="detail-value">+{{ form.incentive || 0 }} 積分</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">目標人數：</span>
                  <span class="detail-value">{{ form.targetCount }} 人</span>
                </div>
                <div class="detail-item" v-if="targetAudienceText">
                  <span class="detail-label">目標受眾：</span>
                  <span class="detail-value">{{ targetAudienceText }}</span>
                </div>
              </div>
              
              <!-- 問卷連結 -->
              <div class="survey-link-section">
                <div class="detail-item">
                  <span class="detail-label">問卷連結：</span>
                </div>
                <a :href="form.link" target="_blank" rel="noopener" class="survey-link">
                  {{ form.link }}
                </a>
              </div>
              
              <!-- 驗證連結 -->
              <div class="verification-link-section">
                <div class="detail-item">
                  <span class="detail-label">驗證連結：</span>
                </div>
                <div class="verification-link-container">
                  <span class="verification-link">{{ verificationLink }}</span>
                  <BaseButton 
                    variant="secondary" 
                    size="small" 
                    @click="copyVerificationLink"
                    :disabled="!verificationLink"
                  >
                    {{ copySuccess ? '已複製' : '複製' }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <div class="verification-section">
            <div class="verification-card">
              <h4>請確認完成以下事項，並勾選完成</h4>
              <div class="checklist">
                <CustomCheckbox v-model="checks.linkTested">
                  我已測試問卷連結可以正常開啟
                </CustomCheckbox>
                <CustomCheckbox v-model="checks.contentReviewed">
                  我已檢查問卷內容無誤
                </CustomCheckbox>
                <CustomCheckbox v-model="checks.returnLinkAdded">
                  我已在外部問卷最後頁添加返回驗證連結
                </CustomCheckbox>
                <CustomCheckbox v-model="checks.termsAccepted">
                  我同意問卷發布條款和隱私政策
                </CustomCheckbox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步驟導航 -->
    <div class="step-navigation" :class="{ 'first-step': currentStep === 0 }">
      <BaseButton 
        v-if="currentStep > 0" 
        variant="secondary"
        size="default"
        @click="previousStep"
      >
        上一步
      </BaseButton>
      
      <BaseButton 
        v-if="currentStep < steps.length - 1" 
        variant="primary"
        size="default"
        @click="nextStep"
        :disabled="!canProceed"
      >
        下一步
      </BaseButton>
      
      <BaseButton 
        v-if="currentStep === steps.length - 1" 
        variant="primary"
        size="default"
        @click="publishSurvey"
        :disabled="!canPublish"
      >
        發布問卷
      </BaseButton>
    </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CustomCheckbox from '../components/CustomCheckbox.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'
import BaseButton from '../components/BaseButton.vue'
import CopyButton from '../components/CopyButton.vue'
import TopicSelector from '../components/TopicSelector.vue'
import AuthGuard from '../components/AuthGuard.vue'
import { useOptions, useTopicOptions } from '../composables/useOptions.js'
import { useAuth } from '../composables/useAuth.js'
import { surveyService } from '../services/firebase.js'
import { verificationService } from '../services/verification.js'

const router = useRouter()

// 使用選項管理
const { 
  allOptions, 
  isLoading: optionsLoading, 
  initOptions,
  convertLabelsToIds 
} = useOptions()

const { convertTopicLabelsToIds } = useTopicOptions()

// 認證狀態
const { user } = useAuth()

// 步驟定義
const steps = ref([
  {
    title: '發起互填',
    description: '請輸入此互評的基本信息'
  },
  {
    title: '問卷設定',
    description: '設定問卷的技術參數和參與條件'
  },
  {
    title: '添加驗證連結',
    description: '複製平台驗證連結並添加到您的問卷中'
  },
  {
    title: '預覽確認',
    description: '檢查信息並發布'
  }
])

// 當前步驟
const currentStep = ref(0)

// 表單數據
const form = ref({
  title: '',
  field: 'academic', // 使用 ID 而非標籤
  purpose: 'research',
  language: 'zh',
  targetAge: '',
  targetGroup: '',
  targetGender: '',
  minutes: 6,
  targetCount: 100,
  incentive: 10,
  link: '',
  description: '',
  organizationType: 'individual',
  organization: '',
  tags: [] // 改為陣列存儲主題標籤 ID
})

// 用戶名稱計算屬性
const currentUserName = computed(() => {
  return user.value?.displayName || user.value?.email || ''
})

// 驗證錯誤
const errors = ref({})

// 驗證連結設定
const verificationLink = ref('')
const selectedPlatform = ref('Google Forms')
const platforms = ref(['Google Forms', 'SurveyCake', 'Tally'])
const verificationAdded = ref(false)

// 檢查清單
const checks = ref({
  linkTested: false,
  contentReviewed: false,
  returnLinkAdded: false,
  termsAccepted: false
})

// 監聽發起單位類型變化
watch(() => form.value.organizationType, (newType) => {
  if (newType === 'individual') {
    form.value.organization = currentUserName.value
  } else if (newType === 'school' || newType === 'company') {
    form.value.organization = ''
  }
})

// 監聽用戶變化，自動更新個人用戶名稱
watch(currentUserName, (newName) => {
  if (form.value.organizationType === 'individual' && newName) {
    form.value.organization = newName
  }
})

// 解析標籤（現在直接使用 form.tags）
const parsedTags = computed(() => {
  return form.value.tags || []
})

// 目標受眾文字
const targetAudienceText = computed(() => {
  const parts = []
  if (form.value.targetAge) parts.push(form.value.targetAge)
  if (form.value.targetGroup) parts.push(form.value.targetGroup)
  if (form.value.targetGender) parts.push(form.value.targetGender)
  return parts.length > 0 ? parts.join('、') : ''
})

// 生成驗證連結
const generateVerificationLink = () => {
  // 生成唯一的驗證 ID
  const verificationId = verificationService.generateVerificationId()
  verificationLink.value = verificationService.generateVerificationLink(verificationId)
  
  // 暫存驗證 ID，發布時使用
  form.value.tempVerificationId = verificationId
}

// 複製連結功能已移至 CopyButton 組件

// 驗證第一步
const validateStep1 = () => {
  const newErrors = {}
  
  if (!form.value.title.trim()) {
    newErrors.title = '請輸入問卷標題'
  }
  
  if (!form.value.organizationType) {
    newErrors.organizationType = '請選擇發起單位類型'
  }
  
  if (!form.value.organization.trim()) {
    newErrors.organization = '請輸入發起單位名稱'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 驗證第二步
const validateStep2 = () => {
  const newErrors = {}
  
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

// 是否可以進入下一步
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return form.value.title.trim() !== '' && 
           form.value.organizationType !== '' && 
           form.value.organization.trim() !== ''
  }
  if (currentStep.value === 1) {
    return form.value.link.trim() !== '' && form.value.minutes > 0 && form.value.targetCount >= 10
  }
  if (currentStep.value === 2) {
    return verificationAdded.value
  }
  return true
})

// 是否可以發布
const canPublish = computed(() => {
  return Object.values(checks.value).every(check => check)
})

// 步驟導航
const nextStep = () => {
  let isValid = true
  
  if (currentStep.value === 0) {
    isValid = validateStep1()
  } else if (currentStep.value === 1) {
    isValid = validateStep2()
  }
  
  if (isValid && currentStep.value < steps.value.length - 1) {
    currentStep.value++
    errors.value = {}
    
    // 如果進入驗證設定步驟，生成驗證連結
    if (currentStep.value === 2 && !verificationLink.value) {
      generateVerificationLink()
    }
    
    // 自動滾動到頂部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    errors.value = {}
    
    // 自動滾動到頂部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const goToStep = (stepIndex) => {
  // 只允許返回到之前的步驟或當前步驟
  if (stepIndex <= currentStep.value) {
    currentStep.value = stepIndex
    errors.value = {}
    
    // 自動滾動到頂部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 發布問卷
const publishSurvey = async () => {
  if (!canPublish.value) {
    return
  }
  
  try {
    // 準備問卷資料
    const surveyData = {
      ...form.value,
      tags: form.value.tags || [], // 直接使用已經是 ID 的標籤陣列
      verificationId: form.value.tempVerificationId
    }
    
    // 移除臨時欄位和可能的 undefined 值
    delete surveyData.tempVerificationId
    
    // 確保所有欄位都不是 undefined
    Object.keys(surveyData).forEach(key => {
      if (surveyData[key] === undefined) {
        surveyData[key] = null
      }
    })
    
    console.log('發布問卷資料:', surveyData)
    
    // 發布到 Firestore
    const result = await surveyService.createSurvey(surveyData)
    
    console.log('問卷發布成功:', result)
    
    router.push(`/publish/${result.surveyId}/success`)
  } catch (error) {
    console.error('發布問卷失敗:', error)
    alert('發布失敗，請稍後再試')
  }
}

// 獲取主題標籤名稱
const getTopicLabel = (topicId) => {
  const topics = allOptions.value.topics || []
  const topic = topics.find(t => t.id === topicId)
  return topic ? topic.label : topicId
}

// 初始化選項資料
onMounted(async () => {
  try {
    await initOptions()
    
    // 如果是個人用戶且有用戶資料，自動填入名稱
    if (form.value.organizationType === 'individual' && currentUserName.value) {
      form.value.organization = currentUserName.value
    }
  } catch (error) {
    console.error('載入選項失敗:', error)
  }
})
</script>

<style scoped>
.publish-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 進度頭部 */
.progress-header {
  text-align: center;
  margin-bottom: 48px;
}

.progress-info {
  margin-bottom: 24px;
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

.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 14px;
  color: var(--muted);
  font-weight: 500;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--text);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 步驟內容 */
.step-content {
  flex: 1;
  margin-bottom: 32px;
}

.step-panel {
  background: transparent;
}

/* 表單樣式 */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.label-small {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  margin-bottom: 10px;
}

/* 三欄均分佈局 */
.form-row-three {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

/* 緊湊型表單群組 - 用於三欄佈局內的子項目 */
.form-group-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
}

/* 表單樣式已移至統一設計系統 */

/* Publish 頁面專用的下拉選單樣式 */
select.input {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 20px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 52px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
}

select.input:focus,
select.input:hover {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}

.input.error {
  border-color: #ef4444;
}

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

/* 錯誤和幫助文字樣式已移至統一設計系統 */

/* 發起單位組合欄位樣式 */
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

/* 預覽區 */
.preview-section {
  display: grid;
  gap: 24px;
}


.survey-preview {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
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
  color: var(--muted);
  margin: 0 0 16px 0;
  line-height: 1.5;
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

.survey-details {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  gap: 4px;
  font-size: 13px;
}

.detail-label {
  color: var(--muted);
}

.detail-value {
  color: var(--text);
  font-weight: 500;
}

/* 驗證區 */
.verification-section {
  margin-top: 24px;
}

.verification-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
}

.verification-card h4 {
  margin: 0 0 24px 0;
  color: var(--text);
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}


/* 驗證設定步驟樣式 */

.link-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.link-input {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
}

/* 複製按鈕樣式已移至 CopyButton 組件 */

.platform-tabs {
  display: flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 40px;
  overflow: hidden;
  margin-bottom: 24px;
}

.platform-tab {
  flex: 1;
  padding: 12px 16px;
  background: white;
  border: none;
  border-right: 1px solid var(--border);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  transition: all 0.2s ease;
}

.platform-tab:last-child {
  border-right: none;
}

.platform-tab:hover {
  background: var(--hover);
  color: var(--text);
}

.platform-tab.active {
  background: var(--text);
  color: white;
}

.tutorial-image {
  background: #f8f9fa;
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  text-align: center;
  color: var(--muted);
}

.image-placeholder p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.image-placeholder small {
  font-size: 12px;
}


/* 步驟導航 */
.step-navigation {
  display: flex;
  justify-content: space-between;
  padding: 32px 0;
  margin-top: auto;
}

/* 第一步驟按鈕置中 */
.step-navigation.first-step {
  justify-content: center;
}

.btn-next, .btn-prev {
  background: var(--text);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-prev {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-next:hover:not(:disabled) {
  background: #000;
}

.btn-prev:hover {
  background: var(--hover);
  border-color: var(--text);
}

.btn-next:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 驗證設定步驟的 CustomCheckbox 置中 */
.verification-checkbox {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

/* 預覽區域的連結樣式 */
.survey-link-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.survey-link {
  display: block;
  color: var(--text);
  text-decoration: underline;
  font-size: 14px;
  margin-top: 4px;
  word-break: break-all;
  line-height: 1.4;
}

.survey-link:hover {
  color: #000;
}

.verification-link-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.verification-link-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.verification-link {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  color: var(--text);
  word-break: break-all;
  line-height: 1.4;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .publish-container {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-description {
    font-size: 13px;
  }
  
  .progress-bar {
    width: 150px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-row-three {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .survey-details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
