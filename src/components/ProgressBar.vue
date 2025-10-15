<template>
  <div class="progress"><div :style="{ width: value + '%' }" /></div>
</template>
<script setup>
defineProps({ value: { type: Number, default: 0 } })
</script>
