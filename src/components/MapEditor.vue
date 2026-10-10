<template>
  <div class="map-editor-modal" @click.self="$emit('close')">
    <div class="editor-card neo-card">
      <div class="editor-header">
        <div class="header-left">
          <h2 class="editor-title">Map Editor</h2>
          <span class="editor-badge">Tileset & Piece Placer</span>
        </div>
        <button class="icon-btn" @click="$emit('close')">&times;</button>
      </div>

      <!-- Editor Controls Bar -->
      <div class="editor-toolbar">
        <div class="tool-group">
          <label class="tool-label">Nama:</label>
          <input v-model="mapName" class="name-input" placeholder="Nama Map Kustom" />
        </div>

        <div class="tool-group">
          <label class="tool-label">Ukuran:</label>
          <select v-model="boardType" @change="handleTypeChange" class="type-select">
            <option value="14-cross">14x14 Salib</option>
            <option value="8-normal">8x8 Standar</option>
            <option value="10-normal">10x10</option>
            <option value="12-normal">12x12</option>
            <option value="14-normal">14x14 Persegi</option>
            <option value="16-normal">16x16</option>
            <option value="custom">Kustom</option>
          </select>
        </div>

        <!-- Custom Size Inputs when 'custom' is selected -->
        <div v-if="boardType === 'custom'" class="tool-group custom-size-group">
          <input
            type="number"
            min="6"
            max="18"
            v-model.number="customSizeInput"
            @change="applyCustomSize"
            class="custom-size-input"
            title="Ukuran Kotak (6 - 18)"
          />
          <span class="unit-text">&times; {{ customSizeInput }}</span>
          <button type="button" class="btn-apply-size" @click="applyCustomSize">OK</button>
        </div>

        <!-- Mode Editor: Bidak vs Tileset -->
        <div class="tool-group mode-toggle-group">
          <label class="tool-label">Mode:</label>
          <div class="mode-chips">
            <button
              type="button"
              :class="['mode-tab', { active: editorMode === 'pieces' }]"
              @click="editorMode = 'pieces'"
            >
              ♟️ Bidak
            </button>
            <button
              type="button"
              :class="['mode-tab', { active: editorMode === 'tileset' }]"
              @click="editorMode = 'tileset'"
            >
              🎨 Tileset
            </button>
          </div>
        </div>
      </div>

      <!-- Secondary Sub-toolbar for Active Mode -->
      <div class="sub-toolbar">
        <!-- If Mode Bidak -->
        <template v-if="editorMode === 'pieces'">
          <div class="sub-tool-row">
            <div class="tool-group">
              <label class="tool-label">Pemain:</label>
              <div class="player-chips">
                <button
                  v-for="p in availablePlayers"
                  :key="p.id"
                  type="button"
                  :class="['p-chip', { active: selectedPlayer === p.id && currentTool === 'place' }]"
                  :style="{ backgroundColor: p.color }"
                  @click="selectedPlayer = p.id; currentTool = 'place'"
                >
                  P{{ p.id + 1 }}
                </button>
              </div>
            </div>

            <div class="tool-group">
              <label class="tool-label">Bidak:</label>
              <div class="piece-chips">
                <button
                  v-for="(sym, key) in pieces"
                  :key="key"
                  type="button"
                  :class="['tool-btn', 'piece-chip-btn', { active: selectedPiece === key && currentTool === 'place' }]"
                  @click="selectedPiece = key; currentTool = 'place'"
                  :title="key"
                >
                  <ChessPieceSvg
                    :type="key"
                    :color="getPlayerColor(selectedPlayer)"
                    size="24"
                  />
                </button>
                <button
                  type="button"
                  :class="['tool-btn', { active: currentTool === 'erase' }]"
                  @click="currentTool = 'erase'"
                >
                  🧹 Hapus
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- If Mode Tileset -->
        <template v-else>
          <div class="sub-tool-row tileset-tools">
            <label class="tool-label">Tipe Petak (Tileset):</label>
            <div class="tileset-chips">
              <button
                type="button"
                :class="['tile-chip', { active: selectedTileType === 'normal' }]"
                @click="selectedTileType = 'normal'"
              >
                <span class="tile-swatch tile-normal-swatch"></span>
                <span>Normal</span>
              </button>
              <button
                type="button"
                :class="['tile-chip', { active: selectedTileType === 'void' }]"
                @click="selectedTileType = 'void'"
              >
                <span class="tile-swatch tile-void-swatch"></span>
                <span>Void (Bolong)</span>
              </button>
              <button
                type="button"
                :class="['tile-chip', { active: selectedTileType === 'wall' }]"
                @click="selectedTileType = 'wall'"
              >
                <span class="tile-swatch tile-wall-swatch">🧱</span>
                <span>Tembok / Wall</span>
              </button>
            </div>
            <span class="hint-text">Klik petak pada papan untuk mengubah tipe petak.</span>
          </div>
        </template>
      </div>

      <!-- Interactive Canvas Board -->
      <div class="editor-board-wrapper">
        <div
          class="editor-grid"
          :style="{
            gridTemplateColumns: `repeat(${boardSize}, ${editorCellSize}px)`,
            gridTemplateRows: `repeat(${boardSize}, ${editorCellSize}px)`
          }"
        >
          <template v-for="r in boardSize" :key="'er_' + (r - 1)">
            <div
              v-for="c in boardSize"
              :key="'ec_' + (r - 1) + '_' + (c - 1)"
              :class="getCellClass(r - 1, c - 1)"
              :style="{ width: editorCellSize + 'px', height: editorCellSize + 'px' }"
              @click="handleCellClick(r - 1, c - 1)"
            >
              <div
                v-if="grid[r - 1]?.[c - 1]"
                class="editor-piece-wrap"
                :style="{
                  width: Math.round(editorCellSize * 0.85) + 'px',
                  height: Math.round(editorCellSize * 0.85) + 'px'
                }"
              >
                <ChessPieceSvg
                  :type="grid[r - 1][c - 1].t"
                  :color="getPlayerColor(grid[r - 1][c - 1].p)"
                  size="100%"
                />
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Status Toast / Feedback -->
      <div v-if="saveMessage" class="status-toast neo-card">
        <span>{{ saveMessage }}</span>
      </div>

      <!-- Action Footer -->
      <div class="editor-footer">
        <button class="btn-rose" @click="clearBoard">Kosongkan</button>
        <div class="footer-right">
          <button @click="$emit('close')">Batal</button>
          <button class="btn-primary" @click="handleSave">Simpan</button>
          <button class="btn-purple" @click="handleSaveAs">
            <span>💾 Save As (folder maps)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PLAYERS, PIECE_SYMBOLS, isValidCell } from '../models/ChessModel.js';
