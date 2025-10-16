<template>
  <div class="card">
    <div class="flex gap-3 flex-wrap items-center">
      <BaseInput 
        v-model="keyword" 
        placeholder="🔍 搜尋問卷標題或標籤..." 
        style="flex:1; min-width:200px" 
      />
      <BaseSelect 
        v-model="field" 
        style="min-width:120px"
        placeholder="全部領域"
      >
        <option value="">全部領域</option>
        <option>商業</option>
        <option>學術</option>
        <option>社會</option>
      </BaseSelect>
      <BaseSelect 
        v-model="language" 
        style="min-width:120px"
        placeholder="全部語言"
      >
        <option value="">全部語言</option>
        <option>中文</option>
        <option>English</option>
      </BaseSelect>
      <BaseSelect 
        v-model="sort" 
        style="min-width:140px"
      >
        <option value="new">最新發布</option>
        <option value="popular">填答最多</option>
      </BaseSelect>
      <BaseButton variant="primary" size="small" @click="apply">篩選</BaseButton>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
const emit = defineEmits(['search','filter'])
const keyword = ref('')
const field = ref(''); const language = ref(''); const sort = ref('new')
const apply = () => {
  emit('search', keyword.value)
  emit('filter', { field: field.value, language: language.value, sort: sort.value })
}
</script>
