<template>
  <div class="board-wrapper">
    <div :class="['board-container neo-card', { 'is-8x8': boardSize === 8 }]">
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

            <!-- Chess Piece -->
            <span
              v-if="getPiece(r - 1, c - 1)"
              class="chess-piece"
              :style="{ color: getPieceColor(r - 1, c - 1) }"
            >
              {{ getPieceSymbol(r - 1, c - 1) }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  isValidCell,
  PIECE_SYMBOLS,
  PLAYERS,
  toAlgebraic
} from '../models/ChessModel.js';

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
  }
});

const emit = defineEmits(['select-cell', 'make-move']);

const boardSize = computed(() => props.board.length || 14);

function isValid(r, c) {
  return isValidCell(r, c, boardSize.value);
}

function getPiece(r, c) {
  if (!isValid(r, c)) return null;
  return props.board[r]?.[c] || null;
}

function getPieceSymbol(r, c) {
  const p = getPiece(r, c);
  return p ? PIECE_SYMBOLS[p.t] : '';
}

function getPieceColor(r, c) {
  const p = getPiece(r, c);
  if (!p) return 'transparent';
  return props.players[p.p]?.color || PLAYERS[p.p]?.color || 'transparent';
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
  return props.legalMoves.some(m => m[2] === r && m[3] === c);
}

function isCaptureTarget(r, c) {
  const p = getPiece(r, c);
  return !!p && isMoveTarget(r, c);
}

function isKingInCheck(r, c) {
  const p = getPiece(r, c);
  if (!p || p.t !== 'K') return false;
  return !!props.inCheckPlayers[p.p];
}

function getCellClasses(r, c) {
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
  const playerName = props.players[piece.p]?.name || PLAYERS[piece.p]?.name || 'Pemain';
  return `Petak ${notation}: ${playerName} ${piece.t}`;
}

function handleCellClick(r, c) {
  if (!isValid(r, c)) return;

  const targetMove = props.legalMoves.find(m => m[2] === r && m[3] === c);
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
  padding: 6px;
  overflow-x: auto;
}

.board-container {
  --sq-size: min(5.9vw, 42px);
  display: inline-block;
  padding: 10px;
  background: var(--card-bg);
  border: var(--border-thick);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

/* 8x8 standard 1v1 board has larger comfortable squares */
.board-container.is-8x8 {
  --sq-size: min(10vw, 58px);
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
  font-size: calc(var(--sq-size) * 0.82);
  line-height: 1;
  filter: drop-shadow(0 2px 0px rgba(0, 0, 0, 0.35));
  transition: transform 0.15s ease;
  z-index: 1;
}

.cell-playable:hover .chess-piece {
  transform: scale(1.12);
}
</style>