import { saveCustomMap } from '../maps/index.js';
import ChessPieceSvg from './ChessPieceSvg.vue';

const emit = defineEmits(['close', 'map-saved']);

const pieces = PIECE_SYMBOLS;
const availablePlayers = PLAYERS;

const mapName = ref('Map Kustom ' + Math.floor(Math.random() * 900 + 100));
const boardType = ref('14-cross');
const editorMode = ref('pieces'); // 'pieces' | 'tileset'
const selectedTileType = ref('normal'); // 'normal' | 'void' | 'wall'
const selectedPlayer = ref(0);
const selectedPiece = ref('P');
const currentTool = ref('place'); // 'place' | 'erase'
const saveMessage = ref('');

const customSizeInput = ref(12);

const boardSize = computed(() => {
  if (boardType.value === '8-normal') return 8;
  if (boardType.value === '10-normal') return 10;
  if (boardType.value === '12-normal') return 12;
  if (boardType.value === '14-cross' || boardType.value === '14-normal') return 14;
  if (boardType.value === '16-normal') return 16;
  if (boardType.value === 'custom') {
    return Math.max(6, Math.min(18, customSizeInput.value || 12));
  }
  return 14;
});

const editorCellSize = computed(() => {
  const size = boardSize.value;
  if (size >= 16) return 26;
  if (size >= 14) return 30;
  if (size >= 12) return 34;
  if (size >= 10) return 38;
  return 42;
});

function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function createInitialTiles(size, isCross) {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      if (isCross && !isValidCell(r, c, size)) {
        return 'void';
      }
      return 'normal';
    })
  );
}

