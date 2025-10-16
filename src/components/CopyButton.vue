<template>
  <BaseButton variant="secondary" size="small" @click="copy">
    {{ copied ? '已複製' : '複製' }}
  </BaseButton>
</template>
<script setup>
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({ text: String })
const copied = ref(false)
const copy = async () => {
  try { 
    await navigator.clipboard.writeText(props.text || '') 
    copied.value = true
    setTimeout(() => copied.value = false, 1500) 
  } catch(e) {}
}
</script>
