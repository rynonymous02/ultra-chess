<template>
  <div class="controls-panel">
    <div class="control-group">
      <button class="btn-primary" @click="$emit('restart-game')">
        <span>Ulang</span>
      </button>
      <button @click="$emit('open-menu')">
        <span>Menu</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['restart-game', 'open-menu']);
</script>

<style scoped>
.controls-panel {
  margin-top: 14px;
}

.control-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
