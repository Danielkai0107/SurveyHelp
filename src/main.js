import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './styles/base.css'
import './styles/element-theme.css'

// Initialize Firebase
import './firebase.js'
import { initFirestoreOptions } from './utils/initFirestore.js'

// 開發模式下導入測試資料腳本
if (import.meta.env.DEV) {
  import('./utils/addTestData.js')
  import('./utils/addTestPoints.js')
  import('./utils/checkPointsRecords.js')
  import('./utils/fixPointsData.js')
}

// Element UI 主題色配置
const elementPlusOptions = {
  // 可以在這裡設置全局配置
}

// Pages
import Explore from './pages/Explore.vue'
import SurveyDetail from './pages/SurveyDetail.vue'
import StartAnswer from './pages/StartAnswer.vue'
import Verify from './pages/Verify.vue'
import MyAnswers from './pages/MyAnswers.vue'
import MySurveys from './pages/MySurveys.vue'
import Profile from './pages/Profile.vue'
import Publish from './pages/Publish.vue'
import EditSurvey from './pages/EditSurvey.vue'
import PublishSuccess from './pages/PublishSuccess.vue'
import Auth from './pages/Auth.vue'
import Terms from './pages/Terms.vue'
import NotFound from './pages/NotFound.vue'

const routes = [
  { path: '/', component: Explore },
  { path: '/s/:id', component: SurveyDetail },
  { path: '/s/:id/start', component: StartAnswer },
  { path: '/verify', component: Verify },
  { path: '/me/profile', component: Profile },
  { path: '/me/answers', component: MyAnswers },
  { path: '/me/surveys', component: MySurveys },
  { path: '/publish', component: Publish },
  { path: '/publish/edit/:id', component: EditSurvey },
  { path: '/publish/:id/success', component: PublishSuccess },
  { path: '/auth', component: Auth },
  { path: '/terms', component: Terms },
  { path: '/:pathMatch(.*)*', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

// 初始化應用
async function initApp() {
  try {
    // 初始化 Firestore 選項資料
    await initFirestoreOptions()
    
    // 掛載應用
    createApp(App).use(ElementPlus).use(router).mount('#app')
  } catch (error) {
    console.error('應用初始化失敗:', error)
    // 即使初始化失敗也要掛載應用
    createApp(App).use(ElementPlus).use(router).mount('#app')
  }
}

initApp()
