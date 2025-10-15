<template>
  <div class="card text-center p-8">
    <div v-if="loading" class="mb-6">
      <LoadingSpinner />
      <h2 class="mb-3 mt-4">正在驗證中...</h2>
      <p class="text-muted">請稍候，我們正在確認您的填答記錄</p>
    </div>
    
    <div v-else>
      <template v-if="ok">
        <div class="mb-6">
          <div style="font-size:64px; margin-bottom:16px">🎉</div>
          <h2 class="mb-3" style="color:var(--success)">驗證成功！</h2>
          <div class="p-4 rounded-lg mb-4" style="background:#f0fff4; border:1px solid #9ae6b4">
            <p class="font-semibold" style="color:#22543d; margin:0">
              🎁 恭喜您獲得 +10 積分獎勵
            </p>
          </div>
          <p class="text-muted">感謝您的參與，積分已自動入帳到您的帳戶</p>
        </div>
        
        <div class="flex gap-3 justify-center">
          <router-link class="btn" to="/">
            🏠 回到首頁
          </router-link>
          <router-link class="btn-ghost" to="/me/answers">
            📋 查看我的填答
          </router-link>
        </div>
      </template>
      
      <template v-else>
        <div class="mb-6">
          <div style="font-size:48px; margin-bottom:16px">❌</div>
          <h2 class="mb-3" style="color:var(--danger)">驗證失敗</h2>
          <div class="p-4 rounded-lg mb-4" style="background:#fed7d7; border:1px solid #fc8181">
            <p class="font-medium" style="color:#c53030; margin:0">{{ reason }}</p>
          </div>
          <p class="text-muted">請檢查填答是否完整，或聯繫客服協助處理</p>
        </div>
        
        <div class="flex gap-3 justify-center">
          <router-link class="btn" :to="detailLink">
            🔄 重新嘗試
          </router-link>
          <router-link class="btn-ghost" to="/">
            🏠 回到首頁
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '../components/LoadingSpinner.vue'
const route = useRoute()
const loading = ref(true); const ok = ref(false); const reason = ref('找不到待驗證紀錄')
onMounted(()=>{
  setTimeout(()=>{
    if(route.query.fail){ ok.value = false; reason.value = '模擬失敗（?fail=1）' }
    else ok.value = true
    loading.value = false
  }, 1200)
})
const detailLink = computed(()=> `/s/${route.query.surveyId || 'a1'}`)
</script>
