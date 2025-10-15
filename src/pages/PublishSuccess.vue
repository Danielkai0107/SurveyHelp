<template>
  <div class="card">
    <h2>發布成功 🎉</h2>
    <p style="color:var(--muted)">請將以下「返回驗證固定連結」貼到外部問卷的最後一頁：</p>
    <div class="card" style="display:flex; align-items:center; gap:8px">
      <code style="word-break:break-all">{{ link }}</code>
      <CopyButton :text="link" />
    </div>
    <ul style="color:var(--muted); line-height:1.8">
      <li>建議同時在外部問卷最後一題附上「返回平台完成驗證」超連結。</li>
      <li>發布後請自行測試一次完整流程。</li>
    </ul>
    <div style="display:flex; gap:8px">
      <router-link class="btn" to="/me/surveys">前往「我發布的」</router-link>
      <router-link class="btn-ghost" to="/">回首頁</router-link>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CopyButton from '../components/CopyButton.vue'
const route = useRoute()
const link = computed(()=> `https://app.example.com/verify?surveyId=${route.params.id}`)
</script>
