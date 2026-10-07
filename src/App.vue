<template>
  <div class="app-layout" :data-board-skin="boardSkin">
    <div :class="['app-container', { 'is-game': currentScreen === 'game' }]">
      <!-- Navbar -->
      <GameNavbar
        :is-dark="isDark"
        :sound-enabled="soundEnabled"
        :in-game="currentScreen === 'game'"
        @toggle-theme="toggleTheme"
        @toggle-sound="toggleSound"
        @open-menu="goToMenu"
        @open-online="isOnlineModalOpen = true"
      />

      <!-- Setup View: 2 Kolom (Menu & Map Skirmish) -->
      <div v-if="currentScreen === 'setup'" class="setup-grid">
        <main class="main-column">
          <GameSetup
            :mode="gameConfig.mode"
            :lone="gameConfig.lone"
            :initial-slots="gameConfig.slots"
            :players="players"
            :current-map="selectedMap"
            @update:players="players = $event"
            @update:mode="gameConfig.mode = $event"
            @update:lone="gameConfig.lone = $event"
            @start-game="handleStartGame"
          />
        </main>

        <aside class="side-column">
          <MapSkirmishCard
            :current-map="selectedMap"
            :players="players"
            :skin="boardSkin"
            @update:skin="handleSkinChange"
            @update:map="handleMapChange"
            @open-editor="isEditorOpen = true"
          />
        </aside>
      </div>

      <!-- In-Game View: 1 Kolom Terpusat (Hanya muncul saat game) -->
      <main v-if="currentScreen === 'game'" class="game-layout">
        <!-- Status Mode Online (Supabase Realtime) -->
        <div v-if="isOnlineGame" class="online-indicator neo-card">
          <div class="online-pill">
            <span class="live-dot"></span>
            <span>Room: <strong>{{ currentOnlineRoom }}</strong></span>
            <span class="online-map-tag">Map: <strong>{{ currentMapName }}</strong></span>
          </div>
          <div v-if="myOnlinePlayer" class="online-pill">
            <span>Anda:</span>
            <strong :style="{ color: myOnlinePlayer.color }">{{ myOnlinePlayer.name }}</strong>
            <span
              class="turn-tag"
              :class="{ 'is-turn': controllerState.cur === myOnlineSlot }"
            >
              {{ controllerState.cur === myOnlineSlot ? 'Giliran Anda' : 'Menunggu Lawan' }}
            </span>
            <span v-if="isAiHost" class="host-pill" title="Client ini yang mengendalikan AI">Host AI</span>
          </div>
        </div>

        <!-- Status Giliran & Alert Skak -->
        <StatusBanner
          :cur-player="curPlayer"
          :cur-slot="controllerState.slots ? controllerState.slots[controllerState.cur] : 'human'"
          :in-check-names="controllerState.inCheckNames || []"
          :event-message="controllerState.msg || ''"
          :game-over="controllerState.over"
          :is-bot-thinking="controllerState.isBotThinking"
          @restart-game="handleRestartGame"
          @open-menu="goToMenu"
        />

        <!-- Papan Catur -->
        <ChessBoard
          :board="controllerState.board || []"
          :players="controllerState.players || players"
          :selected-cell="controllerState.selectedCell"
          :last-move="controllerState.last"
          :legal-moves="controllerState.legalMoves || []"
          :in-check-players="controllerState.checks || []"
          :is-human-turn="controllerState.isHumanTurn"
          :map-id="controllerState.mapId"
          :board-skin="boardSkin"
          @select-cell="handleSelectCell"
          @make-move="handleMakeMove"
        />

        <!-- Status Bar Pemain -->
        <PlayerBar
          :players="controllerState.players || players"
          :cur-player-id="controllerState.cur"
          :alive="controllerState.alive || []"
          :mode="controllerState.mode || 'team'"
          :slots="controllerState.slots || []"
          :lone="gameConfig.lone"
          :map-id="controllerState.mapId"
        />

        <!-- Tombol Aksi Sederhana (Ulang & Menu) -->
        <GameControls
          @restart-game="handleRestartGame"
          @open-menu="goToMenu"
        />

        <!-- Catatan Langkah -->
        <MoveHistory :history="controllerState.history || []" />
      </main>

      <!-- Map Editor Modal (Terpisah dari alur layar utama) -->
      <MapEditor
        v-if="isEditorOpen"
        @close="isEditorOpen = false"
        @map-saved="handleMapSaved"
      />

      <!-- Online PvP Modal (Supabase) -->
      <OnlineRoomModal
        v-if="isOnlineModalOpen"
        :current-map="selectedMap"
        :players="players"
        :mode="gameConfig.mode"
        @close="isOnlineModalOpen = false"
        @start-online-game="handleStartOnlineGame"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { PLAYERS } from './models/ChessModel.js';
