/**
 * videoEngine.js
 * Comprehensive client-side animation, audio synthesis, and video recording engine
 * for Flowbanner App Promo Video Creator.
 */

/* ============================================================
   EASING FUNCTIONS
   ============================================================ */
export const Easings = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  // Spring overshoot (perfect for badges, icons, phones)
  easeOutBack: (t, s = 1.70158) => {
    const p = t - 1;
    return p * p * ((s + 1) * p + s) + 1;
  },
};

/* ============================================================
   SCENE TIMINGS CALCULATOR
   ============================================================ */
/**
 * Calculates time intervals for all scenes in the project.
 * @param {Array} canvases 
 * @returns {{ totalDuration: number, sceneStarts: number[], sceneDurations: number[] }}
 */
export function computeSceneTimings(canvases) {
  const sceneDurations = canvases.map((c) => Math.max(1.5, c.videoDuration || 3.0));
  const sceneStarts = [];
  let cur = 0;
  for (const d of sceneDurations) {
    sceneStarts.push(cur);
    cur += d;
  }
  return {
    totalDuration: Math.max(1.5, cur),
    sceneStarts,
    sceneDurations,
  };
}

/**
 * Given current videoTime (seconds), determines which scene is active,
 * local time in that scene, and transition state.
 */
export function getActiveSceneState(canvases, videoTime) {
  const { totalDuration, sceneStarts, sceneDurations } = computeSceneTimings(canvases);
  const clampedTime = Math.max(0, Math.min(videoTime, totalDuration - 0.001));

  let sceneIndex = 0;
  for (let i = sceneStarts.length - 1; i >= 0; i--) {
    if (clampedTime >= sceneStarts[i]) {
      sceneIndex = i;
      break;
    }
  }

  const sceneStart = sceneStarts[sceneIndex];
  const sceneDuration = sceneDurations[sceneIndex];
  const timeInScene = clampedTime - sceneStart;
  const progressInScene = timeInScene / sceneDuration;

  // Transition window (last 0.5s of the scene, if there is a next scene)
  const TRANSITION_DUR = 0.5;
  const isTransitioning =
    sceneIndex < canvases.length - 1 && timeInScene >= sceneDuration - TRANSITION_DUR;
  const transitionProgress = isTransitioning
    ? (timeInScene - (sceneDuration - TRANSITION_DUR)) / TRANSITION_DUR
    : 0;

  return {
    sceneIndex,
    nextSceneIndex: sceneIndex < canvases.length - 1 ? sceneIndex + 1 : null,
    timeInScene,
    progressInScene,
    isTransitioning,
    transitionProgress,
    totalDuration,
  };
}

/* ============================================================
   OBJECT ANIMATION EVALUATION
   ============================================================ */
/**
 * Computes the animated properties of an object at a given time within a scene.
 * @param {object} obj - The design object
 * @param {number} timeInScene - Elapsed seconds in current scene
 * @param {number} sceneDuration - Total seconds of current scene
 * @returns {object} Interpolated { x, y, scaleX, scaleY, opacity, rotation, tiltX, tiltY }
 */
export function evaluateObjectAnimation(obj, timeInScene, sceneDuration) {
  const anim = obj.anim || {};
  const entrance = anim.entrance || (obj.type === "device" ? "tilt-in" : "slide-up");
  const delay = anim.delay ?? 0.15;
  const duration = anim.duration ?? 0.65;
  const loop = anim.loop || (obj.type === "device" ? "float" : "none");

  const baseScaleX = obj.scaleX || 1;
  const baseScaleY = obj.scaleY || 1;
  const baseRotation = obj.rotation || 0;
  const baseTiltX = obj.tiltX || 0;
  const baseTiltY = obj.tiltY || 0;
  const baseOpacity = obj.hidden ? 0 : obj.opacity ?? 1;

  let x = obj.x;
  let y = obj.y;
  let scaleX = baseScaleX;
  let scaleY = baseScaleY;
  let rotation = baseRotation;
  let tiltX = baseTiltX;
  let tiltY = baseTiltY;
  let opacity = baseOpacity;

  // 1. Entrance animation progress
  if (timeInScene < delay) {
    // Before entrance starts
    opacity = 0;
    if (entrance === "slide-up") y += 140;
    if (entrance === "slide-down") y -= 140;
    if (entrance === "pop") { scaleX = 0; scaleY = 0; }
    if (entrance === "tilt-in") { y += 220; tiltX = baseTiltX - 25; tiltY = baseTiltY + 30; }
    if (entrance === "zoom-in") { scaleX = baseScaleX * 1.5; scaleY = baseScaleY * 1.5; }
  } else {
    const elapsed = timeInScene - delay;
    const t = Math.min(1, elapsed / duration);

    if (entrance === "slide-up") {
      const ease = Easings.easeOutCubic(t);
      y = obj.y + (1 - ease) * 140;
      opacity = baseOpacity * Easings.easeOutQuad(t);
    } else if (entrance === "slide-down") {
      const ease = Easings.easeOutCubic(t);
      y = obj.y - (1 - ease) * 140;
      opacity = baseOpacity * Easings.easeOutQuad(t);
    } else if (entrance === "pop") {
      const ease = Easings.easeOutBack(t, 1.8);
      scaleX = baseScaleX * ease;
      scaleY = baseScaleY * ease;
      opacity = baseOpacity * Math.min(1, t * 2.5);
    } else if (entrance === "tilt-in") {
      const ease = Easings.easeOutCubic(t);
      y = obj.y + (1 - ease) * 220;
      tiltX = baseTiltX - (1 - ease) * 25;
      tiltY = baseTiltY + (1 - ease) * 30;
      opacity = baseOpacity * Math.min(1, t * 2);
    } else if (entrance === "zoom-in") {
      const ease = Easings.easeOutCubic(t);
      const s = 1.4 - 0.4 * ease;
      scaleX = baseScaleX * s;
      scaleY = baseScaleY * s;
      opacity = baseOpacity * ease;
    } else if (entrance === "fade") {
      opacity = baseOpacity * Easings.easeOutQuad(t);
    }
  }

  // 2. Ambient continuous loop animation (starts after entrance completes)
  if (timeInScene >= delay + duration) {
    const activeTime = timeInScene - (delay + duration);
    if (loop === "float") {
      // Gentle periodic levitation
      const floatY = Math.sin(activeTime * 2.6) * 12;
      const floatTilt = Math.cos(activeTime * 2.0) * 1.8;
      y += floatY;
      tiltX += floatTilt;
    } else if (loop === "pulse") {
      // Subtle rhythmic breathing
      const pulseS = 1 + Math.sin(activeTime * 3.5) * 0.035;
      scaleX *= pulseS;
      scaleY *= pulseS;
    }
  }

  return {
    ...obj,
    x,
    y,
    scaleX,
    scaleY,
    rotation,
    tiltX,
    tiltY,
    opacity,
  };
}

