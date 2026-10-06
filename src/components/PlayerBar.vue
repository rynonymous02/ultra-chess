<template>
  <div class="player-bar">
    <div
      v-for="player in activePlayers"
      :key="player.id"
      :class="[
        'player-card neo-card',
        {
          'is-active': curPlayerId === player.id,
          'is-dead': !alive[player.id]
        }
      ]"
      :style="{ backgroundColor: player.bgPastel }"
    >
      <div class="card-top">
        <span class="player-dot" :style="{ backgroundColor: player.color }"></span>
        <span class="player-name" :style="{ color: player.textPastel }">{{ player.name }}</span>
        <span v-if="!alive[player.id]" class="dead-badge">Gugur</span>
      </div>

      <div class="card-details">
        <span class="team-sticker">{{ getTeamText(player.id) }}</span>
        <span class="type-sticker">{{ getSlotText(player.id) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PLAYERS, DIFFICULTY_LABELS } from '../models/ChessModel.js';

const props = defineProps({
  players: {
    type: Array,
    default: () => PLAYERS
  },
  curPlayerId: {
    type: Number,
    required: true
  },
  alive: {
    type: Array,
    required: true
  },
  mode: {
    type: String,
    required: true
  },
  slots: {
    type: Array,
    required: true
  },
  lone: {
    type: Number,
    default: 0
  },
  mapId: {
    type: String,
    default: 'plus-lane'
  }
});

const activePlayers = computed(() => {
  return props.mapId === 'default-lane' ? props.players.slice(0, 2) : props.players;
});

function getTeamText(id) {
  if (props.mode === 'team') {
    return id % 2 === 0 ? 'Tim A' : 'Tim B';
  } else if (props.mode === 'solo') {
    return id === props.lone ? 'Solo' : 'Koalisi';
  }
  return 'FFA';
}

function getSlotText(id) {
  return DIFFICULTY_LABELS[props.slots[id]] || props.slots[id];
}
</script>

<style scoped>
.player-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 14px 0;
}

.player-card {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}

.player-card.is-active {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px var(--shadow-color);
}

.player-card.is-dead {
  opacity: 0.45;
  filter: grayscale(0.8);
  box-shadow: none;
  transform: none;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.player-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid var(--border-dark);
  flex-shrink: 0;
}

.player-name {
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.dead-badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: 800;
  background: var(--pastel-rose);
  color: #9f1239;
  border: 1px solid var(--border-dark);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

.card-details {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.team-sticker,
.type-sticker {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.7);
  color: #1e293b;
  border: 1px solid var(--border-dark);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

@media (max-width: 640px) {
  .player-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
