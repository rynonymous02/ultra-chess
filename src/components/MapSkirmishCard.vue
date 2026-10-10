<template>
  <div class="map-skirmish-card neo-card">
    <div class="card-header">
      <h3 class="card-title">Map Catur</h3>
      <div class="header-actions">
        <button
          type="button"
          class="import-trigger-btn"
          @click="triggerImport"
          title="Import file map (.js / .json)"
        >
          <span>Import Map</span>
        </button>
        <button
          type="button"
          class="editor-trigger-btn btn-primary"
          @click="$emit('open-editor')"
        >
          <span>+ Map Editor</span>
        </button>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept=".js,.json"
        multiple
        style="display: none"
        @change="handleFileImport"
      />
    </div>

    <!-- Mini Visual Chess Board Preview -->
    <div
      class="board-preview-container neo-card"
      :data-board-skin="skin"
      :style="{
        '--sq-light': currentSkinVars.light,
        '--sq-dark': currentSkinVars.dark
      }"
    >
      <!-- Dynamic Mini Visual Chess Board Preview -->
      <div
        class="mini-grid dynamic-grid"
        :style="{
          '--grid-size': previewBoardSize,
          '--cell-size': previewCellSize,
          '--piece-size': previewPieceSize
        }"
        role="img"
        aria-label="Preview Papan Catur"
      >
        <template v-for="r in previewBoardSize" :key="'pr_' + (r - 1)">
          <div
            v-for="c in previewBoardSize"
            :key="'pc_' + (r - 1) + '_' + (c - 1)"
            :class="getCellClass(r - 1, c - 1)"
          >
            <span
              v-if="getPiece(r - 1, c - 1)"
              class="mini-piece"
            >
              <ChessPieceSvg
                :type="getPiece(r - 1, c - 1).t"
                :color="getPiece(r - 1, c - 1).color"
                size="100%"
              />
            </span>
          </div>
        </template>
      </div>

      <!-- Spawn Beacons: 2 Pemain (Top & Bottom) -->
      <template v-if="previewPlayersCount === 2">
        <div
          class="spawn-beacon beacon-north"
          :style="{ backgroundColor: getSpawnPlayer(2)?.color || '#0ea5e9' }"
        >
          <span>2</span>
        </div>
        <div
          class="spawn-beacon beacon-south"
          :style="{ backgroundColor: getSpawnPlayer(1)?.color || '#f43f5e' }"
        >
          <span>1</span>
        </div>
      </template>

      <!-- Spawn Beacons: 4+ Pemain (North, West, East, South, dan Center opsional) -->
      <template v-else>
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

        <div
          v-if="previewPlayersCount >= 5"
          class="spawn-beacon beacon-center"
          :style="{ backgroundColor: getSpawnPlayer(5)?.color || '#334155' }"
          title="Player 5: Benteng Pusat"
        >
          <span>5</span>
        </div>
      </template>
    </div>

    <!-- Dropdown Skin Papan Catur -->
    <div class="skin-dropdown-section" ref="dropdownRef">
      <div class="section-label">Skin Papan</div>
      <div class="skin-dropdown-wrapper">
        <button
          type="button"
          class="skin-dropdown-trigger"
          @click="toggleSkinDropdown"
          :aria-expanded="isSkinDropdownOpen"
        >
          <div class="trigger-label">
            <span
              class="skin-preview-dot"
              :style="{ background: `linear-gradient(135deg, ${currentSkinObj.color1} 50%, ${currentSkinObj.color2} 50%)` }"
            ></span>
            <span>{{ currentSkinObj.name }}</span>
          </div>
          <span class="chevron-arrow" :class="{ open: isSkinDropdownOpen }">▾</span>
        </button>

        <div v-if="isSkinDropdownOpen" class="skin-dropdown-menu">
          <button
            v-for="s in skinOptions"
            :key="s.id"
            type="button"
            :class="['skin-menu-item', { active: skin === s.id }]"
            @click.stop="selectSkin(s.id)"
          >
            <span
              class="skin-preview-dot"
              :style="{ background: `linear-gradient(135deg, ${s.color1} 50%, ${s.color2} 50%)` }"
            ></span>
            <span>{{ s.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Map List Section -->
    <div class="map-list-section">
      <div class="section-label">Map List</div>

      <div class="map-buttons-list">
        <button
          v-for="preset in allMaps"
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  isValidCell,
  BACK_RANK_ORDER,
  PIECE_SYMBOLS,
  PLAYERS,
  BOARD_SKINS
} from '../models/ChessModel.js';
import { getAllMaps, getMapById, saveMultipleCustomMaps } from '../maps/index.js';
import ChessPieceSvg from './ChessPieceSvg.vue';

const props = defineProps({
  currentMap: {
    type: String,
    default: 'plus-lane'
  },
  players: {
    type: Array,
    required: true
  },
  skin: {
    type: String,
    default: 'merah-putih'
  }
});

const emit = defineEmits(['update:map', 'update:skin', 'open-editor']);

const skinOptions = computed(() => {
  return Object.entries(BOARD_SKINS).map(([id, val]) => ({ id, ...val }));
});

const currentSkinVars = computed(() => {
  return (BOARD_SKINS && BOARD_SKINS[props.skin]) || BOARD_SKINS['merah-putih'];
});

const currentSkinObj = computed(() => {
  return skinOptions.value.find(s => s.id === props.skin) || skinOptions.value[0];
});

const isSkinDropdownOpen = ref(false);
const dropdownRef = ref(null);
const fileInputRef = ref(null);
const mapsVersion = ref(0);

const allMaps = computed(() => {
  // Dependency reaktif agar list map langsung diperbarui saat import/save
  mapsVersion.value;
  return getAllMaps();
});

function toggleSkinDropdown() {
  isSkinDropdownOpen.value = !isSkinDropdownOpen.value;
}

function selectSkin(id) {
  emit('update:skin', id);
  isSkinDropdownOpen.value = false;
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isSkinDropdownOpen.value = false;
  }
}