/* ============================================================
   WEB AUDIO SOUNDTRACK ENGINE (Royalty-free synthesized beats)
   ============================================================ */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.customAudio = null;
    this.customAudioSource = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = Math.max(0, Math.min(1, vol));
    }
  }

  // Play synthetic energetic promo synth chord/beat
  playNote(freq, type = "sine", duration = 0.4, startTime = 0, gainLevel = 0.15) {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {
      // Ignore audio scheduler edge cases
    }
  }

  startSoundtrack(trackId = "upbeat", volume = 0.8, customUrl = null) {
    this.init();
    this.stopSoundtrack();
    this.isPlaying = true;
    this.setVolume(volume);

    if (trackId === "custom" && customUrl) {
      if (!this.customAudio) {
        this.customAudio = new Audio();
      }
      this.customAudio.src = customUrl;
      this.customAudio.loop = true;
      this.customAudio.volume = volume;
      this.customAudio.play().catch(() => {});
      return;
    }

    if (trackId === "none") return;

    // Built-in synthetic energetic background beats
    let step = 0;
    const bpm = trackId === "pulse" ? 128 : trackId === "chill" ? 95 : 115;
    const stepTime = (60 / bpm) / 2; // eighth notes

    // Upbeat electronic chords & synth bass pattern
    const scales = {
      upbeat: [261.63, 329.63, 392.0, 523.25, 440.0, 349.23], // C major / A minor
      chill: [220.0, 261.63, 293.66, 329.63, 392.0], // Lo-fi A minor pentatonic
      pulse: [146.83, 174.61, 220.0, 261.63, 293.66], // D minor energetic
    };
    const scale = scales[trackId] || scales.upbeat;

    this.intervalId = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const noteFreq = scale[step % scale.length];

      // Bass kick / pulse
      if (step % 4 === 0) {
        this.playNote(65.41, "triangle", 0.35, 0, 0.28); // Low C bass
      }
      // Synth snare / hi-hat click
      if (step % 4 === 2) {
        this.playNote(1200, "square", 0.08, 0, 0.05); // Snap
      }
      // Melody arpeggio
      if (step % 2 === 0) {
        this.playNote(noteFreq * 2, "sine", 0.25, 0, 0.08);
      } else if (step % 4 === 3) {
        this.playNote(noteFreq * 1.5, "triangle", 0.3, 0, 0.06);
      }

      step++;
    }, stepTime * 1000);
  }

  seek(seconds) {
    if (this.customAudio && !isNaN(this.customAudio.duration)) {
      this.customAudio.currentTime = seconds % this.customAudio.duration;
    }
  }

  stopSoundtrack() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }
}

export const globalAudioEngine = new AudioEngine();

/* ============================================================
   CLIENT-SIDE VIDEO RECORDER
   ============================================================ */
/**
 * Records an animated canvas and optional audio track into a WebM / MP4 video.
 */
export async function recordCanvasToVideo({
  stage,
  duration,
  fps = 30,
  onProgress,
  mimeType = "video/webm;codecs=vp9",
}) {
  return new Promise((resolve, reject) => {
    try {
      const canvasElement = stage.toCanvas();
      if (!canvasElement) throw new Error("Could not access canvas");

      const stream = canvasElement.captureStream(fps);

      // Mix Web Audio if active
      if (globalAudioEngine.ctx && globalAudioEngine.masterGain) {
        const dest = globalAudioEngine.ctx.createMediaStreamDestination();
        globalAudioEngine.masterGain.connect(dest);
        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      }

      // Check supported mime types
      let selectedMime = mimeType;
      if (!MediaRecorder.isTypeSupported(selectedMime)) {
        selectedMime = MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : "";
      }

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime || "video/webm" });
        resolve(blob);
      };

      recorder.onerror = (err) => reject(err);

      recorder.start(100);

      const startTime = performance.now();
      const progressInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(1, elapsed / duration);
        if (onProgress) onProgress(progress);
        if (elapsed >= duration) {
          clearInterval(progressInterval);
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }
      }, 100);
    } catch (e) {
      reject(e);
    }
  });
}
