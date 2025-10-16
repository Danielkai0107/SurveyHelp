<template>
  <label class="custom-checkbox-item">
    <input 
      type="checkbox" 
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="custom-checkbox-input"
    />
    <span class="custom-checkbox-text">
      <slot></slot>
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.custom-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
}

.custom-checkbox-input {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #b4b4b4;
  background-color: #ffffff;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.custom-checkbox-input:checked {
  background-color: #000000;
  border-color: #000000;
}

.custom-checkbox-input:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.custom-checkbox-text {
  flex: 1;
}
</style>
