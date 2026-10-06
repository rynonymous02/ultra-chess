<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card neo-card">
      <div class="modal-header">
        <div class="title-box">
          <span class="icon">📖</span>
          <h2 class="modal-title">Panduan Catur 4 Pemain & Arsitektur MVC</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Rules -->
        <section class="section">
          <div class="section-badge">Aturan Permainan</div>
          <ul class="rule-list">
            <li><strong>Papan 14&times;14:</strong> Berbentuk salib dengan 4 sudut 3&times;3 dipotong (tidak aktif).</li>
            <li><strong>Giliran:</strong> Berputar searah jarum jam: Merah (bawah) &rarr; Biru (kiri) &rarr; Kuning (atas) &rarr; Hijau (kanan).</li>
            <li><strong>Arah Langkah Pion:</strong> Maju ke depan searah jalurnya, memakan diagonal. Langkah 2 petak hanya di baris awal masing-masing.</li>
            <li><strong>Promosi Pion:</strong> Otomatis promosi menjadi <strong>Ratu (Queen)</strong> di baris ke-8 relatif pemain.</li>
            <li><strong>Skak & Eliminasi:</strong> Jika raja skakmat atau dimakan, pemain <strong>tereliminasi</strong> dan seluruh bidaknya lenyap dari papan.</li>
            <li><strong>Mode Aliansi:</strong>
              <ul>
                <li><em>Tim A vs Tim B:</em> 2 vs 2 (Merah + Kuning vs Biru + Hijau). Tidak bisa saling serang antar anggota tim.</li>
                <li><em>Free For All:</em> Semua pemain saling serang secara individu.</li>
                <li><em>3 vs 1:</em> 1 pemain bertahan melawan 3 aliansi musuh.</li>
              </ul>
            </li>
          </ul>
        </section>

        <!-- MVC Architecture Overview -->
        <section class="section mvc-section">
          <div class="section-badge badge-mvc">Arsitektur MVC (Model - View - Controller)</div>
          <p class="mvc-desc">
            Aplikasi ini dirancang mengikuti pola standar industri <strong>Model-View-Controller</strong>:
          </p>
          <div class="mvc-grid">
            <div class="mvc-box">
              <span class="mvc-tag tag-m">MODEL</span>
              <p class="mvc-file"><code>src/models/ChessModel.js</code></p>
              <p class="mvc-info">Mengelola state papan, aturan catur, move generation, kalkulasi skak/skakmat, dan rating AI.</p>
            </div>
            <div class="mvc-box">
              <span class="mvc-tag tag-c">CONTROLLER</span>
              <p class="mvc-file"><code>src/controllers/GameController.js</code></p>
              <p class="mvc-info">Mengkoordinasikan aksi pengguna, giliran bot AI, penjadwalan timer, dan efek suara synthesizer.</p>
            </div>
            <div class="mvc-box">
              <span class="mvc-tag tag-v">VIEW</span>
              <p class="mvc-file"><code>src/components/*.vue</code></p>
              <p class="mvc-info">Tampilan antarmuka reaktif Vue 3 dengan tema Soft Neo-Brutalism, papan interaktif, dan riwayat langkah.</p>
            </div>
          </div>
        </section>
      </div>

      <div class="modal-footer">
        <button class="btn-primary" @click="$emit('close')">Tutup Panduan</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  max-width: 640px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--card-bg);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--border-dark);
  padding-bottom: 12px;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
}

.close-btn {
  font-size: 24px;
  font-weight: 800;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
  padding: 0 4px;
}

.close-btn:hover {
  transform: scale(1.1);
  box-shadow: none;
}

.modal-body {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.section-badge {
  display: inline-block;
  background: var(--pastel-yellow);
  border: 1.5px solid var(--border-dark);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  box-shadow: 1.5px 1.5px 0px var(--shadow-color);
  margin-bottom: 8px;
}

.badge-mvc {
  background: var(--pastel-purple);
}

.rule-list {
  padding-left: 20px;
  color: var(--text-main);
}

.rule-list li {
  margin-bottom: 6px;
}

.mvc-section {
  background: var(--card-alt);
  border: var(--border-thick);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: var(--shadow-sm);
}

.mvc-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.mvc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mvc-box {
  background: var(--card-bg);
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-sm);
  padding: 10px;
  box-shadow: 1.5px 1.5px 0px var(--shadow-color);
}

.mvc-tag {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid var(--border-dark);
  margin-bottom: 4px;
}

.tag-m { background: var(--pastel-yellow); color: #854d0e; }
.tag-c { background: var(--pastel-blue); color: #0369a1; }
.tag-v { background: var(--pastel-green); color: #166534; }

.mvc-file {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 4px;
}

.mvc-info {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0;
}

.modal-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 2px solid var(--border-dark);
  padding-top: 12px;
}

@media (max-width: 640px) {
  .mvc-grid {
    grid-template-columns: 1fr;
  }
}
</style>
