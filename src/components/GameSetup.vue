<template>
  <div class="setup-container neo-card">
    <div class="setup-header">
      <h2 class="setup-title">Pilih Formasi & Pemain</h2>
    </div>

    <!-- 1. Mode Permainan -->
    <div class="section-box">
      <label class="section-label">Mode Permainan</label>
      <div class="mode-grid">
        <button
          type="button"
          :class="['mode-card', { active: currentMode === 'team' }]"
          @click="selectMode('team')"
        >
          <span class="mode-name">Tim A vs Tim B</span>
          <span class="mode-desc">2 vs 2</span>
        </button>

        <button
          type="button"
          :class="['mode-card', { active: currentMode === 'ffa' }]"
          @click="selectMode('ffa')"
        >
          <span class="mode-name">Free For All</span>
          <span class="mode-desc">Semua Musuh</span>
        </button>

        <button
          type="button"
          :class="['mode-card', { active: currentMode === 'solo' }]"
          @click="selectMode('solo')"
        >
          <span class="mode-name">3 vs 1</span>
          <span class="mode-desc">Solo</span>
        </button>
      </div>
    </div>

    <!-- Solo Defender Selector -->
    <div v-if="currentMode === 'solo'" class="section-box lone-box">
      <label class="section-label" for="lone-select">Pemain Solo:</label>
      <select id="lone-select" v-model="currentLone" class="select-full">
        <option v-for="player in playerList" :key="player.id" :value="player.id">
          {{ player.name }}
        </option>
      </select>
    </div>

    <!-- 2. Konfigurasi 4 Pemain -->
    <div class="section-box">
      <label class="section-label">Konfigurasi Pemain</label>

      <div class="player-slot-list">
        <div
          v-for="player in playerList"
          :key="player.id"
          class="slot-item neo-card"
          :style="{ backgroundColor: player.bgPastel, borderColor: 'var(--border-dark)' }"
        >
          <!-- Nama & Tim -->
          <div class="col-name">
            <span class="player-pill" :style="{ backgroundColor: player.color }"></span>
            <div>
              <div class="player-title" :style="{ color: player.textPastel }">{{ player.name }}</div>
              <span class="team-sticker">{{ getTeamLabel(player.id) }}</span>
            </div>
          </div>

          <!-- Posisi / Lokasi (1, 2, 3, 4) -->
          <div class="col-spawn">
            <label class="cell-label" :for="'spawn-' + player.id">Lokasi</label>
            <select
              :id="'spawn-' + player.id"
              :value="player.spawn"
              @change="handleSpawnChange(player.id, Number($event.target.value))"
              class="spawn-select"
            >
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
              <option :value="4">4</option>
            </select>
          </div>

          <!-- Warna -->
          <div class="col-color">
            <label class="cell-label">Warna</label>
            <div class="color-picker-wrap">
              <button
                type="button"
                class="color-swatch-btn"
                :style="{ backgroundColor: player.color }"
                @click="toggleColorPicker(player.id)"
                aria-label="Pilih Warna"
              >
                <span class="swatch-arrow">▾</span>
              </button>

              <!-- Color Popover -->
              <div v-if="activeColorPickerId === player.id" class="color-popover neo-card">
                <div class="palette-grid">
                  <button
                    v-for="preset in colorPresets"
                    :key="preset.id"
                    type="button"
                    class="palette-chip"
                    :style="{ backgroundColor: preset.color }"
                    :title="preset.name"
                    @click="applyColor(player.id, preset)"
                  >
                    <span v-if="player.color === preset.color" class="check-icon">✓</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Kontrol / Role -->
          <div class="col-role">
            <label class="cell-label" :for="'role-' + player.id">Kontrol</label>
            <select :id="'role-' + player.id" v-model="slots[player.id]" class="role-select">
              <option value="human">👤 Human</option>
              <option value="easy">🤖 Bot Santai</option>
              <option value="med">🤖 Bot Taktis</option>
              <option value="hard">🤖 Bot Master</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <button class="btn-primary start-btn" @click="handleStart">
      <span>Mulai Pertandingan</span>
      <span>➔</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { COLOR_PRESETS } from '../models/ChessModel.js';

