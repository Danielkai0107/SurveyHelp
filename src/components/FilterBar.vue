<template>
  <div class="card">
    <div class="flex gap-3 flex-wrap items-center">
      <input class="input" v-model="keyword" placeholder="🔍 搜尋問卷標題或標籤..." style="flex:1; min-width:200px" />
      <select class="input" v-model="field" style="min-width:120px">
        <option value="">全部領域</option>
        <option>商業</option><option>學術</option><option>社會</option>
      </select>
      <select class="input" v-model="language" style="min-width:120px">
        <option value="">全部語言</option>
        <option>中文</option><option>English</option>
      </select>
      <select class="input" v-model="sort" style="min-width:140px">
        <option value="new">最新發布</option>
        <option value="popular">填答最多</option>
      </select>
      <button class="btn" @click="apply">篩選</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const emit = defineEmits(['search','filter'])
const keyword = ref('')
const field = ref(''); const language = ref(''); const sort = ref('new')
const apply = () => {
  emit('search', keyword.value)
  emit('filter', { field: field.value, language: language.value, sort: sort.value })
}
</script>
