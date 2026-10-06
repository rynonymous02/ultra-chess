<template>
  <div class="history-panel neo-card">
    <div class="history-header">
      <div class="title-wrap">
        <span class="history-icon">📜</span>
        <h3 class="history-title">Catatan Langkah</h3>
      </div>
      <span class="badge-count">{{ history.length }} Langkah</span>
    </div>

    <!-- Rating Legend Stickers -->
    <div class="rating-legend">
      <span class="legend-sticker sticker-genius">★ Genius</span>
      <span class="legend-sticker sticker-good">✔ Bagus</span>
      <span class="legend-sticker sticker-blunder">✘ Blunder</span>
    </div>

    <!-- Move List -->
    <div ref="listRef" class="history-list">
      <div v-if="history.length === 0" class="empty-state">
        Belum ada langkah yang dimainkan.
      </div>

      <div
        v-for="(h, idx) in history"
        :key="idx"
        class="history-row"
      >
        <span class="move-num">#{{ idx + 1 }}</span>
        <span class="player-dot" :style="{ backgroundColor: getPlayerColor(h.p) }"></span>
        <div class="move-desc">
          <span class="piece-glyph">{{ getPieceSymbol(h.t) }}</span>
          <span class="algebraic">{{ h.fromNotation }} &rarr; {{ h.toNotation }}</span>
          <span v-if="h.cap" class="capture-text">&times; {{ getPieceSymbol(h.cap) }}</span>
          <span v-if="h.promo" class="promo-text">= ♛</span>
        </div>

        <!-- Rating Badge -->
        <span
          v-if="h.rating"
          :class="['rating-badge', 'bd-' + h.rating]"
          :title="getRatingTitle(h.rating)"
        >
          {{ getRatingLabel(h.rating) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import {
  PLAYERS,
  PIECE_SYMBOLS,
  RATING_BADGES
} from '../models/ChessModel.js';

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  }
});

const listRef = ref(null);

function getPlayerColor(p) {
  return PLAYERS[p]?.color || '#94a3b8';
}

function getPieceSymbol(t) {
  return PIECE_SYMBOLS[t] || '';
}

function getRatingLabel(r) {
  return RATING_BADGES[r]?.label || r;
}

function getRatingTitle(r) {
  return RATING_BADGES[r]?.desc || '';
}

watch(
  () => props.history?.length || 0,
  async () => {
    await nextTick();
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight;
    }
  }
);
</script>

<style scoped>
.history-panel {
  padding: 14px 16px;
  margin-top: 14px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-icon {
  font-size: 18px;
}

.history-title {
  font-size: 16px;
  font-weight: 800;
}

.badge-count {
  font-size: 11px;
  font-weight: 800;
  background: var(--pastel-yellow);
  color: #1e293b;
  border: 1.5px solid var(--border-dark);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  box-shadow: 1.5px 1.5px 0px var(--shadow-color);
}

.rating-legend {
  display: flex;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-dark);
  margin-bottom: 8px;
}

.legend-sticker {
  font-size: 11px;
  font-weight: 800;
  border: 1.5px solid var(--border-dark);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  box-shadow: 1px 1px 0px var(--shadow-color);
}

.sticker-genius { background: var(--pastel-purple); color: #5b21b6; }
.sticker-good { background: var(--pastel-green); color: #15803d; }
.sticker-blunder { background: var(--pastel-rose); color: #9f1239; }

.history-list {
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-state {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 16px 0;
  font-weight: 500;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 13px;
  border-bottom: 1px dashed var(--border-dark);
}

.history-row:hover {
  background: rgba(0, 0, 0, 0.03);
}

.move-num {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
  min-width: 24px;
}

.player-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid var(--border-dark);
  flex-shrink: 0;
}

.move-desc {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.piece-glyph {
  font-size: 15px;
}

.algebraic {
  font-family: var(--font-mono);
  font-weight: 700;
}

.capture-text {
  color: #e11d48;
  font-weight: 800;
  font-size: 12px;
}

.promo-text {
  color: #d97706;
  font-weight: 800;
  font-size: 12px;
}

.rating-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--border-dark);
  box-shadow: 1px 1px 0px var(--shadow-color);
}

.bd-genius { background: var(--pastel-purple); color: #5b21b6; }
.bd-good { background: var(--pastel-green); color: #15803d; }
.bd-blunder { background: var(--pastel-rose); color: #9f1239; }
</style>