const grid = ref(createEmptyGrid(14));
const tileGrid = ref(createInitialTiles(14, true));

function rebuildBoard() {
  const size = boardSize.value;
  const isCross = boardType.value === '14-cross';
  grid.value = createEmptyGrid(size);
  tileGrid.value = createInitialTiles(size, isCross);
}

function handleTypeChange() {
  if (boardType.value === 'custom') {
    customSizeInput.value = 12;
  }
  rebuildBoard();
}

function applyCustomSize() {
  const val = Math.max(6, Math.min(18, customSizeInput.value || 12));
  customSizeInput.value = val;
  rebuildBoard();
}

function getCellClass(r, c) {
  const tile = tileGrid.value[r]?.[c] || 'normal';
  if (tile === 'void') {
    return 'e-cell void';
  }
  if (tile === 'wall') {
    return 'e-cell cell-wall';
  }
  const isDark = (r + c) % 2 !== 0;
  return ['e-cell', isDark ? 'dark' : 'light'];
}

function getPlayerColor(pId) {
  return availablePlayers[pId]?.color || '#ffffff';
}

function handleCellClick(r, c) {
  if (editorMode.value === 'tileset') {
    tileGrid.value[r][c] = selectedTileType.value;
    if (selectedTileType.value === 'void' || selectedTileType.value === 'wall') {
      grid.value[r][c] = null;
    }
    return;
  }

  // Mode Bidak
  const tile = tileGrid.value[r]?.[c] || 'normal';
  if (tile === 'void' || tile === 'wall') return;

  if (currentTool.value === 'erase') {
    grid.value[r][c] = null;
  } else {
    grid.value[r][c] = {
      p: selectedPlayer.value,
      t: selectedPiece.value
    };
  }
}

function clearBoard() {
  grid.value = createEmptyGrid(boardSize.value);
}

function extractCustomPieces() {
  const customPieces = [];
  for (let r = 0; r < boardSize.value; r++) {
    for (let c = 0; c < boardSize.value; c++) {
      const cell = grid.value[r][c];
      if (cell) {
        customPieces.push({ r, c, p: cell.p, t: cell.t });
      }
    }
  }
  return customPieces;
}

function buildMapData(id) {
  const customPieces = extractCustomPieces();
  const placedPlayers = new Set(customPieces.map(p => p.p));
  const playersCount = placedPlayers.size > 0
    ? Math.min(5, Math.max(...placedPlayers) + 1)
    : (boardSize.value === 8 ? 2 : 4);

  return {
    id,
    name: mapName.value.trim() || 'Map Kustom',
    playersCount,
    boardSize: boardSize.value,
    isCross: boardType.value === '14-cross',
    desc: 'Map kustom buatan Map Editor.',
    activeSpawns: Array.from({ length: playersCount }, (_, i) => i + 1),
    customPieces,
    tiles: tileGrid.value
  };
}

function handleSave() {
  const mapId = 'custom-' + Date.now();
  const mapData = buildMapData(mapId);

  saveCustomMap(mapData);
  emit('map-saved', mapId);
  emit('close');
}

async function handleSaveAs() {
  const cleanSlug = mapName.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'custom-map';

  const camelName = cleanSlug.replace(/-([a-z0-9])/g, (_, g) => g.toUpperCase());
  const filename = `${cleanSlug}.js`;
  const mapData = buildMapData(cleanSlug);

  const fileContent = `// Map: ${mapData.name}
// Dibuat otomatis oleh Map Editor Ultra Catur
export const ${camelName}Map = {
  id: ${JSON.stringify(mapData.id)},
  name: ${JSON.stringify(mapData.name)},
  playersCount: ${mapData.playersCount},
  boardSize: ${mapData.boardSize},
  isCross: ${mapData.isCross},
  desc: ${JSON.stringify(mapData.desc)},
  activeSpawns: ${JSON.stringify(mapData.activeSpawns)},
  customPieces: ${JSON.stringify(mapData.customPieces, null, 2)},
  tiles: ${JSON.stringify(mapData.tiles)}
};
`;

  // 1. Simpan langsung ke folder src/maps via Vite dev server middleware
  try {
    await fetch('/api/save-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        content: fileContent,
        mapData
      })
    });
  } catch (e) {
    // Abaikan jika dev server tidak aktif
  }

  // 2. Download / Save-As file via browser
  try {
    const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    // fallback
  }

  // 3. Simpan ke local registry agar langsung bisa dimainkan seketika
  saveCustomMap(mapData);
  emit('map-saved', mapData.id);

  saveMessage.value = `Berhasil disimpan ke folder maps/${filename}!`;
  setTimeout(() => {
    saveMessage.value = '';
    emit('close');
  }, 1000);
}
</script>

