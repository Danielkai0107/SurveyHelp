import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/base.css'

// Pages
import Explore from './pages/Explore.vue'
import SurveyDetail from './pages/SurveyDetail.vue'
import StartAnswer from './pages/StartAnswer.vue'
import Verify from './pages/Verify.vue'
import MyAnswers from './pages/MyAnswers.vue'
import MySurveys from './pages/MySurveys.vue'
import Publish from './pages/Publish.vue'
import PublishSuccess from './pages/PublishSuccess.vue'
import Auth from './pages/Auth.vue'
import NotFound from './pages/NotFound.vue'

const routes = [
  { path: '/', component: Explore },
  { path: '/s/:id', component: SurveyDetail },
  { path: '/s/:id/start', component: StartAnswer },
  { path: '/verify', component: Verify },
  { path: '/me/answers', component: MyAnswers },
  { path: '/me/surveys', component: MySurveys },
  { path: '/publish', component: Publish },
  { path: '/publish/:id/success', component: PublishSuccess },
  { path: '/auth', component: Auth },
  { path: '/:pathMatch(.*)*', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

createApp(App).use(router).mount('#app')
