// 定義音符頻率
const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50
};

const fr = (names: string[]) => names.map(n => NOTE_FREQ[n]);

type WaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface TrackEvent {
  t: number;
  notes?: number[];
  note?: number;
  dur: number;
}

interface TrackConfig {
  loopDur: number;
  padWave: WaveType; padPeak: number; padAttack: number; padRelease: number;
  pad: TrackEvent[];
  melodyWave: WaveType; melodyPeak: number; melodyAttack: number; melodyRelease: number;
  melody: TrackEvent[];
}

// 預設音樂軌道
const TRACKS: Record<string, TrackConfig> = {
  menu: {
    loopDur: 8.0,
    padWave: 'sine', padPeak: 0.25, padAttack: 1.0, padRelease: 1.5,
    pad: [
      { t: 0.0, notes: fr(['C4', 'E4', 'G4', 'B4']), dur: 2.0 },
      { t: 2.0, notes: fr(['A3', 'C4', 'E4', 'G4']), dur: 2.0 },
      { t: 4.0, notes: fr(['F3', 'A3', 'C4', 'E4']), dur: 2.0 },
      { t: 6.0, notes: fr(['G3', 'B3', 'D4', 'F4']), dur: 2.0 }
    ],
    melodyWave: 'sine', melodyPeak: 0.15, melodyAttack: 0.05, melodyRelease: 1.0,
    melody: [
      { t: 0.5, note: NOTE_FREQ.E5, dur: 1.0 },
      { t: 2.5, note: NOTE_FREQ.G5, dur: 1.0 },
      { t: 4.5, note: NOTE_FREQ.A5, dur: 1.0 },
      { t: 6.5, note: NOTE_FREQ.D5, dur: 1.0 }
    ]
  },
  quiz: {
    loopDur: 4.0,
    padWave: 'triangle', padPeak: 0.12, padAttack: 0.1, padRelease: 0.3,
    pad: [
      { t: 0.0, notes: fr(['C4', 'E4', 'G4']), dur: 0.8 },
      { t: 1.0, notes: fr(['A3', 'C4', 'E4']), dur: 0.8 },
      { t: 2.0, notes: fr(['F3', 'A3', 'C4']), dur: 0.8 },
      { t: 3.0, notes: fr(['G3', 'B3', 'D4']), dur: 0.8 }
    ],
    melodyWave: 'triangle', melodyPeak: 0.18, melodyAttack: 0.02, melodyRelease: 0.15,
    melody: [
      { t: 0.0, note: NOTE_FREQ.C5, dur: 0.2 }, { t: 0.3, note: NOTE_FREQ.E5, dur: 0.2 },
      { t: 1.0, note: NOTE_FREQ.A5, dur: 0.2 }, { t: 1.3, note: NOTE_FREQ.C6, dur: 0.2 },
      { t: 2.0, note: NOTE_FREQ.F5, dur: 0.2 }, { t: 2.3, note: NOTE_FREQ.A5, dur: 0.2 },
      { t: 3.0, note: NOTE_FREQ.G5, dur: 0.2 }, { t: 3.3, note: NOTE_FREQ.B5, dur: 0.2 }
    ]
  },
  result: {
    loopDur: 3.0,
    padWave: 'sine', padPeak: 0.3, padAttack: 0.1, padRelease: 0.8,
    pad: [
      { t: 0.0, notes: fr(['F4', 'A4', 'C5']), dur: 0.8 },
      { t: 0.8, notes: fr(['G4', 'B4', 'D5']), dur: 0.8 },
      { t: 1.6, notes: fr(['C5', 'E5', 'G5', 'C6']), dur: 1.4 }
    ],
    melodyWave: 'triangle', melodyPeak: 0.25, melodyAttack: 0.02, melodyRelease: 0.4,
    melody: [
      { t: 0.0, note: NOTE_FREQ.F5, dur: 0.3 },
      { t: 0.4, note: NOTE_FREQ.A5, dur: 0.3 },
      { t: 0.8, note: NOTE_FREQ.G5, dur: 0.3 },
      { t: 1.2, note: NOTE_FREQ.B5, dur: 0.3 },
      { t: 1.6, note: NOTE_FREQ.C6, dur: 0.8 },
      { t: 1.8, note: NOTE_FREQ.E6, dur: 0.8 }
    ]
  }
};

