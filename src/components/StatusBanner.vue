<template>
  <div class="status-container">
    <!-- Active Turn Neo Card -->
    <div
      class="turn-card neo-card"
      :style="{ backgroundColor: playerBg, borderColor: 'var(--border-dark)' }"
    >
      <div class="turn-main">
        <span class="player-dot" :style="{ backgroundColor: playerColor }"></span>
        <div class="turn-text">
          <span class="turn-label">Giliran:</span>
          <span class="player-title" :style="{ color: playerTextColor }">{{ playerName }}</span>
          <span class="player-tag">({{ slotLabel }})</span>
        </div>
      </div>

      <!-- Bot Thinking Status -->
      <div v-if="isBotThinking" class="bot-thinking">
        <span class="thinking-spinner"></span>
        <span>Bot sedang memikirkan langkah...</span>
      </div>
    </div>

    <!-- Check Warning Alert -->
    <div v-if="inCheckNames && inCheckNames.length > 0 && !gameOver" class="alert-banner alert-check">
      <span class="alert-icon">
        <UiIcon name="warning" size="18" />
      </span>
      <div class="alert-msg">
        <strong>SKAK:</strong> {{ inCheckNames.join(', ') }}
        <span v-if="isCurrentPlayerInCheck" class="alert-sub">— Segera amankan raja!</span>
      </div>
    </div>

    <!-- Event Message -->
    <div v-if="eventMessage" class="alert-banner alert-event">
      <span class="alert-icon">
        <UiIcon name="zap" size="18" />
      </span>
      <div class="alert-msg">{{ eventMessage }}</div>
    </div>

    <!-- Game Over Modal -->
    <div v-if="gameOver" class="gameover-overlay">
      <div class="gameover-modal neo-card">
        <div class="trophy-box">
          <UiIcon name="trophy" size="44" />
        </div>
        <h2 class="gameover-title">Pertandingan Selesai!</h2>
        <div class="winner-pill">{{ gameOver }}</div>

        <div class="gameover-actions">
          <button class="btn-primary" @click="$emit('restart-game')">
            <span>Main Lagi</span>
          </button>
          <button @click="$emit('open-menu')">
            <span>Ubah Formasi</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import confetti from 'canvas-confetti';
import UiIcon from './UiIcon.vue';
import { DIFFICULTY_LABELS } from '../models/ChessModel.js';

const props = defineProps({
  curPlayer: {
    type: Object,
    default: () => ({})
  },
  curSlot: {
    type: String,
    default: 'human'
  },
  inCheckNames: {
    type: Array,
    default: () => []
  },
  eventMessage: {
    type: String,
    default: ''
  },
  gameOver: {
    type: String,
    default: null
  },
  isBotThinking: {
    type: Boolean,
    default: false
  }
});

defineEmits(['restart-game', 'open-menu']);

const playerName = computed(() => props.curPlayer?.name || 'Pemain');
const playerBg = computed(() => props.curPlayer?.bgPastel || '#ffffff');
const playerColor = computed(() => props.curPlayer?.color || '#334155');
const playerTextColor = computed(() => props.curPlayer?.textPastel || 'inherit');
const slotLabel = computed(() => DIFFICULTY_LABELS[props.curSlot] || props.curSlot || 'Human');

const isCurrentPlayerInCheck = computed(() => {
  return (props.inCheckNames || []).includes(playerName.value);
});

watch(
  () => props.gameOver,
  (newVal) => {
    if (newVal && !newVal.toLowerCase().includes('seri')) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }
);
</script>

<style scoped>
.status-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.turn-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.turn-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--border-dark);
}

.turn-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.turn-label {
  color: var(--text-muted);
  font-weight: 600;
}

.player-title {
  font-weight: 800;
}

.player-tag {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dim);
}

.bot-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #6d28d9;
}

.thinking-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ddd6fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  font-size: 14px;
  font-weight: 600;
}

.alert-check {
  background: var(--pastel-rose);
  color: #9f1239;
}

.alert-sub {
  font-weight: 500;
  opacity: 0.9;
}

.alert-event {
  background: var(--pastel-purple);
  color: #5b21b6;
}

/* Game Over Modal */
.gameover-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.gameover-modal {
  max-width: 440px;
  width: 100%;
  padding: 32px 24px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  background: var(--card-bg);
}

.trophy-box {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  background: var(--pastel-yellow);
  border: var(--border-thick);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}

.gameover-title {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 10px;
}

.winner-pill {
  display: inline-block;
  background: var(--pastel-yellow);
  border: var(--border-thick);
  border-radius: var(--radius-pill);
  padding: 6px 16px;
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.gameover-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
