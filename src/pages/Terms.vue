<template>
  <div class="terms-page">
    <!-- 固定標題區域 -->
    <div class="sticky-header">
      <!-- 頁面標題和返回按鈕 -->
      <div class="page-header">
        <h1 class="page-title">條款與政策</h1>
        <button @click="goBack" class="back-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 標籤篩選 -->
      <div class="tabs-container">
        <button :class="['tab-btn', { active: activeTab === 'privacy' }]" @click="switchTab('privacy')">隱私權政策</button>
        <button :class="['tab-btn', { active: activeTab === 'terms' }]" @click="switchTab('terms')">服務條款</button>
      </div>
    </div>

    <!-- 可滾動內容區域 -->
    <div ref="scrollableContent" class="scrollable-content">
      <!-- 載入狀態 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-text">載入中...</div>
      </div>
      
      <!-- 內容區域 -->
      <div v-else-if="currentContent" class="content-area">
        <div class="content-text" v-html="currentContent"></div>
      </div>
      
      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <div class="empty-title">暫無內容</div>
        <div class="empty-description">
          內容正在準備中
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { settingsService } from '../services/settings.js'

const router = useRouter()
const route = useRoute()

// 狀態管理
const activeTab = ref('privacy')
const termsData = ref({
  privacy: '',
  terms: ''
})
const isLoading = ref(false)
const scrollableContent = ref(null)

// 當前顯示的內容
const currentContent = computed(() => {
  return termsData.value[activeTab.value] || ''
})

// 监听 URL 参数变化
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'terms' || newTab === 'privacy') {
    activeTab.value = newTab
    // 滚动 scrollable-content 区域到顶部
    if (scrollableContent.value) {
      scrollableContent.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
})

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab
  // 滚动到顶部
  if (scrollableContent.value) {
    scrollableContent.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 返回功能
const goBack = () => {
  router.back()
}

// 載入條款內容
const loadTerms = async () => {
  try {
    isLoading.value = true
    console.log('載入條款內容...')
    
    // 從 Firestore 載入隱私權政策和服務條款
    const [privacy, terms] = await Promise.all([
      settingsService.getPrivacyPolicy(),
      settingsService.getTermsOfService()
    ])
    
    termsData.value = {
      privacy,
      terms
    }
    
    console.log('條款載入完成')
    
  } catch (error) {
    console.error('載入條款失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 初始化
onMounted(() => {
  // 根据 URL 参数设置默认标签
  const tabParam = route.query.tab
  if (tabParam === 'terms' || tabParam === 'privacy') {
    activeTab.value = tabParam
  }
  
  loadTerms()
  
  // 确保滚动区域在顶部
  if (scrollableContent.value) {
    scrollableContent.value.scrollTo({ top: 0 })
  }
})
</script>

<style scoped>
.terms-page {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 固定標題區域 */
.sticky-header {
  position: sticky;
  top: 64px;
  background: #ffffff;
  z-index: 160;
  padding: 24px 32px 0;
  width: calc(100% + 64px);
  margin-left: -32px;
}

.page-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  display: flex;
  align-items: center;
  height: 64px;
  font-size: 40px;
  font-weight: 400;
  color: var(--text);
  margin: 0;
}

/* 返回按鈕 */
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: white;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  border-color: var(--text);
}

/* 標籤篩選 */
.tabs-container {
  display: flex;
  gap: 0;
  margin-bottom: 0;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 400;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  color: var(--text);
  border-bottom-color: var(--text);
}

/* 可滾動內容區域 */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 0;
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

/* 空狀態 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 400;
  color: #6c6c6c;
}

.empty-description {
  font-size: 13px;
  color: #9d9d9d;
  max-width: 400px;
  line-height: 1.5;
}

/* 內容區域 */
.content-area {
  margin: 0 auto;
}

.content-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text);
}

.content-text :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin: 32px 0 16px 0;
}

.content-text :deep(h2:first-child) {
  margin-top: 0;
}

.content-text :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 24px 0 12px 0;
}

.content-text :deep(p) {
  margin: 16px 0;
  color: var(--text);
}

.content-text :deep(ul),
.content-text :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.content-text :deep(li) {
  margin: 8px 0;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .sticky-header {
    padding: 20px 24px 0;
    width: calc(100% + 48px);
    margin-left: -24px;
  }
  
  .content-area {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .sticky-header {
    padding: 16px 20px 0;
    width: calc(100% + 40px);
    margin-left: -20px;
  }
  
  .scrollable-content {
    padding: 24px 0;
  }
  
  .content-area {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 28px;
    height: 48px;
  }
  
  .back-button {
    width: 36px;
    height: 36px;
  }
  
  .tabs-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-btn {
    flex-shrink: 0;
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .sticky-header {
    padding: 12px 16px 0;
    width: calc(100% + 32px);
    margin-left: -16px;
  }
  
  .scrollable-content {
    padding: 20px 0;
  }
  
  .content-area {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>

