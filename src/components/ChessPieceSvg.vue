<template>
  <div
    class="chess-piece-svg-container"
    :style="{
      color: pieceColor,
      width: formattedSize,
      height: formattedSize
    }"
    v-html="svgMarkup"
  />
</template>

<script setup>
import { computed } from 'vue';
import { getPieceSvg } from '../assets/pieces/index.js';

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#f43f5e'
  },
  skin: {
    type: String,
    default: 'default'
  },
  size: {
    type: [Number, String],
    default: '100%'
  }
});

const pieceColor = computed(() => {
  return props.color || '#f43f5e';
});

const formattedSize = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;
  return props.size || '100%';
});

const svgMarkup = computed(() => {
  return getPieceSvg(props.type, props.skin);
});
</script>

<style scoped>
.chess-piece-svg-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  pointer-events: none;
  line-height: 0;
}

.chess-piece-svg-container :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
</style>