// 全域音效狀態
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let audioUnlocked = false;
let currentMusicToken = 0;
let currentTrackName: string | null = null;
let desiredTrack = 'menu';
let isMuted = false;

// 確保 AudioContext 已建立
const ensureAudio = () => {
  if (audioCtx) return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : 1;
    masterGain.connect(audioCtx.destination);
    
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.55;
    musicGain.connect(masterGain);
    
    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.7;
    sfxGain.connect(masterGain);
  } catch (e) {
    audioCtx = null;
  }
};

const playTone = (
  freq: number, startTime: number, duration: number, 
  wave: WaveType, gainNode: GainNode | null, 
  peakGain: number = 1, attack: number = 0.02, release: number = 0.08
) => {
  if (!audioCtx || !gainNode) return;
  try {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    
    const endTime = startTime + duration;
    const atk = Math.min(attack, duration / 2);
    const releaseStart = Math.max(startTime + atk, endTime - release);
    
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(peakGain, startTime + atk);
    g.gain.setValueAtTime(peakGain, releaseStart);
    g.gain.linearRampToValueAtTime(0, endTime);
    
    osc.connect(g);
    g.connect(gainNode);
    osc.start(startTime);
    osc.stop(endTime + 0.05);
  } catch (e) {}
};

const playMusicLoop = (trackKey: string) => {
  if (!audioCtx) return;
  if (currentTrackName === trackKey) return;
  
  currentMusicToken++;
  const myToken = currentMusicToken;
  currentTrackName = trackKey;
  const track = TRACKS[trackKey];
  
  if (!track) return;

  const scheduleLoop = () => {
    if (myToken !== currentMusicToken || !audioCtx) return;
    const base = audioCtx.currentTime + 0.05;
    
    track.pad.forEach((ev) => {
      ev.notes?.forEach((freq) => {
        playTone(freq, base + ev.t, ev.dur, track.padWave, musicGain, track.padPeak, track.padAttack, track.padRelease);
      });
    });
    
    track.melody.forEach((ev) => {
      if (ev.note) {
        playTone(ev.note, base + ev.t, ev.dur, track.melodyWave, musicGain, track.melodyPeak, track.melodyAttack, track.melodyRelease);
      }
    });
    
    const loopMs = track.loopDur * 1000;
    setTimeout(() => {
      if (myToken === currentMusicToken) scheduleLoop();
    }, loopMs);
  };
  
  scheduleLoop();
};

export const setMuteState = (muted: boolean) => {
  isMuted = muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 1;
  }
};

export const setDesiredTrack = (key: string) => {
  desiredTrack = key;
  if (audioUnlocked) {
    ensureAudio();
    playMusicLoop(key);
  }
};

export const playSfx = (type: 'correct' | 'wrong') => {
  ensureAudio();
  if (!audioCtx || !sfxGain) return;
  const t = audioCtx.currentTime;
  
  if (type === 'correct') {
    playTone(NOTE_FREQ.C5, t, 0.12, 'triangle', sfxGain, 0.7, 0.01, 0.1);
    playTone(NOTE_FREQ.E5, t + 0.1, 0.12, 'triangle', sfxGain, 0.7, 0.01, 0.1);
    playTone(NOTE_FREQ.G5, t + 0.2, 0.15, 'triangle', sfxGain, 0.7, 0.01, 0.1);
    playTone(NOTE_FREQ.C6, t + 0.3, 0.40, 'sine', sfxGain, 0.8, 0.01, 0.3);
  } else {
    playTone(150, t, 0.25, 'square', sfxGain, 0.5, 0.01, 0.15);
    playTone(110, t + 0.18, 0.35, 'square', sfxGain, 0.5, 0.01, 0.25);
  }
};

export const unlockAudioOnce = () => {
  if (audioUnlocked) return;
  audioUnlocked = true;
  ensureAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => playMusicLoop(desiredTrack));
  } else {
    playMusicLoop(desiredTrack);
  }
};