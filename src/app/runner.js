import { Coach } from '../engine/coach.js';
import { MotionSegmenter } from '../engine/motion.js';
import { createTracker } from '../tracking/tracker.js';
import { drawOverlay } from '../tracking/overlay.js';
import { FrameBuffer } from '../tracking/frameBuffer.js';
import { getAiCue } from '../utils/coachApi.js';
import { speak, stopSpeaking } from '../utils/speechOutput.js';
import { playCueChime, primeAudio } from '../utils/soundFx.js';

const FRAME_MS = 33; // ~30 fps cap on detection
const TICK_MS = 150; // how often the page re-renders live numbers
const AI_GAP_MS = 4000; // at most one AI request this often

// One coaching session: camera -> tracker -> coach -> overlay, speech, events.
// The page only renders what this reports through onEvent and onTick.
export class SessionRunner {
  constructor({ drill, settings, video, canvas, onEvent, onTick }) {
    Object.assign(this, { drill, settings, video, canvas, onEvent, onTick });
    this.muted = false;
    this.running = false;
    this.ai = drill.mode === 'ai';
    this.coach = this.ai ? null : new Coach(drill, { settings });
    this.motion = this.ai ? new MotionSegmenter() : null;
    this.buffer = this.ai ? new FrameBuffer() : null;
    this.aiReps = 0;
    this.aiCues = 0;
    this.aiBusy = false;
    this.lastAiAt = -Infinity;
    this.noPoseSince = null;
    this.startedAt = null;
  }

  async start() {
    primeAudio(); // must run inside the click that started the session
    this.onEvent({ type: 'status', text: 'Starting your camera…' });
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch (err) {
      const denied = err?.name === 'NotAllowedError';
      this.onEvent({
        type: 'error',
        text: denied
          ? "Camera access is blocked. Allow it in your browser's site settings, then try again."
          : "Couldn't find a camera. Plug one in or try another browser, then try again.",
      });
      return false;
    }
    this.video.srcObject = this.stream;
    await this.video.play().catch(() => {});

    this.onEvent({ type: 'status', text: 'Loading the tracking models (first time takes a few seconds)…' });
    try {
      this.tracker = await createTracker({ hands: Boolean(this.drill.tracksHands) });
    } catch {
      this.stop();
      this.onEvent({
        type: 'error',
        text: "The tracking models didn't load. Check your connection and try again.",
      });
      return false;
    }

    this.running = true;
    this.startedAt = performance.now();
    this.onEvent({ type: 'status', text: null });
    this.loop();
    return true;
  }

  loop = () => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    if (now - (this.lastFrameAt ?? 0) < FRAME_MS || !this.video.videoWidth) return;
    this.lastFrameAt = now;

    let frame;
    try {
      frame = this.tracker.detect(this.video, now);
    } catch {
      return; // a dropped frame is fine
    }

    const events = this.ai ? this.stepAi(frame) : this.coach.push(frame);
    for (const e of events) this.handle(e);

    const latest = this.coach?.latest;
    this.draw(latest?.features?.pose ?? frame.pose, frame.hands, latest?.faultJoints ?? []);

    if (now - (this.lastTickAt ?? 0) >= TICK_MS) {
      this.lastTickAt = now;
      this.onTick(this.snapshot(frame));
    }
  };

  draw(pose, hands, faultJoints) {
    const { canvas, video } = this;
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    drawOverlay(canvas.getContext('2d'), canvas.width, canvas.height, { pose, hands, faultJoints });
  }

  stepAi(frame) {
    const events = [];
    this.buffer.capture(this.video, frame.t);
    if (!frame.pose) {
      this.noPoseSince ??= frame.t;
      if (frame.t - this.noPoseSince > 1500 && frame.t - (this.lastHintAt ?? 0) > 9000) {
        this.lastHintAt = frame.t;
        events.push({ type: 'hint', id: 'missing', text: 'Step into the frame so I can see your whole body.' });
      }
      return events;
    }
    this.noPoseSince = null;

    const move = this.motion.push(frame);
    if (!move) return events;
    this.aiReps += 1;
    events.push({ type: 'rep', index: this.aiReps, score: null, results: [] });
    if (this.aiBusy || frame.t - this.lastAiAt < AI_GAP_MS) return events;

    const image = this.buffer.strip(move.keyTimes);
    if (!image) return events;
    this.aiBusy = true;
    this.lastAiAt = frame.t;
    getAiCue({ image, sport: this.settings.sport, metrics: { angles: move.angles } })
      .then((text) => {
        if (!this.running) return;
        this.aiCues += 1;
        this.handle({ type: 'cue', id: `ai-${this.aiCues}`, text, source: 'ai' });
      })
      .catch(() => {
        if (this.running) this.handle({ type: 'error', text: "Couldn't reach the AI coach. It'll try again on your next rep." });
      })
      .finally(() => {
        this.aiBusy = false;
      });
    return events;
  }

  handle(e) {
    if (!this.muted && (e.type === 'cue' || e.type === 'praise' || e.type === 'hint')) {
      if (e.type === 'cue') playCueChime();
      speak(e.text);
    }
    this.onEvent(e);
  }

  snapshot(frame) {
    const elapsedMs = performance.now() - this.startedAt;
    if (this.ai) {
      return { elapsedMs, reps: this.aiReps, tracking: Boolean(frame.pose), results: [], score: null };
    }
    const c = this.coach;
    return {
      elapsedMs,
      tracking: Boolean(frame.pose) || frame.hands.length > 0,
      reps: c.reps.length,
      score: c.latest.score,
      results: c.latest.results,
      view: c.latest.features?.view ?? null,
      calibrated: c.calibration ? Boolean(c.baseline) : true,
      goodShare: c.holdTime.total ? c.holdTime.good / c.holdTime.total : null,
    };
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) stopSpeaking();
  }

  // Stops everything and returns the session summary.
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    stopSpeaking();
    this.stream?.getTracks().forEach((t) => t.stop());
    if (this.video) this.video.srcObject = null;
    this.buffer?.clear();
    if (this.coach) return this.coach.summary();
    return {
      drillId: this.drill.id,
      mode: 'ai',
      startedAt: Date.now() - (this.startedAt ? performance.now() - this.startedAt : 0),
      durationMs: this.startedAt ? performance.now() - this.startedAt : 0,
      reps: this.aiReps,
      avgScore: null,
      bestScore: null,
      goodTimeShare: null,
      checks: [],
      aiCues: this.aiCues,
    };
  }
}
