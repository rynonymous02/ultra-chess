<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card neo-card">
      <div class="modal-header">
        <div class="title-wrap">
          <span class="icon">📊</span>
          <h2 class="modal-title">Evaluasi Kekuatan & Material</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <p class="desc">
          Kalkulasi keseimbangan materi bidak dan status raja yang dihitung oleh Model:
        </p>

        <!-- Evaluation Cards -->
        <div class="eval-grid">
          <div
            v-for="(evalData, idx) in evaluations"
            :key="idx"
            class="eval-card neo-card"
            :style="{ backgroundColor: evalData.player.bgPastel }"
          >
            <div class="eval-card-header">
              <span class="dot" :style="{ backgroundColor: evalData.player.color }"></span>
              <span class="player-name" :style="{ color: evalData.player.textPastel }">{{ evalData.player.name }}</span>
              <span v-if="!evalData.alive" class="status-dead">Gugur</span>
              <span v-else-if="evalData.inCheck" class="status-check">SKAK!</span>
              <span v-else class="status-ok">Aman</span>
            </div>

            <div class="eval-score-row">
              <span class="score-label">Skor Materi:</span>
              <span class="score-val">{{ evalData.materialScore }} pts</span>
            </div>

            <!-- Piece counts -->
            <div class="piece-breakdown">
              <span title="Pion">♟ {{ evalData.pieces.P }}</span>
              <span title="Kuda">♞ {{ evalData.pieces.N }}</span>
              <span title="Gajah">♝ {{ evalData.pieces.B }}</span>
              <span title="Benteng">♜ {{ evalData.pieces.R }}</span>
              <span title="Ratu">♛ {{ evalData.pieces.Q }}</span>
              <span title="Raja">♚ {{ evalData.pieces.K }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-primary" @click="$emit('close')">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PLAYERS, isValidCell } from '../models/ChessModel.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  board: {
    type: Array,
    required: true
  },
  alive: {
    type: Array,
    required: true
  },
  inCheckPlayers: {
    type: Array,
    default: () => [false, false, false, false]
  }
});

defineEmits(['close']);

const evaluations = computed(() => {
  const material = [0, 0, 0, 0];
  const pieceCounts = [
    { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 },
    { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 },
    { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 },
    { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 }
  ];

  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 14; c++) {
      if (!isValidCell(r, c)) continue;
      const x = props.board[r]?.[c];
      if (x) {
        material[x.p] += x.t === 'P' ? 1 : x.t === 'N' || x.t === 'B' ? 3 : x.t === 'R' ? 5 : x.t === 'Q' ? 9 : 0;
        pieceCounts[x.p][x.t] = (pieceCounts[x.p][x.t] || 0) + 1;
      }
    }
  }

  return PLAYERS.map((pl, i) => ({
    player: pl,
    alive: props.alive[i],
    materialScore: material[i],
    pieces: pieceCounts[i],
    inCheck: !!props.inCheckPlayers[i]
  }));
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  max-width: 580px;
  width: 100%;
  padding: 24px;
  background: var(--card-bg);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  border-bottom: 2px solid var(--border-dark);
  padding-bottom: 10px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
}

.close-btn {
  font-size: 24px;
  font-weight: 800;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
}

.close-btn:hover {
  transform: scale(1.1);
  box-shadow: none;
}

.desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.eval-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.eval-card {
  border-radius: var(--radius-sm);
  padding: 12px;
  box-shadow: var(--shadow-sm);
}

.eval-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid var(--border-dark);
}

.player-name {
  font-size: 14px;
  font-weight: 800;
}

.status-dead {
  margin-left: auto;
  font-size: 10px;
  font-weight: 800;
  background: var(--pastel-rose);
  color: #9f1239;
  border: 1px solid var(--border-dark);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

.status-check {
  margin-left: auto;
  font-size: 10px;
  font-weight: 800;
  background: #f43f5e;
  color: #ffffff;
  border: 1px solid var(--border-dark);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

.status-ok {
  margin-left: auto;
  font-size: 10px;
  font-weight: 800;
  background: var(--pastel-green);
  color: #15803d;
  border: 1px solid var(--border-dark);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

.eval-score-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.score-val {
  font-family: var(--font-mono);
  font-size: 14px;
}

.piece-breakdown {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-main);
  border-top: 1.5px dashed var(--border-dark);
  padding-top: 6px;
}

.modal-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 2px solid var(--border-dark);
  padding-top: 12px;
}

@media (max-width: 640px) {
  .eval-grid {
    grid-template-columns: 1fr;
  }
}
</style>
