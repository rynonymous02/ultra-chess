<template>
  <div class="board-wrapper">
    <div
      :class="['board-container neo-card', { 'is-8x8': boardSize === 8 }]"
      :data-board-skin="boardSkin"
      :style="{
        '--sq-size': dynamicSquareSize,
        '--sq-light': currentSkinVars.light,
        '--sq-dark': currentSkinVars.dark,
        '--sq-sel': currentSkinVars.sel,
        '--sq-last': currentSkinVars.last,
        '--sq-check': currentSkinVars.check,
        transform: `rotate(${rotationAngle}deg)`
      }"
    >
      <div
        class="chess-grid"
        :style="{
          gridTemplateColumns: `repeat(${boardSize}, var(--sq-size))`,
          gridTemplateRows: `repeat(${boardSize}, var(--sq-size))`
        }"
        role="grid"
      >
        <template v-for="r in boardSize" :key="'r' + (r - 1)">
          <div
            v-for="c in boardSize"
            :key="'c' + (r - 1) + '_' + (c - 1)"
            :class="getCellClasses(r - 1, c - 1)"
            :tabindex="isValid(r - 1, c - 1) ? 0 : -1"
            :aria-label="getCellAriaLabel(r - 1, c - 1)"
            @click="handleCellClick(r - 1, c - 1)"
            @keydown.enter.prevent="handleCellClick(r - 1, c - 1)"
            @keydown.space.prevent="handleCellClick(r - 1, c - 1)"
          >
            <!-- Valid Move / Capture Overlay -->
            <span
              v-if="isMoveTarget(r - 1, c - 1)"
              :class="['move-marker', { 'capture-ring': isCaptureTarget(r - 1, c - 1) }]"
            ></span>

            <!-- Chess Piece SVG -->
            <div
              v-if="getPiece(r - 1, c - 1)"
              class="chess-piece"
            >
              <ChessPieceSvg
                :type="getPiece(r - 1, c - 1).t"
                :color="getPieceColor(r - 1, c - 1)"
                size="100%"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ChessPieceSvg from './ChessPieceSvg.vue';
import {
  isValidCell,
  PIECE_SYMBOLS,
  PLAYERS,
  BOARD_SKINS,
  toAlgebraic
} from '../models/ChessModel.js';
import { getMapById } from '../maps/index.js';