const props = defineProps({
  mode: {
    type: String,
    default: 'team'
  },
  lone: {
    type: Number,
    default: 0
  },
  initialSlots: {
    type: Array,
    default: () => ['human', 'easy', 'easy', 'easy']
  },
  players: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['start-game', 'update:players', 'update:mode', 'update:lone']);

const colorPresets = COLOR_PRESETS;
const currentMode = ref(props.mode);
const currentLone = ref(props.lone);
const slots = ref([...props.initialSlots]);
const playerList = ref(props.players.map(p => ({ ...p })));
const activeColorPickerId = ref(null);

watch(
  () => props.players,
  (newPlayers) => {
    playerList.value = newPlayers.map(p => ({ ...p }));
  },
  { deep: true }
);

function selectMode(m) {
  currentMode.value = m;
  emit('update:mode', m);
}

watch(currentLone, (newVal) => {
  emit('update:lone', newVal);
});

function getTeamLabel(playerId) {
  if (currentMode.value === 'team') {
    return playerId % 2 === 0 ? 'Tim A' : 'Tim B';
  } else if (currentMode.value === 'solo') {
    return playerId === currentLone.value ? 'Solo' : 'Koalisi';
  }
  return 'FFA';
}

function handleSpawnChange(playerId, newSpawn) {
  const currentOccupant = playerList.value.find(p => p.spawn === newSpawn && p.id !== playerId);
  const targetPlayer = playerList.value.find(p => p.id === playerId);

  if (targetPlayer) {
    const oldSpawn = targetPlayer.spawn;
    targetPlayer.spawn = newSpawn;

    if (currentOccupant) {
      currentOccupant.spawn = oldSpawn;
    }
  }

  emit('update:players', playerList.value);
}

function toggleColorPicker(playerId) {
  activeColorPickerId.value = activeColorPickerId.value === playerId ? null : playerId;
}

function applyColor(playerId, preset) {
  const target = playerList.value.find(p => p.id === playerId);
  if (target) {
    target.color = preset.color;
    target.bgPastel = preset.bgPastel;
    target.borderPastel = preset.borderPastel;
    target.textPastel = preset.textPastel;
  }
  activeColorPickerId.value = null;
  emit('update:players', playerList.value);
}

function handleStart() {
  emit('start-game', {
    mode: currentMode.value,
    lone: currentLone.value,
    slots: [...slots.value],
    players: playerList.value
  });
}

// Close popover when clicking outside
function handleClickOutside(e) {
  if (!e.target.closest('.color-picker-wrap')) {
    activeColorPickerId.value = null;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.setup-container {
  width: 100%;
  padding: 20px;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.setup-header {
  margin-bottom: 16px;
}

.setup-title {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.section-box {
  margin-bottom: 18px;
}

.section-label {
  display: block;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-main);
  margin-bottom: 8px;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  text-align: center;
  cursor: pointer;
  transition: all 0.12s ease;
}

.mode-card.active {
  background: var(--pastel-yellow);
  box-shadow: 3px 3px 0px var(--shadow-color);
  transform: translate(-1px, -1px);
}

.mode-name {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
}

.mode-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.lone-box {
  background: var(--pastel-yellow);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  box-shadow: var(--shadow-sm);
}

.select-full {
  width: 100%;
}

.player-slot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-item {
  display: grid;
  grid-template-columns: 1.2fr 64px 72px 1.4fr;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: var(--border-thick);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.col-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-pill {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--border-dark);
  flex-shrink: 0;
}

.player-title {
  font-weight: 800;
  font-size: 14px;
}

.team-sticker {
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.7);
  color: #1e293b;
  border: 1px solid var(--border-dark);
  padding: 1px 5px;
  border-radius: var(--radius-pill);
}

.col-spawn, .col-color, .col-role {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cell-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
}

.spawn-select {
  padding: 5px 6px;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  min-width: 54px;
}

.color-picker-wrap {
  position: relative;
}

.color-swatch-btn {
  width: 100%;
  height: 32px;
  padding: 0;
  border: 2px solid var(--border-dark);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  cursor: pointer;
}

.swatch-arrow {
  color: #ffffff;
  font-size: 11px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* Floating Color Palette - No text, proper z-index and spacing */
.color-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 100;
  background: var(--card-bg);
  padding: 8px;
  border-radius: var(--radius-sm);
  border: var(--border-thick);
  box-shadow: var(--shadow-md);
  width: 144px;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.palette-chip {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1.5px solid var(--border-dark);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 1px 0px var(--shadow-color);
  cursor: pointer;
}

.check-icon {
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.role-select {
  width: 100%;
  font-size: 13px;
  padding: 5px 8px;
}

.start-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 800;
  border-radius: var(--radius-md);
  margin-top: 8px;
}

@media (max-width: 640px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }
  .slot-item {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}
</style>