import { GameController } from './controllers/GameController.js';
import GameNavbar from './components/GameNavbar.vue';
import GameSetup from './components/GameSetup.vue';
import MapSkirmishCard from './components/MapSkirmishCard.vue';
import ChessBoard from './components/ChessBoard.vue';
import StatusBanner from './components/StatusBanner.vue';
import PlayerBar from './components/PlayerBar.vue';
import MoveHistory from './components/MoveHistory.vue';
import GameControls from './components/GameControls.vue';
import { getMapById, saveCustomMap } from './maps/index.js';
import MapEditor from './components/MapEditor.vue';
import OnlineRoomModal from './components/OnlineRoomModal.vue';
import { realtimeService } from './services/realtimeService.js';
import { setSoundEnabled, isSoundEnabled } from './utils/sound.js';

const currentScreen = ref('setup'); // 'setup' | 'game'
const isDark = ref(false);
const soundEnabled = ref(true);
const isEditorOpen = ref(false);
const boardSkin = ref(localStorage.getItem('ultra_catur_board_skin') || 'merah-putih');

function handleSkinChange(newSkin) {
  boardSkin.value = newSkin;
  localStorage.setItem('ultra_catur_board_skin', newSkin);
  document.documentElement.setAttribute('data-board-skin', newSkin);
  document.body.setAttribute('data-board-skin', newSkin);
}

const selectedMap = ref('plus-lane');

const players = ref(
  PLAYERS.map((p, idx) => ({
    ...p,
    spawn: idx + 1
  }))
);

const gameConfig = reactive({
  mode: 'team',
  lone: 0,
  slots: ['human', 'easy', 'easy', 'easy', 'hard']
});

const controller = new GameController({
  ...gameConfig,
  mapId: selectedMap.value,
  players: players.value
});

const controllerState = reactive({
  board: [],
  cur: 0,
  players: [],
  alive: [true, true, true, true, true],
  slots: ['human', 'easy', 'easy', 'easy', 'hard'],
  checks: [false, false, false, false, false],
  inCheckNames: [],
  last: null,
  over: null,
  msg: '',
  history: [],
  selectedCell: null,
  legalMoves: [],
  isBotThinking: false,
  isHumanTurn: true,
  mode: 'team',
  mapId: 'plus-lane'
});

const curPlayer = computed(() => {
  if (controllerState.players && controllerState.players[controllerState.cur]) {
    return controllerState.players[controllerState.cur];
  }
  return players.value[controllerState.cur] || PLAYERS[0];
});

function updateFromController(state) {
  controllerState.board = state.board;
  controllerState.cur = state.cur;
  controllerState.players = state.players ? [...state.players] : [...players.value];
  controllerState.alive = [...state.alive];
  controllerState.slots = [...state.slots];
  controllerState.checks = [...state.checks];
  controllerState.inCheckNames = [...state.inCheckNames];
  controllerState.last = state.last;
  controllerState.over = state.over;
  controllerState.msg = state.msg;
  controllerState.history = [...state.history];
  controllerState.selectedCell = state.selectedCell;
  controllerState.legalMoves = state.legalMoves ? [...state.legalMoves] : [];
  controllerState.isBotThinking = state.isBotThinking;
  controllerState.isHumanTurn = state.isHumanTurn;
  controllerState.mode = state.mode;
  controllerState.mapId = state.mapId || selectedMap.value;
}

let unsubscribe = null;

function handleMapChange(newMap) {
  selectedMap.value = newMap;
  if (newMap === 'double-last-line-defence') {
    gameConfig.mode = '4v1';
  } else if (newMap === 'default-lane') {
    gameConfig.mode = 'duel';
  } else if (gameConfig.mode === '4v1' || gameConfig.mode === 'duel') {
    gameConfig.mode = 'team';
  }
}

const isOnlineModalOpen = ref(false);
const isOnlineGame = ref(false);
const currentOnlineRoom = ref('');
const myOnlineSlot = ref(null);
const peersList = ref(realtimeService.peers || []);

const currentMapName = computed(() => {
  return getMapById(selectedMap.value)?.name || selectedMap.value;
});

const isAiHost = computed(() => {
  if (!isOnlineGame.value) return true;
  const claimedPeers = (peersList.value || [])
    .filter(p => p.slotIndex !== null && p.slotIndex !== undefined)
    .sort((a, b) => a.slotIndex - b.slotIndex);

  if (claimedPeers.length === 0) return true;
  return claimedPeers[0].id === realtimeService.clientId;
});

const myOnlinePlayer = computed(() => {
  if (myOnlineSlot.value === null || myOnlineSlot.value === undefined) return null;
  return controllerState.players?.[myOnlineSlot.value] || players.value[myOnlineSlot.value] || null;
});

function handleBotMove(move, curPlayerIndex) {
  if (isOnlineGame.value && isAiHost.value) {
    realtimeService.sendMove(move, curPlayerIndex);
  }
}

function syncOnlineConfig() {
  controller.setOnlineConfig({
    isOnline: isOnlineGame.value,
    isHost: isAiHost.value,
    onBotMove: handleBotMove
  });
}

function handlePeersSync(data) {
  peersList.value = data.peers || [];
  if (isOnlineGame.value) {
    syncOnlineConfig();
  }
}

