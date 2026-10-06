// Web Audio API Synthesizer for Chess Sound Effects

let audioCtx = null;
let soundEnabled = true;

function getContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(val) {
  soundEnabled = val;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function playMoveSound() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export function playCaptureSound() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playCheckSound() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [520, 680].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);

    gain.gain.setValueAtTime(0.35, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.16);
  });
}

export function playWinSound() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const notes = [440, 554, 659, 880];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0.3, now + idx * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.35);
  });
}
