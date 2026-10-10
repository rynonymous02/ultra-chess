<template>
  <aside class="map-panel neo-card">
    <div class="panel-header">
      <div class="header-badge">
        <span>Peta & Lokasi Pemain</span>
      </div>
      <h3 class="panel-title">Radar 4 Sisi Papan</h3>
      <p class="panel-desc">Visualisasi kuadran spawn, arah serang pion, dan posisi raja setiap kubu.</p>
    </div>

    <!-- Visual Compass Mini-Map (Radar Salib 4 Sisi) -->
    <div class="mini-map-box neo-card">
      <div class="compass-label-wrap">
        <span class="compass-sticker">Orientasi Kompas 14&times;14</span>
        <span class="turn-clockwise-tag">Searah Jarum Jam</span>
      </div>

      <div class="cross-radar">
        <!-- North: Kuning -->
        <div
          :class="['radar-quadrant', 'quad-north', { 'is-active-turn': curPlayerId === 2, 'is-eliminated': !alive[2] }]"
          :style="{ backgroundColor: players[2].bgPastel, borderColor: 'var(--border-dark)' }"
        >
          <div class="quad-header">
            <span class="quad-dot" :style="{ backgroundColor: players[2].color }"></span>
            <span class="quad-name">{{ players[2].name }}</span>
            <span v-if="curPlayerId === 2 && alive[2]" class="active-badge">Giliran</span>
          </div>
          <div class="quad-meta">Utara &bull; Bawah &darr;</div>
        </div>

        <div class="radar-middle-row">
          <!-- West: Biru -->
          <div
            :class="['radar-quadrant', 'quad-west', { 'is-active-turn': curPlayerId === 1, 'is-eliminated': !alive[1] }]"
            :style="{ backgroundColor: players[1].bgPastel, borderColor: 'var(--border-dark)' }"
          >
            <div class="quad-header">
              <span class="quad-dot" :style="{ backgroundColor: players[1].color }"></span>
              <span class="quad-name">{{ players[1].name }}</span>
              <span v-if="curPlayerId === 1 && alive[1]" class="active-badge">Giliran</span>
            </div>
            <div class="quad-meta">Barat &bull; Kanan &rarr;</div>
          </div>

          <!-- Central Core (Battlefield) -->
          <div class="radar-center">
            <span class="center-text">Arena Pusat</span>
            <span class="center-sub">Zone 8&times;8</span>
          </div>

          <!-- East: Hijau -->
          <div
            :class="['radar-quadrant', 'quad-east', { 'is-active-turn': curPlayerId === 3, 'is-eliminated': !alive[3] }]"
            :style="{ backgroundColor: players[3].bgPastel, borderColor: 'var(--border-dark)' }"
          >
            <div class="quad-header">
              <span class="quad-dot" :style="{ backgroundColor: players[3].color }"></span>
              <span class="quad-name">{{ players[3].name }}</span>
              <span v-if="curPlayerId === 3 && alive[3]" class="active-badge">Giliran</span>
            </div>
            <div class="quad-meta">Timur &bull; Kiri &larr;</div>
          </div>
        </div>

        <!-- South: Merah -->
        <div
          :class="['radar-quadrant', 'quad-south', { 'is-active-turn': curPlayerId === 0, 'is-eliminated': !alive[0] }]"
          :style="{ backgroundColor: players[0].bgPastel, borderColor: 'var(--border-dark)' }"
        >
          <div class="quad-header">
            <span class="quad-dot" :style="{ backgroundColor: players[0].color }"></span>
            <span class="quad-name">{{ players[0].name }}</span>
            <span v-if="curPlayerId === 0 && alive[0]" class="active-badge">Giliran</span>
          </div>
          <div class="quad-meta">Selatan &bull; Atas &uarr;</div>
        </div>
      </div>
    </div>

    <!-- Player Location List -->
    <div class="locations-list">
      <div
        v-for="player in players"
        :key="player.id"
        :class="[
          'player-loc-card neo-card',
          {
            'is-active': curPlayerId === player.id,
            'is-dead': !alive[player.id],
            'is-in-check': inCheckPlayers[player.id]
          }
        ]"
        :style="{ backgroundColor: player.bgPastel }"
      >
        <div class="loc-card-header">
          <div class="name-box">
            <span class="dot" :style="{ backgroundColor: player.color }"></span>
            <span class="name-title" :style="{ color: player.textPastel }">{{ player.name }}</span>
            <span class="side-pill">{{ player.zone }}</span>
          </div>

          <!-- Status badge -->
          <span v-if="!alive[player.id]" class="status-sticker dead">Gugur</span>
          <span v-else-if="inCheckPlayers[player.id]" class="status-sticker check animate-shake">SKAK!</span>
          <span v-else-if="curPlayerId === player.id" class="status-sticker active">Giliran</span>
          <span v-else class="status-sticker idle">Menunggu</span>
        </div>

        <div class="loc-details-grid">
          <div class="detail-item">
            <span class="label">Markas Spawn:</span>
            <span class="val">{{ player.baseCoord }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Arah Pion:</span>
            <span class="val highlight">{{ player.direction }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Posisi Raja:</span>
            <span class="val king-val">
              <template v-if="!alive[player.id]">
                💀 Gugur
              </template>
              <template v-else-if="kingLocations && kingLocations[player.id]">
                👑 {{ kingLocations[player.id].notation }}
              </template>
              <template v-else>
                👑 Terpasang
              </template>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">Kekuatan:</span>
            <span class="val">
              <template v-if="pieceCounts && pieceCounts[player.id]">
                ♟ {{ pieceCounts[player.id] }}/16 Bidak
              </template>
              <template v-else>
                ♟ 16/16 Bidak
              </template>
            </span>
          </div>
        </div>

        <div class="loc-footer">
          <span class="team-tag">{{ getTeamLabel(player.id) }}</span>
          <span class="role-tag">{{ getRoleLabel(player.id) }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { PLAYERS, DIFFICULTY_LABELS } from '../models/ChessModel.js';

const props = defineProps({
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
  inCheckPlayers: {
    type: Array,
    default: () => [false, false, false, false]
  },
  kingLocations: {
    type: Array,
    default: () => [null, null, null, null]
  },
  pieceCounts: {
    type: Array,
    default: () => [16, 16, 16, 16]
  }
});

const players = PLAYERS;

function getTeamLabel(id) {
  if (props.mode === 'team') {
    return id % 2 === 0 ? 'Tim A (Aliansi)' : 'Tim B (Aliansi)';
  } else if (props.mode === 'solo') {
    return id === props.lone ? 'Solo Defender' : 'Koalisi 3';
  }
  return 'FFA (Individu)';
}

function getRoleLabel(id) {
  return DIFFICULTY_LABELS[props.slots[id]] || props.slots[id];
}
</script>

<style scoped>
.map-panel {
  padding: 18px;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.panel-header {
  border-bottom: 2px solid var(--border-dark);
  padding-bottom: 12px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--pastel-yellow);
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-pill);
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 6px;
  box-shadow: var(--shadow-sm);
}

.panel-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.panel-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Compass Mini Map */
.mini-map-box {
  padding: 12px;
  background: var(--card-alt);
  border-radius: var(--radius-md);
  border: var(--border-thick);
  box-shadow: var(--shadow-sm);
}

.compass-label-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.compass-sticker {
  font-size: 11px;
  font-weight: 800;
  background: var(--pastel-blue);
  color: #0369a1;
  border: 1px solid var(--border-dark);
  padding: 2px 6px;
  border-radius: var(--radius-pill);
}

.turn-clockwise-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
}

.cross-radar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.radar-middle-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.radar-quadrant {
  border: 2px solid var(--border-dark);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  user-select: none;
}

.quad-north, .quad-south {
  width: 150px;
}

.quad-west, .quad-east {
  width: 90px;
  flex-shrink: 0;
}

.radar-center {
  width: 76px;
  height: 60px;
  background: #1e293b;
  color: #f8fafc;
  border: 2px solid var(--border-dark);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.center-icon {
  font-size: 14px;
}

.center-text {
  font-size: 10px;
  font-weight: 800;
  line-height: 1.1;
}

.center-sub {
  font-size: 9px;
  color: #94a3b8;
}

.quad-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quad-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid var(--border-dark);
}

.quad-name {
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
}

.active-badge {
  font-size: 9px;
  font-weight: 800;
  background: var(--pastel-yellow);
  color: #1e293b;
  border: 1px solid var(--border-dark);
  padding: 1px 4px;
  border-radius: 4px;
}

.quad-meta {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  margin-top: 2px;
}

.radar-quadrant.is-active-turn {
  transform: scale(1.04);
  box-shadow: 3px 3px 0px var(--shadow-color);
  border-width: 2.5px;
}

.radar-quadrant.is-eliminated {
  opacity: 0.4;
  filter: grayscale(0.8);
  box-shadow: none;
}

/* Location Card List */
.locations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-loc-card {
  padding: 12px;
  border-radius: var(--radius-md);
  border: var(--border-thick);
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}

.player-loc-card.is-active {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px var(--shadow-color);
}

.player-loc-card.is-dead {
  opacity: 0.45;
  filter: grayscale(0.8);
  box-shadow: none;
}

.player-loc-card.is-in-check {
  border-color: #ef4444;
  box-shadow: 3px 3px 0px #ef4444;
}

.loc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.name-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.name-box .dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1.5px solid var(--border-dark);
}

.name-title {
  font-size: 14px;
  font-weight: 800;
}

.side-pill {
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border-dark);
  padding: 1px 5px;
  border-radius: var(--radius-pill);
}

.status-sticker {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-dark);
}

.status-sticker.active {
  background: var(--pastel-yellow);
  color: #854d0e;
}

.status-sticker.check {
  background: #f43f5e;
  color: #ffffff;
}

.status-sticker.dead {
  background: var(--pastel-rose);
  color: #9f1239;
}

.status-sticker.idle {
  background: rgba(255, 255, 255, 0.6);
  color: var(--text-dim);
}

.loc-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  margin-bottom: 6px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
}

.detail-item .val {
  font-weight: 800;
  color: #1e293b;
}

.detail-item .val.highlight {
  color: #0369a1;
}

.detail-item .val.king-val {
  font-family: var(--font-mono);
}

.loc-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
}

.team-tag, .role-tag {
  background: rgba(0, 0, 0, 0.05);
  padding: 1px 5px;
  border-radius: 4px;
}
</style>