function handleMapSaved(newMapId) {
  selectedMap.value = newMapId;
}

function handleStartOnlineGame(config) {
  isOnlineGame.value = true;
  currentOnlineRoom.value = realtimeService.room;
  myOnlineSlot.value = realtimeService.mySlotIndex;
  peersList.value = [...(realtimeService.peers || [])];
  handleStartGame(config);
}

function handleRemoteMove({ move }) {
  if (isOnlineGame.value) {
    controller.executeMove(move);
  }
}

function handleRemoteRestart() {
  if (isOnlineGame.value) {
    controller.restart();
  }
}

function handleStartGame(config) {
  if (config.mapData) {
    saveCustomMap(config.mapData);
  }
  const effectiveMapId = config.mapId || selectedMap.value;
  selectedMap.value = effectiveMapId;

  gameConfig.mode = config.mode;
  gameConfig.lone = config.lone !== undefined ? config.lone : 0;
  gameConfig.slots = [...config.slots];

  const activePlayers = config.players ? [...config.players] : [...players.value];
  const selectedMapObj = getMapById(effectiveMapId);
  const spawnCount = selectedMapObj?.playersCount || (effectiveMapId === 'double-last-line-defence' ? 5 : effectiveMapId === 'default-lane' ? 2 : 4);
  const orderedPlayers = Array.from({ length: spawnCount }, (_, i) => i + 1).map((spawnNum, idx) => {
    const found = activePlayers.find(p => p.spawn === spawnNum) || activePlayers[spawnNum - 1] || PLAYERS[spawnNum - 1] || PLAYERS[idx] || { id: idx, name: 'Pemain ' + (idx + 1) };
    return { ...found, id: idx };
  });

  syncOnlineConfig();

  controller.startNewGame({
    mode: config.mode,
    lone: config.lone,
    slots: config.slots,
    mapId: effectiveMapId,
    players: orderedPlayers
  });

  currentScreen.value = 'game';
}

function handleRestartGame() {
  if (isOnlineGame.value) {
    realtimeService.restartGame();
  }
  controller.restart();
}

function goToMenu() {
  if (isOnlineGame.value) {
    isOnlineGame.value = false;
    realtimeService.disconnect();
  }
  controller.setOnlineConfig({ isOnline: false, isHost: true });
  controller.stop();
  currentScreen.value = 'setup';
}

function handleSelectCell([r, c]) {
  if (isOnlineGame.value) {
    if (controllerState.cur !== myOnlineSlot.value) return;
    const piece = controllerState.board[r]?.[c];
    if (piece && piece.p !== myOnlineSlot.value) return;
  }
  controller.selectCell(r, c);
}

function handleMakeMove(move) {
  if (isOnlineGame.value) {
    if (controllerState.cur !== myOnlineSlot.value) return;
    realtimeService.sendMove(move, myOnlineSlot.value);
  }
  controller.executeMove(move);
}

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
  setSoundEnabled(soundEnabled.value);
}

onMounted(() => {
  unsubscribe = controller.subscribe(updateFromController);
  updateFromController(controller.getControllerState());

  realtimeService.on('sync', handlePeersSync);
  realtimeService.on('moveMade', handleRemoteMove);
  realtimeService.on('gameRestarted', handleRemoteRestart);

  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.setAttribute('data-board-skin', boardSkin.value);
  document.body.setAttribute('data-board-skin', boardSkin.value);
  soundEnabled.value = isSoundEnabled();
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  if (controller.stop) controller.stop();
  realtimeService.off('sync', handlePeersSync);
  realtimeService.off('moveMade', handleRemoteMove);
  realtimeService.off('gameRestarted', handleRemoteRestart);
  if (isOnlineGame.value) {
    realtimeService.disconnect();
  }
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  padding: 16px 12px;
  display: flex;
  justify-content: center;
}

.app-container {
  width: 100%;
  max-width: 1100px;
  transition: max-width 0.2s ease;
}

.app-container.is-game {
  max-width: 680px;
}

/* Setup: 2 Kolom */
.setup-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
}

.main-column {
  min-width: 0;
}

.side-column {
  position: sticky;
  top: 16px;
}

/* In-Game: 1 Kolom Terpusat */
.game-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
}

@media (max-width: 900px) {
  .setup-grid {
    grid-template-columns: 1fr;
  }
  .side-column {
    position: static;
  }
}

.online-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 10px;
  background: var(--card-bg);
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  font-size: 13px;
  gap: 8px;
  flex-wrap: wrap;
}

.online-pill {
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

.turn-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--card-alt);
  color: var(--text-dim);
  border: 1px solid var(--border-dark);
}

.turn-tag.is-turn {
  background: var(--pastel-yellow);
  color: #1e293b;
  border-color: var(--border-dark);
}

.online-map-tag {
  font-size: 11px;
  background: var(--card-alt);
  border: 1px solid var(--border-dark);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--text-main);
}

.host-pill {
  font-size: 10px;
  font-weight: 800;
  background: var(--pastel-yellow);
  color: #1e293b;
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-dark);
}
</style>