const props = defineProps({
  board: {
    type: Array,
    required: true
  },
  players: {
    type: Array,
    default: () => PLAYERS
  },
  selectedCell: {
    type: Array,
    default: null
  },
  lastMove: {
    type: Array,
    default: null
  },
  legalMoves: {
    type: Array,
    default: () => []
  },
  inCheckPlayers: {
    type: Array,
    default: () => [false, false, false, false]
  },
  isHumanTurn: {
    type: Boolean,
    default: true
  },
  mapId: {
    type: String,
    default: 'plus-lane'
  },
  boardSkin: {
    type: String,
    default: 'merah-putih'
  },
  rotationAngle: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['select-cell', 'make-move']);

const currentSkinVars = computed(() => {
  return (BOARD_SKINS && BOARD_SKINS[props.boardSkin]) || BOARD_SKINS['merah-putih'];
});

const boardSize = computed(() => (props.board && props.board.length) ? props.board.length : 14);
const currentMapData = computed(() => getMapById(props.mapId));

const dynamicSquareSize = computed(() => {
  const N = boardSize.value;
  if (N <= 8) return 'clamp(44px, min(8.5vh, 7vw), 72px)';
  if (N <= 10) return 'clamp(36px, min(7vh, 5.8vw), 58px)';
  if (N <= 12) return 'clamp(30px, min(6vh, 4.8vw), 48px)';
  if (N <= 14) return 'clamp(26px, min(5.2vh, 4.2vw), 44px)';
  return 'clamp(22px, min(4.2vh, 3.4vw), 36px)';
});

function isValid(r, c) {
  if (r < 0 || c < 0 || r >= boardSize.value || c >= boardSize.value) return false;
  if (currentMapData.value?.tiles && Array.isArray(currentMapData.value.tiles)) {
    const tile = currentMapData.value.tiles[r]?.[c];
    if (tile === 'void' || tile === 'omitted') return false;
    if (tile === 'wall' || tile === 'obstacle') return false;
    if (tile === 'normal') return true;
  }
  return isValidCell(r, c, boardSize.value);
}

function isWall(r, c) {
  if (!currentMapData.value?.tiles || !Array.isArray(currentMapData.value.tiles)) return false;
  return currentMapData.value.tiles[r]?.[c] === 'wall' || currentMapData.value.tiles[r]?.[c] === 'obstacle';
}

function getPiece(r, c) {
  if (!isValid(r, c)) return null;
  return props.board?.[r]?.[c] || null;
}

function getPieceSymbol(r, c) {
  const p = getPiece(r, c);
  return p ? PIECE_SYMBOLS[p.t] : '';
}

function getPieceColor(r, c) {
  const p = getPiece(r, c);
  if (!p) return 'transparent';
  return props.players?.[p.p]?.color || PLAYERS[p.p]?.color || 'transparent';
}

function isSelected(r, c) {
  return props.selectedCell && props.selectedCell[0] === r && props.selectedCell[1] === c;
}

function isLastMove(r, c) {
  if (!props.lastMove) return false;
  const [r1, c1, r2, c2] = props.lastMove;
  return (r1 === r && c1 === c) || (r2 === r && c2 === c);
}

function isMoveTarget(r, c) {
  if (!Array.isArray(props.legalMoves)) return false;
  return props.legalMoves.some(m => m[2] === r && m[3] === c);
}

function isCaptureTarget(r, c) {
  const p = getPiece(r, c);
  return !!p && isMoveTarget(r, c);
}

function isKingInCheck(r, c) {
  const p = getPiece(r, c);
  if (!p || p.t !== 'K') return false;
  return !!(props.inCheckPlayers || [])[p.p];
}

function getCellClasses(r, c) {
  if (isWall(r, c)) {
    return 'cell cell-wall';
  }
  if (!isValid(r, c)) {
    return 'cell cell-omitted';
  }

  const isDark = (r + c) % 2 !== 0;
  return [
    'cell',
    'cell-playable',
    isDark ? 'cell-dark' : 'cell-light',
    {
      'is-selected': isSelected(r, c),
      'is-last-move': isLastMove(r, c),
      'is-in-check': isKingInCheck(r, c)
    }
  ];
}

function getCellAriaLabel(r, c) {
  if (!isValid(r, c)) return 'Kosong';
  const piece = getPiece(r, c);
  const notation = toAlgebraic(r, c, boardSize.value);
  if (!piece) return `Petak ${notation}`;
  const playerName = props.players?.[piece.p]?.name || PLAYERS[piece.p]?.name || 'Pemain';
  return `Petak ${notation}: ${playerName} ${piece.t}`;
}

function handleCellClick(r, c) {
  if (!isValid(r, c)) return;

  const targetMove = (props.legalMoves || []).find(m => m[2] === r && m[3] === c);
  if (props.selectedCell && targetMove) {
    emit('make-move', targetMove);
    return;
  }

  emit('select-cell', [r, c]);
}
</script>

<style scoped>
.board-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  width: 100%;
}

.board-container {
  display: inline-block;
  padding: 10px;
  background: var(--card-bg);
  border: var(--border-thick);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.chess-grid {
  display: grid;
  border: 3px solid var(--border-dark);
  border-radius: var(--radius-sm);
  background-color: var(--border-dark);
  gap: 1px;
}

.cell {
  position: relative;
  width: var(--sq-size);
  height: var(--sq-size);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.cell-omitted {
  visibility: hidden;
  pointer-events: none;
  background: transparent;
}

.cell-playable {
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.cell-light {
  background-color: var(--sq-light);
}

.cell-dark {
  background-color: var(--sq-dark);
}

.cell-playable:hover {
  filter: brightness(1.08);
}

.cell-playable:focus-visible {
  outline: 3px solid #1e293b;
  outline-offset: -2px;
  z-index: 5;
}

.cell.is-selected {
  background-color: var(--sq-sel) !important;
  box-shadow: inset 0 0 0 3px #1e293b;
  z-index: 2;
}

.cell.is-last-move {
  background-color: var(--sq-last) !important;
  box-shadow: inset 0 0 0 2px var(--border-dark);
}

.cell.is-in-check {
  background-color: var(--sq-check) !important;
  box-shadow: inset 0 0 0 3px #ef4444;
  animation: pulse-subtle 1.2s infinite ease-in-out;
  z-index: 3;
}

.move-marker {
  position: absolute;
  width: 32%;
  height: 32%;
  border-radius: 50%;
  background-color: var(--pastel-purple-deep);
  border: 2px solid #ffffff;
  pointer-events: none;
  z-index: 4;
}

.move-marker.capture-ring {
  width: 80%;
  height: 80%;
  background-color: transparent;
  border: 3.5px dashed #ef4444;
  border-radius: 50%;
}

.chess-piece {
  width: 84%;
  height: 84%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
  z-index: 2;
  pointer-events: none;
}

.cell-playable:hover .chess-piece {
  transform: scale(1.15) translateY(-3px);
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.45));
}
</style>
