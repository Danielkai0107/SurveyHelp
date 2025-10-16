<template>
  <AuthGuard>
    <div class="grid" style="gap:12px">
    <div class="card">
      <h2 style="margin:0 0 12px">我發布的問卷</h2>
      <div class="grid cols-2">
        <div v-for="s in mine" :key="s.id" class="card">
          <h3 style="margin:0 0 6px">{{ s.title }}</h3>
          <div style="margin:6px 0 8px"><div class="status" :class="{success:s.active}">{{ s.active?'上架中':'已下架' }}</div></div>
          <el-progress 
            :percentage="Math.round((s.filled/s.target)*100)" 
            :show-text="false"
            :stroke-width="6"
          />
          <p style="color:var(--muted); font-size:12px; margin-top:6px">已填 {{ s.filled }} / 目標 {{ s.target }}</p>
          <div style="display:flex; gap:8px; margin-top:10px">
            <CopyButton :text="`${base}/verify?surveyId=${s.id}`" />
            <BaseButton variant="secondary" size="small">{{ s.active ? '下架' : '重新上架' }}</BaseButton>
          </div>
        </div>
      </div>
    </div>
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'
import BaseButton from '../components/BaseButton.vue'
import AuthGuard from '../components/AuthGuard.vue'
const base = 'https://app.example.com'
const mine = ref([
  {id:'a1', title:'大學生消費習慣', active:true, filled:18, target:50},
  {id:'a2', title:'外送平台滿意度', active:true, filled:120, target:300},
  {id:'a9', title:'職場壓力調查', active:false, filled:45, target:100},
  {id:'a10', title:'購物偏好研究', active:true, filled:78, target:200}
])
</script>
