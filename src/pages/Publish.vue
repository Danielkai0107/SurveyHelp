<template>
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
          <div class="form-group">
            <label class="label required">問卷標題</label>
            <input 
              class="input" 
              v-model="form.title" 
              placeholder="請輸入問卷標題"
              :class="{ 'error': errors.title }"
            />
            <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
          </div>

          <div class="form-group">
            <label class="label">問卷描述</label>
            <textarea 
              class="input" 
              rows="4" 
              v-model="form.description"
              placeholder="請簡要描述問卷的目的和內容"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label required">領域</label>
              <select class="input" v-model="form.field">
                <option>學術</option>
                <option>商業</option>
                <option>社會</option>
                <option>科技</option>
                <option>健康</option>
                <option>教育</option>
              </select>
            </div>

            <div class="form-group">
              <label class="label required">用途</label>
              <select class="input" v-model="form.purpose">
                <option>研究</option>
                <option>營運</option>
                <option>市場調查</option>
                <option>產品開發</option>
                <option>學術研究</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="label">標籤</label>
            <input 
              class="input" 
              v-model="tags" 
              placeholder="請輸入相關標籤，以逗號分隔（如：校園, 消費行為, 生活型態）"
            />
            <div class="help-text">標籤有助於用戶快速找到您的問卷</div>
          </div>
        </div>
      </div>

      <!-- 步驟 2: 問卷設定 -->
      <div v-if="currentStep === 1" class="step-panel">

        <div class="form-grid">
          <div class="form-row">
            <div class="form-group">
              <label class="label required">語言</label>
              <select class="input" v-model="form.language">
                <option>中文</option>
                <option>English</option>
                <option>日本語</option>
                <option>한국어</option>
              </select>
            </div>

            <div class="form-group">
              <label class="label required">預估填寫時間</label>
              <div class="input-with-unit">
                <input 
                  class="input" 
                  type="number" 
                  v-model.number="form.minutes" 
                  min="1" 
                  max="60"
                  :class="{ 'error': errors.minutes }"
                />
                <span class="unit">分鐘</span>
              </div>
              <div v-if="errors.minutes" class="error-message">{{ errors.minutes }}</div>
            </div>
          </div>

          <div class="form-group">
            <label class="label">目標受眾</label>
            <input 
              class="input" 
              v-model="form.targetAudience" 
              placeholder="例：18-35歲上班族、大學生、家庭主婦等"
            />
            <div class="help-text">描述您希望哪些人群參與此問卷</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label required">目標人數</label>
              <input 
                class="input" 
                type="number" 
                v-model.number="form.targetCount" 
                min="10" 
                placeholder="100"
                :class="{ 'error': errors.targetCount }"
              />
              <div v-if="errors.targetCount" class="error-message">{{ errors.targetCount }}</div>
            </div>

            <div class="form-group">
              <label class="label">獎勵積分</label>
              <div class="input-with-unit">
                <input 
                  class="input" 
                  type="number" 
                  v-model.number="form.incentive" 
                  min="0" 
                  placeholder="10"
                />
                <span class="unit">積分</span>
              </div>
              <div class="help-text">完成問卷後給予的積分獎勵</div>
            </div>
          </div>

          <div class="form-group">
            <label class="label required">問卷連結</label>
            <input 
              class="input" 
              type="url" 
              v-model="form.link" 
              placeholder="https://forms.google.com/..."
              :class="{ 'error': errors.link }"
            />
            <div v-if="errors.link" class="error-message">{{ errors.link }}</div>
            <div class="help-text">請提供您的外部問卷連結（Google Forms、SurveyCake等）</div>
          </div>
        </div>
      </div>

      <!-- 步驟 3: 預覽確認 -->
      <div v-if="currentStep === 2" class="step-panel">

        <div class="preview-section">
          <div class="preview-card">
            <div class="survey-preview">
              <div class="survey-meta">
                <span class="survey-category">{{ form.field }}</span>
                <span class="survey-date">{{ new Date().toLocaleDateString() }}</span>
              </div>
              <h3 class="survey-title">{{ form.title || '未填寫標題' }}</h3>
              <p class="survey-org">由您發布</p>
              <p class="survey-description">{{ form.description || '未填寫描述' }}</p>
              
              <div class="survey-tags" v-if="parsedTags.length > 0">
                <span v-for="tag in parsedTags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              
              <div class="survey-details">
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
              </div>
            </div>
          </div>

          <div class="verification-section">
            <div class="verification-card">
              <h4>📋 發布前檢查清單</h4>
              <div class="checklist">
                <label class="checkbox-item">
                  <input type="checkbox" v-model="checks.linkTested" />
                  <span>我已測試問卷連結可以正常開啟</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="checks.contentReviewed" />
                  <span>我已檢查問卷內容無誤</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="checks.returnLinkAdded" />
                  <span>我已在外部問卷最後頁添加返回驗證連結</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="checks.termsAccepted" />
                  <span>我同意問卷發布條款和隱私政策</span>
      </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步驟導航 -->
    <div class="step-navigation">
      <button 
        v-if="currentStep < steps.length - 1" 
        class="btn-next" 
        @click="nextStep"
        :disabled="!canProceed"
      >
        下一個 →
      </button>
      
      <button 
        v-if="currentStep === steps.length - 1" 
        class="btn-next" 
        @click="publishSurvey"
        :disabled="!canPublish"
      >
        發布問卷
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 步驟定義
const steps = ref([
  {
    title: '基本設定',
    description: '請輸入此問卷的基本信息'
  },
  {
    title: '問卷設定',
    description: '設定問卷的技術參數和參與條件'
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
  field: '學術',
  purpose: '研究',
  language: '中文',
  targetAudience: '',
  minutes: 6,
  targetCount: 100,
  incentive: 10,
  link: '',
  description: ''
})

const tags = ref('')

// 驗證錯誤
const errors = ref({})

// 檢查清單
const checks = ref({
  linkTested: false,
  contentReviewed: false,
  returnLinkAdded: false,
  termsAccepted: false
})

// 解析標籤
const parsedTags = computed(() => {
  return tags.value ? tags.value.split(',').map(tag => tag.trim()).filter(tag => tag) : []
})

// 驗證第一步
const validateStep1 = () => {
  const newErrors = {}
  
  if (!form.value.title.trim()) {
    newErrors.title = '請輸入問卷標題'
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
    return form.value.title.trim() !== ''
  }
  if (currentStep.value === 1) {
    return form.value.link.trim() !== '' && form.value.minutes > 0 && form.value.targetCount >= 10
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
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    errors.value = {}
  }
}

const goToStep = (stepIndex) => {
  // 只允許返回到之前的步驟或當前步驟
  if (stepIndex <= currentStep.value) {
    currentStep.value = stepIndex
    errors.value = {}
  }
}

// 發布問卷
const publishSurvey = () => {
  if (!canPublish.value) {
    return
  }
  
  // 這裡可以添加實際的發布邏輯
  console.log('發布問卷:', {
    ...form.value,
    tags: parsedTags.value
  })
  
  router.push('/publish/xyz123/success')
}
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
  font-size: 24px;
  font-weight: 600;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.label.required::after {
  content: ' *';
  color: #ef4444;
}

.input {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--text);
  box-shadow: none;
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

.error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.help-text {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
  margin-top: 4px;
}

/* 預覽區 */
.preview-section {
  display: grid;
  gap: 24px;
}

.preview-card {
  background: #f7fafc;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.survey-preview {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
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
  border-radius: 12px;
  padding: 24px;
}

.verification-card h4 {
  margin: 0 0 16px 0;
  color: var(--text);
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
}

/* 步驟導航 */
.step-navigation {
  display: flex;
  justify-content: center;
  padding: 32px 0;
  margin-top: auto;
}

.btn-next {
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

.btn-next:hover:not(:disabled) {
  background: #000;
}

.btn-next:disabled {
  background: #d1d5db;
  cursor: not-allowed;
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
  
  .survey-details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
