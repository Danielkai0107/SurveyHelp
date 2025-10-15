<template>
  <div class="spinner" role="status" aria-label="loading"></div>
</template>
<style scoped>
.spinner{
  width:28px; height:28px; border-radius:50%;
  border:3px solid var(--border); border-top-color:var(--primary);
  animation:spin .9s linear infinite; margin:auto;
}
@keyframes spin{ to{ transform:rotate(360deg) } }
</style>
