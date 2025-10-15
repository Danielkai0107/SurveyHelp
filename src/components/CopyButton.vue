<template>
  <button class="btn-outline" @click="copy">{{ copied ? '已複製' : '複製' }}</button>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({ text: String })
const copied = ref(false)
const copy = async () => {
  try { await navigator.clipboard.writeText(props.text || '') ; copied.value = true; setTimeout(()=>copied.value=false, 1500) } catch(e){}
}
</script>
