<template>
  <div class="player-bar">
    <div
      v-for="(player, idx) in activePlayers"
      :key="player?.id ?? idx"
      :class="[
        'player-card neo-card',
        {
          'is-active': curPlayerId === idx || curPlayerId === player?.id,
          'is-dead': !isPlayerAlive(idx, player?.id)
        }
      ]"
      :style="{ backgroundColor: player?.bgPastel || '#ffffff' }"
    >
      <div class="card-top">
        <span class="player-dot" :style="{ backgroundColor: player?.color || '#334155' }"></span>
        <span class="player-name" :style="{ color: player?.textPastel || 'inherit' }">{{ player?.name || ('Pemain ' + (idx + 1)) }}</span>
        <span v-if="!isPlayerAlive(idx, player?.id)" class="dead-badge">Gugur</span>
      </div>

      <div class="card-details">
        <span class="team-sticker">{{ getTeamText(player?.id ?? idx) }}</span>
        <span class="type-sticker">{{ getSlotText(idx, player?.id) }}</span>
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
    default: 0
  },
  alive: {
    type: Array,
    default: () => [true, true, true, true, true]
  },
  mode: {
    type: String,
    default: 'team'
  },
  slots: {
    type: Array,
    default: () => ['human', 'easy', 'easy', 'easy', 'hard']
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
  if (!props.players || !Array.isArray(props.players)) return PLAYERS.slice(0, 4);
  return props.mapId === 'default-lane' ? props.players.slice(0, 2) : props.players;
});

function isPlayerAlive(idx, id) {
  if (!props.alive || !Array.isArray(props.alive)) return true;
  if (props.alive[idx] !== undefined) return props.alive[idx];
  if (id !== undefined && props.alive[id] !== undefined) return props.alive[id];
  return true;
}

function getTeamText(id) {
  if (props.mapId === 'double-last-line-defence') {
    if (props.mode === '4v1') {
      return id === 4 ? 'Solo Benteng' : 'Koalisi 4';
    }
    return 'FFA';
  }
  if (props.mode === 'team') {
    return id % 2 === 0 ? 'Tim A' : 'Tim B';
  } else if (props.mode === 'solo') {
    return id === props.lone ? 'Solo' : 'Koalisi';
  } else if (props.mode === 'duel') {
    return id === 0 ? 'Putih' : 'Hitam';
  }
  return 'FFA';
}

function getSlotText(idx, id) {
  if (!props.slots || !Array.isArray(props.slots)) return 'Human';
  const slotVal = props.slots[idx] || (id !== undefined ? props.slots[id] : null) || 'human';
  return DIFFICULTY_LABELS[slotVal] || slotVal;
}
</script>

<style scoped>
.player-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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
