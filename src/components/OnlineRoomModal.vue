<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card neo-card">
      <div class="modal-header">
        <div class="header-title-box">
          <span class="badge-status" :class="{ online: isConnected }">
            {{ isConnected ? '🟢 Di Dalam Room' : '🌐 Lobby Online' }}
          </span>
          <h2 class="title">{{ isConnected ? currentRoom : 'Multiplayer Online' }}</h2>
        </div>
        <button class="close-btn" @click="$emit('close')" aria-label="Tutup">✕</button>
      </div>

      <!-- 1. TAMPILAN LOBBY (PILIH ATAU BUAT ROOM) -->
      <div v-if="!isConnected" class="lobby-view">
        <!-- Profil Pemain -->
        <div class="profile-row">
          <label for="player-name">Nama Pemain</label>
          <input
            id="player-name"
            v-model="playerName"
            type="text"
            placeholder="Masukkan Nama Anda"
            class="neo-input"
            @change="savePlayerName"
          />
        </div>

        <!-- Tombol Aksi Buat Room -->
        <div class="create-bar">
          <button class="btn-create" @click="createQuickRoom">
            + Buat Room Baru
          </button>
        </div>

        <!-- Daftar Room yang Sedang Ada Pemainnya (Live Discovery) -->
        <div class="active-rooms-section">
          <div class="section-title-row">
            <span class="section-title">Room yang Tersedia ({{ activeRooms.length }})</span>
            <span class="live-tag">● Realtime</span>
          </div>

          <div v-if="activeRooms.length === 0" class="empty-rooms neo-card">
            <p>Belum ada room aktif.</p>
            <span class="sub-text">Klik tombol "Buat Room Baru" di atas untuk memulai.</span>
          </div>

          <div v-else class="room-list">
            <div
              v-for="rm in activeRooms"
              :key="rm.id"
              class="room-item neo-card"
            >
              <div class="room-meta">
                <span class="room-name">{{ rm.name }}</span>
                <div class="room-chips">
                  <span class="badge-count">{{ rm.players.length }}/4 Pemain</span>
                  <span v-if="rm.inGame" class="badge-ingame">Sedang Main</span>
                  <span v-else class="badge-waiting">Menunggu</span>
                </div>
              </div>

              <button
                class="btn-join"
                :disabled="rm.players.length >= 4"
                @click="joinSpecificRoom(rm.id)"
              >
                {{ rm.players.length >= 4 ? 'Penuh' : 'Gabung' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Gabung via Kode Manual -->
        <details class="manual-room-details">
          <summary>Gabung via Kode Room Manual</summary>
          <div class="manual-join-row mt-2">
            <input
              v-model="manualRoomId"
              type="text"
              placeholder="Contoh: catur-123"
              class="neo-input input-sm flex-1"
            />
            <button
              class="btn-sm-action"
              :disabled="!manualRoomId.trim()"
              @click="joinSpecificRoom(manualRoomId.trim())"
            >
              Masuk
            </button>
          </div>
        </details>

        <!-- Konfigurasi Kunci Supabase (Hanya tampil jika belum ada di env) -->
        <details v-if="!isEnvConfigured" class="manual-room-details mt-2">
          <summary>Kunci Supabase API</summary>
          <div class="mt-2 flex-col gap-2">
            <input
              v-model="supabaseUrl"
              type="text"
              placeholder="Supabase Project URL"
              class="neo-input input-sm"
              @change="saveSupabaseConfig"
            />
            <input
              v-model="supabaseKey"
              type="password"
              placeholder="Anon / Publishable API Key"
              class="neo-input input-sm"
              @change="saveSupabaseConfig"
            />
          </div>
        </details>

        <div v-if="errorMessage" class="error-msg mt-2">
          {{ errorMessage }}
        </div>
      </div>

      <!-- 2. TAMPILAN DI DALAM ROOM (PILIH SLOT & MULAI) -->
      <div v-else class="room-view">
        <div class="room-info-bar">
          <div>
            <span class="label">Kode Room:</span>
            <strong>{{ currentRoom }}</strong>
          </div>
          <button class="btn-copy" @click="copyRoomCode">
            {{ copied ? 'Disalin! ✓' : 'Salin Kode' }}
          </button>
        </div>

        <!-- Pilih Slot Pemain -->
        <div class="slot-section">
          <label class="section-title">Pilih Slot Anda:</label>
          <div class="slot-grid">
            <div
              v-for="(p, idx) in availablePlayers"
              :key="idx"
              class="slot-card"
              :style="{ borderColor: p.color, backgroundColor: p.bgPastel }"
            >
              <div class="slot-head">
                <span class="slot-dot" :style="{ backgroundColor: p.color }"></span>
                <span class="slot-name" :style="{ color: p.textPastel }">{{ p.name }} (P{{ idx + 1 }})</span>
              </div>

              <div class="slot-occupant">
                <span v-if="getOccupant(idx)" class="occupant-name">
                  👤 {{ getOccupant(idx).name }}
                  <span v-if="getOccupant(idx).id === myClientId" class="tag-you">(Anda)</span>
                </span>
                <span v-else class="empty-tag">Kosong</span>
              </div>

              <button
                v-if="mySlot !== idx && !getOccupant(idx)"
                class="btn-claim"
                @click="claimSlot(idx)"
              >
                Pilih Slot
              </button>
              <span v-else-if="mySlot === idx" class="claimed-badge">Dipilih Anda</span>
            </div>
          </div>
        </div>

        <!-- Tombol Aksi Mulai & Keluar -->
        <div class="action-footer">
          <button class="btn-leave" @click="leaveRoom">Keluar Room</button>
          <button
            class="btn-start"
            :disabled="!canStartGame"
            @click="startGame"
          >
            Mulai Pertandingan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { realtimeService } from '../services/realtimeService.js';
import { PLAYERS } from '../models/ChessModel.js';

const props = defineProps({
  currentMap: {
    type: String,
    default: 'plus-lane'
  },
  players: {
    type: Array,
    default: () => PLAYERS
  },
  mode: {
    type: String,
    default: 'team'
  }
});

const emit = defineEmits(['close', 'start-online-game']);

const playerName = ref(localStorage.getItem('ultra_catur_online_name') || 'Pemain ' + Math.floor(100 + Math.random() * 900));
const manualRoomId = ref('');
const errorMessage = ref('');

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseUrl = ref(localStorage.getItem('ultra_catur_sb_url') || envUrl || 'https://wdrwegzabkhzxfpwvqmz.supabase.co');
const supabaseKey = ref(localStorage.getItem('ultra_catur_sb_key') || envKey);

const isEnvConfigured = computed(() => {
  return !!(envUrl && envKey);
});

const isConnected = ref(realtimeService.connected);
const isConnecting = ref(false);
const currentRoom = ref(realtimeService.room || '');
const mySlot = ref(realtimeService.mySlotIndex);
const peers = ref(realtimeService.peers);
const activeRooms = ref(realtimeService.activeRooms || []);
const copied = ref(false);

const availablePlayers = computed(() => {
  return props.players.slice(0, 4);
});

const myClientId = computed(() => {
  return realtimeService.clientId;
});

function getOccupant(slotIdx) {
  return peers.value.find(p => p.slotIndex === slotIdx);
}

const canStartGame = computed(() => {
  const filledSlots = peers.value.filter(p => p.slotIndex !== null && p.slotIndex !== undefined);
  return filledSlots.length >= 2;
});

function savePlayerName() {
  localStorage.setItem('ultra_catur_online_name', playerName.value.trim());
}

function saveSupabaseConfig() {
  localStorage.setItem('ultra_catur_sb_url', supabaseUrl.value.trim());
  localStorage.setItem('ultra_catur_sb_key', supabaseKey.value.trim());
}

function createQuickRoom() {
  const generatedId = 'room-' + Math.floor(1000 + Math.random() * 9000);
  joinSpecificRoom(generatedId);
}

function joinSpecificRoom(roomId) {
  if (!roomId) return;
  errorMessage.value = '';
  isConnecting.value = true;
  savePlayerName();

  realtimeService.connect({
    room: roomId,
    userName: playerName.value.trim(),
    url: supabaseUrl.value.trim(),
    anonKey: supabaseKey.value.trim()
  });
}

function claimSlot(slotIdx) {
  realtimeService.claimSlot(slotIdx);
  mySlot.value = slotIdx;
}

function startGame() {
  const config = {
    mode: props.mode,
    mapId: props.currentMap,
    players: props.players,
    slots: Array.from({ length: 4 }, (_, idx) => {
      const occupant = getOccupant(idx);
      return occupant ? 'human' : 'easy';
    })
  };
  realtimeService.startGame(config);
  emit('start-online-game', config);
  emit('close');
}

function leaveRoom() {
  realtimeService.disconnect();
  isConnected.value = false;
  currentRoom.value = '';
}

function copyRoomCode() {
  navigator.clipboard.writeText(currentRoom.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function onSync(data) {
  peers.value = data.peers || [];
  const self = peers.value.find(p => p.id === realtimeService.clientId);
  if (self) {
    mySlot.value = self.slotIndex;
  }
}

function onStatusChange(data) {
  isConnecting.value = false;
  isConnected.value = data.connected;
  if (data.error) {
    errorMessage.value = data.error;
  }
  if (data.connected) {
    errorMessage.value = '';
    currentRoom.value = data.room;
    // Otomatis pilih slot pertama yang kosong jika belum memilih
    setTimeout(() => {
      if (mySlot.value === null) {
        for (let i = 0; i < availablePlayers.value.length; i++) {
          if (!getOccupant(i)) {
            claimSlot(i);
            break;
          }
        }
      }
    }, 200);
  }
}

function onGameStarted(config) {
  emit('start-online-game', config);
  emit('close');
}

function onLobbyRooms(rooms) {
  activeRooms.value = rooms;
}

onMounted(() => {
  realtimeService.on('sync', onSync);
  realtimeService.on('statusChange', onStatusChange);
  realtimeService.on('gameStarted', onGameStarted);
  realtimeService.on('lobbyRooms', onLobbyRooms);

  // Subscribe ke lobby presence
  realtimeService.subscribeLobby(supabaseUrl.value, supabaseKey.value);

  if (realtimeService.connected) {
    isConnected.value = true;
    currentRoom.value = realtimeService.room;
    peers.value = realtimeService.peers;
  }
});

onUnmounted(() => {
  realtimeService.off('sync', onSync);
  realtimeService.off('statusChange', onStatusChange);
  realtimeService.off('gameStarted', onGameStarted);
  realtimeService.off('lobbyRooms', onLobbyRooms);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 480px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: var(--radius-md);
  border: var(--border-thick);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: var(--border-thick);
  padding-bottom: 12px;
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.badge-status {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: #e2e8f0;
  color: #475569;
}

.badge-status.online {
  background: var(--pastel-green);
  color: var(--pastel-green-deep);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  padding: 4px;
}

/* LOBBY VIEW */
.lobby-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-row label {
  font-size: 12px;
  font-weight: 700;
}

.neo-input {
  padding: 8px 12px;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--card-alt);
  color: var(--text-main);
  outline: none;
}

.neo-input.input-sm {
  font-size: 12px;
  padding: 6px 10px;
}

.create-bar {
  display: flex;
}

.btn-create {
  width: 100%;
  padding: 10px;
  background: var(--pastel-yellow);
  color: #1e293b;
  font-weight: 800;
  font-size: 14px;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.btn-create:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-hover);
}

.active-rooms-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 12px;
  font-weight: 800;
}

.live-tag {
  font-size: 11px;
  color: #16a34a;
  font-weight: 700;
}

.empty-rooms {
  padding: 16px;
  text-align: center;
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
}

.empty-rooms p {
  margin: 0;
  font-weight: 700;
  font-size: 13px;
}

.sub-text {
  font-size: 11px;
  color: var(--text-dim);
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.room-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--card-bg);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
}

.room-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.room-name {
  font-size: 13px;
  font-weight: 800;
}

.room-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

.badge-waiting {
  font-size: 10px;
  font-weight: 700;
  color: #15803d;
  background: var(--pastel-green);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

.badge-ingame {
  font-size: 10px;
  font-weight: 700;
  color: #b45309;
  background: var(--pastel-orange);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

.btn-join {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 800;
  background: var(--pastel-blue);
  color: #0369a1;
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.btn-join:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.manual-room-details {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  cursor: pointer;
}

.manual-join-row {
  display: flex;
  gap: 6px;
}

.btn-sm-action {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 800;
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.flex-1 {
  flex: 1;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.gap-2 {
  gap: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.error-msg {
  font-size: 12px;
  color: #b91c1c;
  font-weight: 700;
  background: #fee2e2;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid #ef4444;
}

/* ROOM VIEW */
.room-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.room-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.btn-copy {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  cursor: pointer;
}

.slot-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.slot-card {
  padding: 8px;
  border-radius: var(--radius-sm);
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slot-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slot-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.slot-name {
  font-size: 12px;
  font-weight: 700;
}

.slot-occupant {
  font-size: 11px;
  min-height: 18px;
}

.occupant-name {
  font-weight: 700;
}

.tag-you {
  color: var(--pastel-blue-deep);
  font-size: 10px;
}

.empty-tag {
  color: var(--text-dim);
}

.btn-claim {
  padding: 4px;
  font-size: 11px;
  font-weight: 700;
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  cursor: pointer;
}

.claimed-badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--pastel-green-deep);
  text-align: center;
}

.action-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.btn-leave {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  background: #fee2e2;
  color: #991b1b;
  cursor: pointer;
}

.btn-start {
  flex: 1;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 800;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  background: var(--pastel-green);
  color: #14532d;
  cursor: pointer;
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
