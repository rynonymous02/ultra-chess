<template>
  <header class="navbar neo-card">
    <div class="brand">
      <div class="logo-box">
        <UiIcon name="knight" size="22" stroke-width="2" />
      </div>
      <h1 class="brand-title">Ultra Catur</h1>
    </div>

    <div class="nav-actions">
      <button
        v-if="inGame"
        class="restart-nav-btn"
        @click="$emit('restart-game')"
        title="Ulangi Pertandingan"
        aria-label="Ulang Pertandingan"
      >
        <span class="btn-icon">
          <UiIcon name="restart" size="15" />
        </span>
        <span class="btn-text">Ulang</span>
      </button>

      <button
        v-if="inGame"
        class="menu-nav-btn"
        @click="$emit('open-menu')"
        title="Kembali ke Menu Utama"
        aria-label="Menu Utama"
      >
        <span class="btn-icon">
          <UiIcon name="menu" size="15" />
        </span>
        <span class="btn-text">Menu</span>
      </button>

      <button
        class="online-nav-btn"
        @click="$emit('open-online')"
        title="Mode Online Multiplayer (Supabase)"
        aria-label="Online Multiplayer"
      >
        <span class="btn-icon">
          <UiIcon name="online" size="15" />
        </span>
        <span class="btn-text">Online</span>
      </button>

      <button
        class="icon-btn"
        @click="$emit('toggle-sound')"
        :title="soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'"
        aria-label="Toggle Suara"
      >
        <UiIcon :name="soundEnabled ? 'volume-on' : 'volume-off'" size="17" />
      </button>

      <button
        class="icon-btn"
        @click="$emit('toggle-theme')"
        :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        aria-label="Toggle Tema"
      >
        <UiIcon :name="isDark ? 'sun' : 'moon'" size="17" />
      </button>
    </div>
  </header>
</template>

<script setup>
import UiIcon from './UiIcon.vue';

defineProps({
  isDark: {
    type: Boolean,
    default: false
  },
  soundEnabled: {
    type: Boolean,
    default: true
  },
  inGame: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-theme', 'toggle-sound', 'open-menu', 'open-online', 'restart-game']);
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  margin-bottom: 16px;
  background: var(--card-bg);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-box {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--pastel-yellow);
  border: var(--border-thick);
  box-shadow: 2px 2px 0px var(--shadow-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-glyph {
  font-size: 24px;
  color: #1e293b;
}

.brand-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: var(--radius-sm);
  font-size: 16px;
}

.restart-nav-btn,
.menu-nav-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 800;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--shadow-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.restart-nav-btn {
  background: var(--pastel-yellow);
  color: #1e293b;
}

.menu-nav-btn {
  background: var(--card-alt);
  color: var(--text-main);
}

.restart-nav-btn:hover,
.menu-nav-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--shadow-color);
}

.online-nav-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 800;
  background: var(--pastel-green);
  color: #14532d;
  border: var(--border-thick);
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--shadow-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.online-nav-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--shadow-color);
}

@media (max-width: 768px) {
  .navbar {
    padding: 8px 10px;
    gap: 6px;
  }
  .brand-title {
    font-size: 15px;
  }
  .logo-box {
    width: 32px;
    height: 32px;
  }
  .logo-glyph {
    font-size: 16px;
  }
  .btn-text {
    display: none;
  }
  .restart-nav-btn,
  .menu-nav-btn,
  .online-nav-btn,
  .icon-btn {
    padding: 0;
    width: 34px;
    height: 34px;
    min-width: 34px;
    justify-content: center;
    font-size: 14px;
  }
}
</style>
