<template>
  <div class="app">
    <!-- 頂部欄 -->
    <header class="top-bar">
      <div class="top-bar-left">
        <button class="sidebar-toggle-btn" @click="toggleSidebar">
          <span class="toggle-icon" :class="{ 'rotated': sidebarCollapsed && !isMobile }">
            {{ sidebarCollapsed && !isMobile ? '→' : '☰' }}
          </span>
        </button>
        <router-link class="logo" to="/">
          <span class="logo-text">SurveyHelp</span>
        </router-link>
      </div>
      
      <div class="top-bar-right">
        <router-link to="/auth" class="auth-btn">
          <span class="auth-text">登入</span>
        </router-link>
      </div>
    </header>

    <!-- 側邊欄 -->
    <aside class="sidebar" :class="{ 
      'sidebar-open': sidebarOpen, 
      'sidebar-collapsed': sidebarCollapsed && !isMobile 
    }">
      <nav class="sidebar-nav">
        <div class="nav-section">
          <router-link to="/" class="nav-item" @click="handleNavClick">
            <span class="nav-text">探索問卷</span>
            <span class="nav-arrow">›</span>
          </router-link>
          <router-link to="/publish" class="nav-item" @click="handleNavClick">
            <span class="nav-text">發布問卷</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">我的</div>
          <router-link to="/me/answers" class="nav-item" @click="handleNavClick">
            <span class="nav-text">我的填答</span>
            <span class="nav-arrow">›</span>
          </router-link>
          <router-link to="/me/surveys" class="nav-item" @click="handleNavClick">
            <span class="nav-text">我發布的</span>
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

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const windowWidth = ref(window.innerWidth)

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
  background: #fafafa;
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
  border-bottom: 1px solid var(--border);
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
  background: var(--hover);
}

.toggle-icon {
  font-size: 18px;
  color: var(--text);
  transition: all 0.3s ease;
  display: inline-block;
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

.auth-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--text);
  color: white;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.auth-btn:hover {
  background: #000;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.auth-icon {
  font-size: 16px;
}

.auth-text {
  font-weight: 500;
}

/* 側邊欄樣式 */
.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid var(--border);
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
  justify-content: space-between;
  padding: 12px 20px;
  color: var(--text);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  border-radius: 0;
  position: relative;
  text-decoration: none;
  border-radius: 12px;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: var(--hover);
  color: var(--text);
}

.nav-item.router-link-active {
  background: var(--hover);
  color: var(--text);
  font-weight: 600;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--text);
}

.nav-text {
  flex: 1;
  transition: all 0.3s ease;
}

.nav-arrow {
  font-size: 16px;
  color: var(--muted);
  transition: all 0.2s;
  opacity: 0;
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

/* 側邊欄遮罩 */
@media (max-width: 768px) {
  .sidebar.sidebar-open::after {
    content: '';
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}
</style>