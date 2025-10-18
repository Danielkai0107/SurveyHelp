<template>
  <div class="app">
    <!-- 頂部欄 -->
    <header class="top-bar">
      <div class="top-bar-left">
        <router-link class="logo" to="/">
          <span class="logo-text">SurveyHelp</span>
        </router-link>
        <button class="sidebar-toggle-btn" @click="toggleSidebar">
          <!-- 侧边栏折叠时显示打开图标（有分隔线） -->
          <svg v-if="sidebarCollapsed && !isMobile" class="toggle-icon" width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.17922 18.9754 7.55292 18.9882 8 18.9943V5.0057C7.55292 5.01184 7.17922 5.02462 6.85424 5.05118ZM10 5V19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H10Z" fill="currentColor"></path>
          </svg>
          <!-- 侧边栏展开时显示关闭图标（没有分隔线） -->
          <svg v-else class="toggle-icon" width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.47108 18.9992 8.26339 19 9.4 19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H9.4C8.26339 5 7.47108 5.00078 6.85424 5.05118ZM7 7C7.55229 7 8 7.44772 8 8V16C8 16.5523 7.55229 17 7 17C6.44772 17 6 16.5523 6 16V8C6 7.44772 6.44772 7 7 7Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
      
      <div class="top-bar-right">
        <div v-if="isLoading" class="auth-loading">載入中...</div>
        <div v-else-if="user" class="user-menu">
          <router-link to="/me/profile" class="user-info" @click="handleNavClick">
            <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName" class="user-avatar">
            <div class="user-info-text">
              <span class="user-name">{{ user.displayName || user.email }}</span>
              <span class="user-points">{{ userPoints }} 積分</span>
            </div>
          </router-link>
          <button @click="handleLogout" class="logout-btn">登出</button>
        </div>
        <router-link v-else to="/auth" class="auth-btn">
          <span class="auth-text">登入</span>
        </router-link>
      </div>
    </header>

    <!-- 側邊欄 -->
    <aside class="sidebar" :class="{ 
      'sidebar-open': sidebarOpen, 
      'sidebar-collapsed': sidebarCollapsed && !isMobile 
    }">
      <!-- 手機版側邊欄頂部 logo -->
      <div v-if="isMobile" class="sidebar-header">
        <div class="sidebar-logo">
          <span class="logo-text">SurveyHelp</span>
        </div>
        <button @click="closeSidebar" class="sidebar-close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <router-link to="/" class="nav-item" @click="handleNavClick">
            <span class="material-symbols-rounded nav-icon">explore</span>
            <span class="nav-text">探索問卷</span>
            <span class="nav-arrow">›</span>
          </router-link>
          <router-link to="/publish" class="nav-item" @click="handleNavClick">
            <span class="material-symbols-rounded nav-icon">hand_gesture</span>
            <span class="nav-text">我要發布</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">我的</div>
          <router-link to="/me/answers" class="nav-item" @click="handleNavClick">
            <span class="material-symbols-rounded nav-icon">assignment</span>
            <span class="nav-text">互惠管理</span>
            <span class="nav-arrow">›</span>
          </router-link>
          <router-link to="/me/surveys" class="nav-item" @click="handleNavClick">
            <span class="material-symbols-rounded nav-icon">poll</span>
            <span class="nav-text">我的貼文</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- 主要內容區域 -->
    <div class="main-wrapper" :class="{ 
      'main-collapsed': sidebarCollapsed && !isMobile 
    }">
      <main class="main-content">
        <router-view />
      </main>

      <footer class="footer">
        <router-link to="/terms?tab=terms">服務條款</router-link> · <router-link to="/terms?tab=privacy">隱私權</router-link> · <a href="#">聯絡我們</a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from './composables/useAuth.js'
import { pointsService } from './services/points.js'
import { expireCheckService } from './services/expireCheck.js'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const windowWidth = ref(window.innerWidth)

// 認證狀態
const { user, isLoading, logout, initAuth } = useAuth()

// 用戶積分
const userPoints = ref(0)

// 載入用戶積分
const loadUserPoints = async () => {
  if (!user.value) {
    userPoints.value = 0
    return
  }
  
  try {
    const points = await pointsService.getUserTotalPoints(user.value.uid)
    userPoints.value = points || 0
  } catch (error) {
    console.error('載入積分失敗:', error)
    userPoints.value = 0
  }
}

// 監聽用戶變化，自動載入積分
watch(user, (newUser) => {
  if (newUser) {
    loadUserPoints()
    // 啟動過期檢查服務
    expireCheckService.startAutoCheck()
  } else {
    userPoints.value = 0
    // 停止過期檢查服務
    expireCheckService.stopAutoCheck()
  }
}, { immediate: true })

// 監聽積分更新事件
const handlePointsUpdate = () => {
  console.log('收到積分更新事件，重新載入積分')
  loadUserPoints()
}

// 處理登出
const handleLogout = async () => {
  try {
    await logout()
    console.log('登出成功')
  } catch (error) {
    console.error('登出失敗:', error)
  }
}

// 檢測是否為手機版
const isMobile = computed(() => windowWidth.value <= 768)

