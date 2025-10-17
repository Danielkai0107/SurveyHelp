<template>
  <AuthGuard>
    <div class="page-wrapper">
      <div class="success-container">
        <h2 class="title">發布成功 🎉</h2>
        <p class="description">您的問卷已成功發布到平台</p>

        <!-- 驗證連結區域 -->
        <div class="verification-section">
          <h3 class="section-title">驗證連結設定</h3>
          
          <!-- 驗證連結 -->
          <div class="form-group">
            <label class="label">驗證連結</label>
            <div class="link-container">
              <input
                :value="verificationLink"
                readonly
                class="link-input"
              />
              <button @click="copyVerificationLink" class="copy-btn">
                {{ copySuccess ? '已複製' : '複製' }}
              </button>
            </div>
            <div class="help-text">
              請將此連結添加到您外部問卷的最後一頁，用戶完成問卷後需要點擊此連結來驗證完成。
            </div>
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
        </div>

        <div class="button-group">
          <BaseButton variant="primary" size="default" to="/me/surveys">前往「我的問卷」</BaseButton>
          <BaseButton variant="secondary" size="default" to="/">回首頁</BaseButton>
        </div>
      </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import AuthGuard from '../components/AuthGuard.vue'
import { responsesService } from '../services/responses.js'

const route = useRoute()

// 状态
const verificationLink = ref('')
const selectedPlatform = ref('Google Forms')
const platforms = ref(['Google Forms', 'SurveyCake', 'Tally'])
const copySuccess = ref(false)

// 复制验证链接
const copyVerificationLink = async () => {
  try {
    await navigator.clipboard.writeText(verificationLink.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}

// 初始化
onMounted(() => {
  // 从路由参数获取 surveyId
  const surveyId = route.params.id
  if (surveyId) {
    verificationLink.value = responsesService.generateVerifyLink(surveyId)
    console.log('生成验证链接:', verificationLink.value)
  }
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 24px;
}

.success-container {
  background: var(--card);
  border: none;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 700px;
  width: 100%;
  /* 移除陰影和 hover 效果 */
}

.title{
  font-size: 40px;
  font-weight: 400;
  color: var(--text);
  margin: 0;
  line-height: 1.3;
}


.description{
  font-size: 14px;
  color: var(--muted);
  margin: 24px 0;
  text-align: center;
}

.verification-section {
  margin: 32px 0;
  text-align: left;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 24px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.link-container {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.link-input {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f8f9fa;
  color: var(--text);
}

.copy-btn {
  padding: 12px 24px;
  background: var(--text);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #000;
}

.help-text {
  font-size: 12px;
  color: var(--muted);
  margin-top: 8px;
  line-height: 1.5;
}

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
  margin-bottom: 8px;
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

.button-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 32px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 24px 16px;
    align-items: flex-start;
    padding-top: 80px;
  }
  
  .success-container {
    padding: 24px;
    max-width: 100%;
  }
  
  .title {
    font-size: 28px;
  }
  
  .description {
    font-size: 13px;
    margin: 16px 0;
  }
  
  
  .button-group {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }
}

@media (max-width: 480px) {
  .page-wrapper {
    padding: 16px 12px;
    padding-top: 70px;
  }
  
  .success-container {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .description {
    font-size: 12px;
    margin: 12px 0;
  }
  
  /* 手機版連結樣式由 BaseInput 組件處理 */
}
</style>
