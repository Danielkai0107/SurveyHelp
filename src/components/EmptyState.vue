<template>
  <div class="card" style="text-align:center; padding:32px">
    <h3 style="margin:0 0 6px">{{ title }}</h3>
    <p style="color:var(--muted); margin:0 0 12px">{{ subtitle }}</p>
    <BaseButton v-if="to" variant="primary" size="default" :to="to">{{ ctaText || '去看看' }}</BaseButton>
  </div>
</template>
<script setup>
import BaseButton from './BaseButton.vue'
defineProps({ title:String, subtitle:String, ctaText:String, to:String })
</script>