// 處理視窗大小變化
const handleResize = () => {
  windowWidth.value = window.innerWidth
  // 手機版時自動關閉側邊欄
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

// 切換側邊欄狀態
const toggleSidebar = () => {
  if (isMobile.value) {
    // 手機版：開關側邊欄
    sidebarOpen.value = !sidebarOpen.value
  } else {
    // 桌面版：收合/展開側邊欄
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// 關閉側邊欄（手機版）
const closeSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

// 處理導航點擊
const handleNavClick = () => {
  if (isMobile.value) {
    closeSidebar()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('points-updated', handlePointsUpdate)
  initAuth() // 初始化認證狀態
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('points-updated', handlePointsUpdate)
  // 清理過期檢查服務
  expireCheckService.stopAutoCheck()
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
}

/* 頂部欄 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 200;
}

.top-bar-left {
  width: 176px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.top-bar-right {
  display: flex;
  align-items: center;
}

.sidebar-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  margin-top: 3px;
}

.sidebar-toggle-btn:hover {
  opacity: 0.5;
}

.toggle-icon {
  color: var(--text);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.toggle-icon svg {
  width: 18px;
  height: 18px;
}

.toggle-icon.arrow {
  font-size: 24px;
  font-weight: bold;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 22px;
  color: var(--text);
  letter-spacing: -0.02em;
  transition: all 0.2s;
}

.logo:hover {
  color: var(--primary);
}

.logo-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hover);
  border-radius: 12px;
}

.auth-loading {
  font-size: 14px;
  color: var(--muted);
  padding: 8px 16px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.user-info:hover {
  background: var(--hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

.user-points {
  font-size: 11px;
  font-weight: 600;
  color: #22c55e;
  line-height: 1;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  background-color: #f5f5f5;
  color: #000000;
  border: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #e1e1e1;
}

.auth-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  background-color: #f5f5f5;
  color: #000000;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  text-decoration: none;
}

.auth-btn:hover {
  background: #e1e1e1;
}

.auth-icon {
  font-size: 16px;
}

.auth-text {
  font-size: 14px;
  font-weight: 500;
}

/* 側邊欄樣式 */
.sidebar {
  width: 200px;
  background: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 64px;
  z-index: 100;
  transition: all 0.3s ease;
}

.sidebar.sidebar-collapsed {
  width: 0;
  border-right: none;
  overflow: hidden;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.nav-section {
  width: 100%;
  margin-bottom: 32px;
}

.nav-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 20px 12px;
  transition: all 0.3s ease;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--muted);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  border-radius: 12px;
  position: relative;
  text-decoration: none;
  margin-bottom: 4px;
  text-wrap: nowrap;
}

.nav-icon {
  font-size: 20px;
  color: var(--muted);
  transition: all 0.2s ease;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}

.nav-item:hover {
  color: var(--text);
}

.nav-item:hover .nav-icon {
  color: var(--text);
}

.nav-item.router-link-active {
  background: #f5f5f5;
  color: var(--text);
  font-weight: 600;
}

.nav-item.router-link-active .nav-icon {
  color: var(--text);
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20;
}

.nav-text {
  flex: 1;
  transition: all 0.3s ease;
}

.nav-arrow {
  font-size: 16px;
  color: var(--muted);
  opacity: 0;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.nav-divider {
  height: 1px;
  background: var(--border);
  margin: 24px 32px;
}

/* 收合狀態樣式 */
.sidebar-collapsed .nav-section-title {
  opacity: 0;
  padding: 0;
  height: 0;
  margin: 0;
  overflow: hidden;
}

.sidebar-collapsed .nav-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-collapsed .nav-arrow {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-collapsed .nav-item {
  padding: 12px;
  justify-content: center;
  margin: 4px 8px;
  border-radius: 8px;
}

/* 主要內容區域 */
.main-wrapper {
  flex: 1;
  margin-left: 200px;
  margin-top: 64px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease;
}

.main-wrapper.main-collapsed {
  margin-left: 0;
}

.main-content {
  flex: 1;
  padding: 0 32px 32px 32px;
  width: 100%;
}

.main-wrapper.main-collapsed .main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  padding: 8px 32px;
  height: 32px;
  font-size: 12px;
  text-align: center;
  color: var(--muted);
  border-top: 1px solid var(--border);
  background: white;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.footer a,
.footer a:visited {
  color: var(--muted);
  transition: color 0.2s;
  text-decoration: none;
}

.footer a:hover {
  color: var(--text);
  text-decoration: underline;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .top-bar {
    padding: 0 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .auth-text {
    display: none;
  }
  
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 150;
    top: 64px;
    height: calc(100vh - 64px);
    width: 200px;
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar.sidebar-collapsed {
    width: 200px;
  }
  
  .sidebar-collapsed .nav-section-title {
    opacity: 1;
    padding: 0 20px 12px;
    height: auto;
  }
  
  .sidebar-collapsed .nav-text {
    opacity: 1;
    width: auto;
    overflow: visible;
  }
  
  .sidebar-collapsed .nav-arrow {
    opacity: 0;
    width: auto;
    overflow: visible;
  }
  
  .sidebar-collapsed .nav-item {
    padding: 12px 20px;
    justify-content: space-between;
    margin: 0;
    border-radius: 0;
  }
  
  .main-wrapper {
    margin-left: 0;
  }
  
  .main-wrapper.main-collapsed {
    margin-left: 0;
  }
  
  .main-content {
    padding: 0 20px 20px 20px;
  }
}

/* 手機版側邊欄 */
@media (max-width: 768px) {
  .sidebar {
    width: 100vw; /* 填滿整個螢幕寬度 */
    left: -100vw; /* 預設隱藏在左側 */
  }
  
  .sidebar.sidebar-open {
    left: 0; /* 顯示時填滿螢幕 */
  }
  
  .sidebar.sidebar-open::after {
    display: none; /* 移除遮罩，因為已經填滿螢幕 */
  }
  
  /* 側邊欄頂部 */
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: white;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    z-index: 10;
  }
  
  .sidebar-logo .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }
  
  .sidebar-close-btn {
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
  }
  
  .sidebar-close-btn:hover {
    border-color: var(--text);
    background: var(--hover);
  }
  
  /* 側邊欄內容區域 */
  .sidebar-nav {
    padding: 80px 24px 24px; /* 上方留空給 header */
  }
}
</style>