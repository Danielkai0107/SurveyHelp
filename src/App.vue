<template>
  <div class="app">
    <!-- 頂部欄 -->
    <header class="top-bar">
      <div class="top-bar-left">
        <button class="sidebar-toggle-btn" @click="toggleSidebar">
        <span class="toggle-icon" :class="{ 
          'rotated': sidebarCollapsed && !isMobile,
          'hamburger': sidebarCollapsed && !isMobile,
          'arrow': !sidebarCollapsed || isMobile
        }">
          {{ sidebarCollapsed && !isMobile ? '☰' : '←' }}
        </span>
        </button>
        <router-link class="logo" to="/">
          <span class="logo-text">SurveyHelp</span>
        </router-link>
      </div>
      
      <div class="top-bar-right">
        <div v-if="isLoading" class="auth-loading">載入中...</div>
        <div v-else-if="user" class="user-menu">
          <router-link to="/me/profile" class="user-info" @click="handleNavClick">
            <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName" class="user-avatar">
            <span class="user-name">{{ user.displayName || user.email }}</span>
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
            <span class="nav-text">發起互填</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">我的</div>
          <router-link to="/me/answers" class="nav-item" @click="handleNavClick">
            <span class="material-symbols-rounded nav-icon">assignment</span>
            <span class="nav-text">回填管理</span>
            <span class="nav-arrow">›</span>
          </router-link>
          <router-link to="/me/surveys" class="nav-item" @click="handleNavClick">
            <span class="material-symbols-rounded nav-icon">poll</span>
            <span class="nav-text">我的問卷</span>
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
        <a href="#">服務條款</a> · <a href="#">隱私權</a> · <a href="#">聯絡我們</a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from './composables/useAuth.js'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const windowWidth = ref(window.innerWidth)

// 認證狀態
const { user, isLoading, logout, initAuth } = useAuth()

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
  initAuth() // 初始化認證狀態
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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
  display: flex;
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
}

.sidebar-toggle-btn:hover {
  background: #f5f5f5;
}

.toggle-icon {
  font-size: 18px;
  color: var(--text);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.toggle-icon.hamburger {
  margin-top: 3px;
}

.toggle-icon.arrow {
  margin-top: 0px;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 18px;
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
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: var(--text);
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
  background: var(--hover);
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

.footer a {
  color: var(--muted);
  transition: color 0.2s;
}

.footer a:hover {
  color: var(--text);
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
    font-size: 20px;
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