function triggerImport() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

async function handleFileImport(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const importedMaps = [];
  for (const file of files) {
    try {
      const text = await file.text();
      const mapObj = parseMapFile(text, file.name);
      if (mapObj) {
        importedMaps.push(mapObj);
      }
    } catch (err) {
      console.error('Gagal membaca file map:', file.name, err);
    }
  }

  if (importedMaps.length > 0) {
    saveMultipleCustomMaps(importedMaps);
    mapsVersion.value++;
    // Pilih map terakhir yang berhasil di-import
    const lastMap = importedMaps[importedMaps.length - 1];
    emit('update:map', lastMap.id);
  }

  event.target.value = '';
}

function parseMapFile(text, filename) {
  // 1. Coba JSON murni
  try {
    const data = JSON.parse(text);
    if (data && typeof data === 'object') {
      return normalizeMapData(data, filename);
    }
  } catch (e) {}

  // 2. Coba JS export object
  try {
    const match = text.match(/export\s+const\s+\w+\s*=\s*(\{[\s\S]*\});?\s*$/m) || text.match(/(\{[\s\S]*\})/);
    if (match) {
      const parsed = new Function(`return (${match[1]});`)();
      if (parsed && typeof parsed === 'object') {
        return normalizeMapData(parsed, filename);
      }
    }
  } catch (e) {}

  return null;
}

function normalizeMapData(data, filename) {
  const fallbackId = (filename || 'custom-map').replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = data.id || fallbackId || ('custom-' + Date.now());
  const name = data.name || (filename ? filename.replace(/\.[^/.]+$/, '') : 'Map Kustom');
  const boardSize = Number(data.boardSize) || 14;
  const playersCount = Number(data.playersCount) || (boardSize === 8 ? 2 : 4);

  return {
    id,
    name,
    playersCount,
    boardSize,
    isCross: data.isCross !== undefined ? !!data.isCross : boardSize === 14,
    desc: data.desc || 'Map kustom hasil import.',
    activeSpawns: Array.isArray(data.activeSpawns) ? data.activeSpawns : Array.from({ length: playersCount }, (_, i) => i + 1),
    customPieces: Array.isArray(data.customPieces) ? data.customPieces : [],
    tiles: Array.isArray(data.tiles) ? data.tiles : null,
    ...(data.hasDualKing ? { hasDualKing: true } : {})
  };
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function selectMap(id) {
  emit('update:map', id);
}

function getSpawnPlayer(spawnNum) {
  return props.players.find(p => p.spawn === spawnNum) || props.players[spawnNum - 1] || PLAYERS[spawnNum - 1];
}

function getPieceSymbol(t) {
  return PIECE_SYMBOLS[t] || '';
}

const currentMapObj = computed(() => getMapById(props.currentMap));
const previewBoardSize = computed(() => currentMapObj.value?.boardSize || 14);
const previewPlayersCount = computed(() => {
  return currentMapObj.value?.playersCount || (props.currentMap === 'double-last-line-defence' ? 5 : props.currentMap === 'default-lane' ? 2 : 4);
});

const previewCellSize = computed(() => {
  const size = previewBoardSize.value;
  if (size <= 8) return '26px';
  if (size <= 10) return '22px';
  if (size <= 12) return '18px';
  if (size <= 14) return '16px';
  if (size <= 16) return '14px';
  return '12px';
});

const previewPieceSize = computed(() => {
  const size = previewBoardSize.value;
  if (size <= 8) return '18px';
  if (size <= 10) return '16px';
  if (size <= 12) return '14px';
  if (size <= 14) return '13px';
  if (size <= 16) return '11px';
  return '9px';
});

// Dynamic Board Preview
const previewBoard = computed(() => {
  const size = previewBoardSize.value;
  const b = Array.from({ length: size }, () => Array(size).fill(null));
  const map = currentMapObj.value;
  if (!map) return b;

  if (map.initPieces) {
    try {
      map.initPieces(b, null, BACK_RANK_ORDER);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (b[r] && b[r][c]) {
            const pl = getSpawnPlayer(b[r][c].p + 1);
            b[r][c].color = pl?.color || '#ffffff';
          }
        }
      }
    } catch (e) {
      console.warn('Gagal memuat initPieces:', e);
    }
  } else if (map.customPieces && Array.isArray(map.customPieces)) {
    for (const item of map.customPieces) {
      if (item && item.r >= 0 && item.r < size && item.c >= 0 && item.c < size && b[item.r]) {
        const pl = getSpawnPlayer(item.p + 1);
        b[item.r][item.c] = { t: item.t, color: pl?.color || '#ffffff' };
      }
    }
  }
  return b;
});

