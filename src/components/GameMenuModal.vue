<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card neo-card">
      <div class="modal-header">
        <div class="title-wrap">
          <UiIcon name="menu" size="20" />
          <h2 class="modal-title">Menu Pertandingan</h2>
        </div>
        <button class="close-btn" @click="$emit('close')" aria-label="Tutup Menu">
          <UiIcon name="x" size="18" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Opsi Rotasi Papan / Bidak Catur -->
        <div class="option-box neo-card" @click="toggleRotate">
          <div class="option-info">
            <span class="option-label">Rotasi Papan Sesuai Arah Pemain</span>
            <p class="option-desc">
              Membalik perspektif papan mengikuti giliran pemain yang aktif agar nyaman dimainkan berhadapan pada satu perangkat.
            </p>
          </div>
          <div :class="['neo-checkbox', { checked: autoRotate }]">
            <UiIcon v-if="autoRotate" name="check" size="16" stroke-width="3" />
          </div>
        </div>

        <!-- Tombol Aksi -->
        <div class="action-buttons">
          <button class="menu-action-btn btn-resume btn-primary" @click="$emit('close')">
            <UiIcon name="play" size="16" />
            <span>Lanjutkan</span>
          </button>

          <button class="menu-action-btn btn-restart" @click="$emit('restart')">
            <UiIcon name="restart" size="16" />
            <span>Ulang</span>
          </button>

          <button class="menu-action-btn btn-back-menu" @click="$emit('main-menu')">
            <UiIcon name="menu" size="16" />
            <span>Kembali Ke Menu</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import UiIcon from './UiIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  autoRotate: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'restart', 'main-menu', 'update:autoRotate']);

function toggleRotate() {
  emit('update:autoRotate', !props.autoRotate);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: modalPop 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--border-dark);
  padding-bottom: 12px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.close-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--card-alt);
  color: var(--text-main);
  border: var(--border-thick);
  box-shadow: 2px 2px 0px var(--shadow-color);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.close-btn:hover {
  transform: translate(-1px, -1px);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: var(--card-alt);
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease;
}

.option-box:hover {
  transform: translate(-1px, -1px);
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.option-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-main);
}

.option-desc {
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.35;
  margin: 0;
}

.neo-checkbox {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: var(--border-thick);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 2px 2px 0px var(--shadow-color);
  flex-shrink: 0;
  transition: all 0.12s ease;
}

.neo-checkbox.checked {
  background: var(--accent-green);
  color: #14532d;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-action-btn {
  width: 100%;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 800;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: var(--border-thick);
  box-shadow: 2.5px 2.5px 0px var(--shadow-color);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.menu-action-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3.5px 3.5px 0px var(--shadow-color);
}

.btn-resume {
  background: var(--pastel-green);
  color: #14532d;
}

.btn-restart {
  background: var(--pastel-yellow);
  color: #1e293b;
}

.btn-back-menu {
  background: var(--card-alt);
  color: var(--text-main);
}
</style>
