<template>
  <div class="map-skirmish-card neo-card">
    <div class="card-header">
      <h3 class="card-title">Map Catur</h3>
    </div>

    <!-- Mini Visual Chess Board Preview -->
    <div class="board-preview-container neo-card">
      <!-- 8x8 Standard Board (1 vs 1) -->
      <template v-if="currentMap === 'default-lane'">
        <div
          class="mini-grid grid-8x8"
          role="img"
          aria-label="Preview Papan Catur 8x8"
        >
          <template v-for="r in 8" :key="'pr8_' + (r - 1)">
            <div
              v-for="c in 8"
              :key="'pc8_' + (r - 1) + '_' + (c - 1)"
              :class="['mini-cell', (r + c) % 2 === 0 ? 'light' : 'dark']"
            >
              <span
                v-if="getPiece8x8(r - 1, c - 1)"
                class="mini-piece"
                :style="{ color: getPiece8x8(r - 1, c - 1).color }"
              >
                {{ getPieceSymbol(getPiece8x8(r - 1, c - 1).t) }}
              </span>
            </div>
          </template>
        </div>

        <!-- 2 Spawn Beacons for 1v1 -->
        <div
          class="spawn-beacon beacon-top-8"
          :style="{ backgroundColor: getSpawnPlayer(2)?.color || '#0ea5e9' }"
        >
          <span>2</span>
        </div>
        <div
          class="spawn-beacon beacon-bottom-8"
          :style="{ backgroundColor: getSpawnPlayer(1)?.color || '#f43f5e' }"
        >
          <span>1</span>
        </div>
      </template>

      <!-- 14x14 Plus-Lane Board (4P) -->
      <template v-else>
        <div
          class="mini-grid grid-14x14"
          role="img"
          aria-label="Preview Papan Catur 14x14"
        >
          <template v-for="r in 14" :key="'pr14_' + (r - 1)">
            <div
              v-for="c in 14"
              :key="'pc14_' + (r - 1) + '_' + (c - 1)"
              :class="getCellClass14(r - 1, c - 1)"
            >
              <span
                v-if="getPiece14(r - 1, c - 1)"
                class="mini-piece"
                :style="{ color: getPiece14(r - 1, c - 1).color }"
              >
                {{ getPieceSymbol(getPiece14(r - 1, c - 1).t) }}
              </span>
            </div>
          </template>
        </div>

        <!-- 4 Spawn Beacons for 4P -->
        <div
          class="spawn-beacon beacon-north"
          :style="{ backgroundColor: getSpawnPlayer(3)?.color || '#eab308' }"
        >
          <span>3</span>
        </div>
        <div
          class="spawn-beacon beacon-west"
          :style="{ backgroundColor: getSpawnPlayer(2)?.color || '#0ea5e9' }"
        >
          <span>2</span>
        </div>
        <div
          class="spawn-beacon beacon-east"
          :style="{ backgroundColor: getSpawnPlayer(4)?.color || '#10b981' }"
        >
          <span>4</span>
        </div>
        <div
          class="spawn-beacon beacon-south"
          :style="{ backgroundColor: getSpawnPlayer(1)?.color || '#f43f5e' }"
        >
          <span>1</span>
        </div>
      </template>
    </div>

    <!-- Map List Section -->
    <div class="map-list-section">
      <div class="section-label">Map List</div>

      <div class="map-buttons-list">
        <button
          v-for="preset in mapPresets"
          :key="preset.id"
          type="button"
          :class="['map-item-btn', { active: currentMap === preset.id }]"
          @click="selectMap(preset.id)"
        >
          <span class="map-name">{{ preset.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  isValidCell,
  BACK_RANK_ORDER,
  PIECE_SYMBOLS,
  MAP_PRESETS
} from '../models/ChessModel.js';

const props = defineProps({
  currentMap: {
    type: String,
    default: 'plus-lane'
  },
  players: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:map']);

const mapPresets = MAP_PRESETS;

function selectMap(id) {
  emit('update:map', id);
}

function getSpawnPlayer(spawnNum) {
  return props.players.find(p => p.spawn === spawnNum) || props.players[spawnNum - 1];
}

function getPieceSymbol(t) {
  return PIECE_SYMBOLS[t] || '';
}

// 8x8 Board pieces
const board8x8 = computed(() => {
  const b = Array.from({ length: 8 }, () => Array(8).fill(null));
  const p1Color = getSpawnPlayer(1)?.color || '#f43f5e';
  const p2Color = getSpawnPlayer(2)?.color || '#0ea5e9';

  for (let i = 0; i < 8; i++) {
    b[0][i] = { t: BACK_RANK_ORDER[i], color: p2Color };
    b[1][i] = { t: 'P', color: p2Color };
    b[6][i] = { t: 'P', color: p1Color };
    b[7][i] = { t: BACK_RANK_ORDER[i], color: p1Color };
  }
  return b;
});

function getPiece8x8(r, c) {
  return board8x8.value[r]?.[c] || null;
}

// 14x14 Board pieces
const board14x14 = computed(() => {
  const b = Array.from({ length: 14 }, () => Array(14).fill(null));

  for (let spawnIdx = 0; spawnIdx < 4; spawnIdx++) {
    const player = getSpawnPlayer(spawnIdx + 1);
    const pColor = player?.color || '#f43f5e';

    for (let i = 0; i < 8; i++) {
      const [r0, c0] = [
        [13, 3 + i],
        [3 + i, 0],
        [0, 10 - i],
        [10 - i, 13]
      ][spawnIdx];
      b[r0][c0] = { t: BACK_RANK_ORDER[i], color: pColor };

      const [r1, c1] = [
        [12, 3 + i],
        [3 + i, 1],
        [1, 10 - i],
        [10 - i, 12]
      ][spawnIdx];
      b[r1][c1] = { t: 'P', color: pColor };
    }
  }
  return b;
});

function getCellClass14(r, c) {
  if (!isValidCell(r, c, 14)) return 'mini-cell omitted';
  const isDark = (r + c) % 2 !== 0;
  return ['mini-cell', isDark ? 'dark' : 'light'];
}

function getPiece14(r, c) {
  if (!isValidCell(r, c, 14)) return null;
  return board14x14.value[r]?.[c] || null;
}
</script>

<style scoped>
.map-skirmish-card {
  padding: 16px;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-header {
  border-bottom: 2px solid var(--border-dark);
  padding-bottom: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

/* Board Preview */
.board-preview-container {
  position: relative;
  background: #0f172a;
  border: 2.5px solid var(--border-dark);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  user-select: none;
}

.mini-grid {
  display: grid;
  gap: 1px;
  background: #1e293b;
  border: 2px solid #020617;
  border-radius: 4px;
}

.grid-14x14 {
  --cell-size: 16px;
  grid-template-columns: repeat(14, var(--cell-size));
  grid-template-rows: repeat(14, var(--cell-size));
}

.grid-8x8 {
  --cell-size: 26px;
  grid-template-columns: repeat(8, var(--cell-size));
  grid-template-rows: repeat(8, var(--cell-size));
}

.mini-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-cell.omitted {
  visibility: hidden;
  background: transparent;
}

.mini-cell.light {
  background: #fef9c3;
}

.mini-cell.dark {
  background: #cbd5e1;
}

.mini-piece {
  font-size: 13px;
  line-height: 1;
}

.grid-8x8 .mini-piece {
  font-size: 18px;
}

/* Spawn Beacons */
.spawn-beacon {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 900;
  font-size: 12px;
  z-index: 10;
}

/* 8x8 Beacons */
.beacon-top-8 {
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
}

.beacon-bottom-8 {
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
}

/* 14x14 Beacons */
.beacon-north {
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
}

.beacon-south {
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
}

.beacon-west {
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.beacon-east {
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}

/* Map List */
.map-list-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-main);
}

.map-buttons-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.map-item-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  text-align: left;
  transition: all 0.12s ease;
}

.map-item-btn.active {
  background: var(--pastel-yellow);
  box-shadow: 2px 2px 0px var(--shadow-color);
  transform: translate(-1px, -1px);
}

.map-name {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
}
</style>
