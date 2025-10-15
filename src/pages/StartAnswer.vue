<template>
  <div class="card text-center p-8">
    <div class="mb-6">
      <div style="font-size:48px; margin-bottom:16px">🚀</div>
      <h2 class="mb-3">準備開始填答</h2>
      <p class="text-muted">已建立作答會話，將在 <span class="font-semibold" style="color:var(--primary)">{{ sec }}</span> 秒後自動開啟外部問卷</p>
    </div>
    
    <div class="mb-6">
      <div class="progress" style="height:4px; margin:0 auto; max-width:200px">
        <div :style="{ width: ((3-sec)/3*100) + '%' }"></div>
      </div>
    </div>
    
    <div class="flex gap-3 justify-center">
      <a class="btn" :href="ext" target="_blank" rel="noopener">
        ⚡ 立即前往
      </a>
      <router-link class="btn-ghost" :to="`/s/${$route.params.id}`">
        ← 取消返回
      </router-link>
    </div>
    
    <div class="mt-6 p-4 rounded-lg" style="background:var(--hover)">
      <p class="text-muted" style="font-size:14px; margin:0">
        💡 提醒：完成問卷後，請點擊問卷最後的「返回驗證」連結來獲得積分獎勵
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const sec = ref(3)
const ext = 'https://example.org'
let timer
onMounted(()=>{
  timer = setInterval(()=>{ sec.value--; if(sec.value<=0){ window.open(ext,'_blank'); clearInterval(timer) }}, 1000)
})
onBeforeUnmount(()=> clearInterval(timer))
</script>
