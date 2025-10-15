<template>
  <div class="card" style="text-align:center; padding:32px">
    <h3 style="margin:0 0 6px">{{ title }}</h3>
    <p style="color:var(--muted); margin:0 0 12px">{{ subtitle }}</p>
    <router-link v-if="to" :to="to" class="btn">{{ ctaText || '去看看' }}</router-link>
  </div>
</template>
<script setup>
defineProps({ title:String, subtitle:String, ctaText:String, to:String })
</script>
