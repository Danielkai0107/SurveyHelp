<template>
  <AuthGuard>
    <div class="grid" style="gap:12px">
    <div class="card" style="display:flex; gap:8px">
      <button :class="tab==='doing'?'btn':'btn-ghost'" @click="tab='doing'">進行中</button>
      <button :class="tab==='done'?'btn':'btn-ghost'" @click="tab='done'">已完成</button>
      <button :class="tab==='expired'?'btn':'btn-ghost'" @click="tab='expired'">逾期</button>
    </div>
    <template v-if="list.length">
      <div class="grid cols-2">
        <div v-for="item in list" :key="item.id" class="card">
          <div style="display:flex; justify-content:space-between">
            <h3 style="margin:0">{{ item.title }}</h3>
            <span class="status" :class="badge(item.status)">{{ item.statusText }}</span>
          </div>
          <p style="color:var(--muted); margin:6px 0 12px">{{ item.time }}</p>
          <BaseButton variant="primary" size="default" :to="`/s/${item.sid}`">查看詳情</BaseButton>
        </div>
      </div>
    </template>
    <EmptyState v-else title="暫無資料" subtitle="去探索頁看看吧" ctaText="探索問卷" to="/" />
    </div>
  </AuthGuard>
</template>
<script setup>
import { ref, computed } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import BaseButton from '../components/BaseButton.vue'
import AuthGuard from '../components/AuthGuard.vue'
const tab = ref('doing')
const data = ref({
  doing:[
    {id:'1', sid:'a1', title:'大學生消費習慣', status:'doing', statusText:'進行中', time:'開始於 5 分鐘前'},
    {id:'3', sid:'a4', title:'社群媒體使用行為', status:'doing', statusText:'進行中', time:'開始於 2 小時前'}
  ],
  done:[
    {id:'2', sid:'a2', title:'外送平台滿意度', status:'done', statusText:'已完成', time:'完成於 昨天 14:20'},
    {id:'4', sid:'a6', title:'環保意識調查', status:'done', statusText:'已完成', time:'完成於 3 天前 09:15'},
    {id:'5', sid:'a8', title:'健康飲食習慣', status:'done', statusText:'已完成', time:'完成於 1 週前 16:30'}
  ],
  expired:[
    {id:'6', sid:'a5', title:'線上學習效果評估', status:'expired', statusText:'已逾期', time:'逾期於 2 天前'}
  ]
})
const list = computed(()=> data.value[tab.value] || [])
const badge = s => s==='done'?'success':s==='doing'?'warn':''
</script>