function getCellClass(r, c) {
  const map = currentMapObj.value;
  const size = previewBoardSize.value;
  if (map?.tiles && Array.isArray(map.tiles)) {
    const tile = map.tiles[r]?.[c];
    if (tile === 'void' || tile === 'omitted') return 'mini-cell omitted';
    if (tile === 'wall' || tile === 'obstacle') return 'mini-cell wall';
  } else if (map?.isCross) {
    if (!isValidCell(r, c, size)) return 'mini-cell omitted';
  }
  const isDark = (r + c) % 2 !== 0;
  return ['mini-cell', isDark ? 'dark' : 'light'];
}

function getPiece(r, c) {
  const map = currentMapObj.value;
  const size = previewBoardSize.value;
  if (map?.tiles && Array.isArray(map.tiles)) {
    const tile = map.tiles[r]?.[c];
    if (tile === 'void' || tile === 'omitted' || tile === 'wall' || tile === 'obstacle') return null;
  } else if (map?.isCross) {
    if (!isValidCell(r, c, size)) return null;
  }
  return previewBoard.value[r]?.[c] || null;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--border-dark);
  padding-bottom: 8px;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.import-trigger-btn {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: var(--radius-sm);
  background: var(--card-alt);
  color: var(--text-main);
  border: var(--border-thick);
  transition: all 0.12s ease;
}

.import-trigger-btn:hover {
  background: var(--pastel-yellow);
}

.editor-trigger-btn {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: var(--radius-sm);
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

.dynamic-grid {
  grid-template-columns: repeat(var(--grid-size, 14), var(--cell-size, 16px));
  grid-template-rows: repeat(var(--grid-size, 14), var(--cell-size, 16px));
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
  background: var(--sq-light);
}

.mini-cell.dark {
  background: var(--sq-dark);
}

.mini-cell.wall {
  background: #475569;
  position: relative;
}

.mini-cell.wall::after {
  content: '🧱';
  font-size: 8px;
  line-height: 1;
}

.mini-piece {
  width: var(--piece-size, 13px);
  height: var(--piece-size, 13px);
  display: flex;
  align-items: center;
  justify-content: center;
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

.beacon-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 26px;
  height: 26px;
  font-size: 13px;
  border-width: 2.5px;
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

/* Skin Dropdown Controls (Styled like Screenshot) */
.skin-dropdown-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skin-dropdown-wrapper {
  position: relative;
  width: 100%;
}

.skin-dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--card-bg);
  border: var(--border-thick);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.skin-dropdown-trigger:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--shadow-color);
}

.trigger-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}

.chevron-arrow {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.chevron-arrow.open {
  transform: rotate(180deg);
}

.skin-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: var(--border-thick);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
}

.skin-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-main);
  cursor: pointer;
  box-shadow: none;
  justify-content: flex-start;
  transition: all 0.1s ease;
}

.skin-menu-item:hover:not(.active) {
  background: var(--card-alt);
  transform: none;
  box-shadow: none;
}

/* Selected item styling: Vibrant Blue background & crisp white text (as in screenshot) */
.skin-menu-item.active {
  background: #1971c2 !important;
  color: #ffffff !important;
  font-weight: 800;
  transform: none;
  box-shadow: none;
}

.skin-preview-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--border-dark);
  flex-shrink: 0;
}
</style>