<style scoped>
.map-editor-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 14px;
}

.editor-card {
  max-width: 820px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: var(--card-bg);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--border-dark);
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor-title {
  font-size: 20px;
  font-weight: 800;
}

.editor-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  background: var(--pastel-yellow);
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-pill);
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-bottom: 8px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
}

.name-input {
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  background: var(--card-bg);
  color: var(--text-main);
  outline: none;
  width: 160px;
}

.type-select {
  padding: 4px 8px;
  font-size: 12px;
}

.mode-chips {
  display: flex;
  gap: 4px;
}

.mode-tab {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 800;
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  border: var(--border-thick);
  cursor: pointer;
  transition: all 0.12s ease;
}

.mode-tab.active {
  background: var(--pastel-yellow);
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0px var(--shadow-color);
}

/* Sub-toolbar */
.sub-toolbar {
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  margin-bottom: 12px;
}

.sub-tool-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.player-chips, .piece-chips, .tileset-chips {
  display: flex;
  gap: 4px;
}

.p-chip {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  border: 1.5px solid var(--border-dark);
  border-radius: 4px;
  cursor: pointer;
}

.p-chip.active {
  box-shadow: 2px 2px 0px var(--shadow-color);
  transform: translate(-1px, -1px);
}

.tool-btn {
  padding: 3px 8px;
  font-size: 13px;
  font-weight: 800;
  border: 1.5px solid var(--border-dark);
  border-radius: 4px;
}

.piece-chip-btn {
  padding: 2px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn.active {
  background: var(--pastel-yellow);
  box-shadow: 2px 2px 0px var(--shadow-color);
}

/* Tileset chips */
.tile-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 800;
  border: 1.5px solid var(--border-dark);
  border-radius: 4px;
  background: var(--card-bg);
  cursor: pointer;
}

.tile-chip.active {
  background: var(--pastel-yellow);
  box-shadow: 2px 2px 0px var(--shadow-color);
  transform: translate(-1px, -1px);
}

.tile-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--border-dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}

.tile-normal-swatch {
  background: #fef9c3;
}

.tile-void-swatch {
  background: #0f172a;
}

.tile-wall-swatch {
  background: #475569;
}

.hint-text {
  font-size: 11px;
  color: var(--text-dim);
  font-weight: 600;
}

/* Board canvas */
.editor-board-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: #0f172a;
  border: var(--border-thick);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  overflow: auto;
}

.editor-grid {
  display: grid;
  gap: 1px;
  background: #1e293b;
  border: 2px solid #020617;
  border-radius: 4px;
}

.e-cell {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: filter 0.1s ease;
}

.e-cell.void {
  background: #090d16;
  opacity: 0.35;
  border: 1px dashed #334155;
}

.e-cell.light {
  background: #fef9c3;
}

.e-cell.dark {
  background: #cbd5e1;
}

.e-cell:hover {
  filter: brightness(1.2);
}

.piece-text,
.editor-piece-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-toast {
  padding: 8px 12px;
  background: var(--pastel-green);
  color: #14532d;
  font-weight: 800;
  font-size: 12px;
  margin-bottom: 10px;
  text-align: center;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid var(--border-dark);
  padding-top: 10px;
}

.footer-right {
  display: flex;
  gap: 8px;
}

/* Custom Size Inputs */
.custom-size-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.custom-size-input {
  width: 48px;
  padding: 3px 4px;
  font-size: 12px;
  font-weight: 700;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--text-main);
  text-align: center;
}

.unit-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

.btn-apply-size {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 800;
  border-radius: var(--radius-sm);
  background: var(--pastel-yellow);
  border: var(--border-thick);
}
</style>
