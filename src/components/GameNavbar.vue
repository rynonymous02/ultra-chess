<template>
  <header class="navbar neo-card">
    <div class="brand">
      <div class="logo-box">
        <span class="logo-glyph">♞</span>
      </div>
      <h1 class="brand-title">Ultra Catur</h1>
    </div>

    <div class="nav-actions">
      <button
        class="icon-btn"
        @click="$emit('toggle-sound')"
        :title="soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'"
        aria-label="Toggle Suara"
      >
        <span v-if="soundEnabled">🔊</span>
        <span v-else>🔇</span>
      </button>

      <button
        class="icon-btn"
        @click="$emit('toggle-theme')"
        :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        aria-label="Toggle Tema"
      >
        <span v-if="isDark">☀️</span>
        <span v-else>🌙</span>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isDark: {
    type: Boolean,
    default: false
  },
  soundEnabled: {
    type: Boolean,
    default: true
  }
});

defineEmits(['toggle-theme', 'toggle-sound']);
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
</style>
