import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Play, Square, Trash2, Volume2, VolumeX } from 'lucide-react';
import WindowBar from './WindowBar.jsx';
import CameraFeed from './CameraFeed.jsx';
import FeedbackPanel from './FeedbackPanel.jsx';
import { captureFrame } from '../utils/captureFrame.js';
import { speak, stopSpeaking } from '../utils/speechOutput.js';
import { playCueChime, primeAudio } from '../utils/soundFx.js';
import { getCoachingFeedback } from '../utils/coachApi.js';

const CAPTURE_INTERVAL_MS = 2500;
const RETRY_DELAY_MS = 5000;

export default function Demo({ sports, selectedSport, onSportChange, showToast }) {
  const videoRef = useRef(null);
  // The camera stays off until the visitor asks for it, so the browser's
  // permission prompt never fires on page load.
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [muted, setMuted] = useState(false);
  const [feedback, setFeedback] = useState([]);

  // Refs let the capture loop read the latest values without re-subscribing.
  const lastFeedbackRef = useRef('');
  const mutedRef = useRef(muted);
  const sportRef = useRef(selectedSport);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    sportRef.current = selectedSport;
  }, [selectedSport]);

  // Cancel any in-flight speech if the demo ever unmounts.
  useEffect(() => () => stopSpeaking(), []);

  const onReadyChange = useCallback((ready) => setCameraReady(ready), []);

  // Latest framing status from the pose overlay ('good' | 'close' | 'far' | 'none').
  const distanceRef = useRef('none');
  const onDistanceChange = useCallback((s) => {
    distanceRef.current = s;
  }, []);

  const addFeedback = useCallback((text) => {
    setFeedback((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          text,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
        ...prev,
      ].slice(0, 50)
    );
  }, []);

  // The coaching loop: capture a frame, analyze it, dedupe, render and speak.
  // Self-scheduling so success and failure can use different cadences.
  useEffect(() => {
    if (!isCoaching || !cameraReady) return undefined;

    let cancelled = false;
    let timer;

    const tick = async () => {
      if (cancelled) return;

      // Nobody confidently in frame: skip the call and let the on-screen
      // framing pill guide positioning.
      if (distanceRef.current === 'none') {
        timer = setTimeout(tick, CAPTURE_INTERVAL_MS);
        return;
      }

      const frame = captureFrame(videoRef.current);
      if (!frame) {
        timer = setTimeout(tick, CAPTURE_INTERVAL_MS);
        return;
      }

      try {
        const cue = await getCoachingFeedback(frame, sportRef.current);
        if (cancelled) return;
        if (cue && cue !== lastFeedbackRef.current) {
          lastFeedbackRef.current = cue;
          addFeedback(cue);
          if (!mutedRef.current) {
            playCueChime();
            speak(cue);
          }
        }
        timer = setTimeout(tick, CAPTURE_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        showToast("Couldn't reach the coach. Retrying in a few seconds.", 'error');
        timer = setTimeout(tick, RETRY_DELAY_MS);
      }
    };

    timer = setTimeout(tick, CAPTURE_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isCoaching, cameraReady, addFeedback, showToast]);

  const toggleCoaching = () => {
    if (isCoaching) {
      setIsCoaching(false);
      stopSpeaking();
      return;
    }
    if (!cameraReady) {
      showToast('Turn on your camera first.', 'error');
      return;
    }
    lastFeedbackRef.current = '';
    primeAudio();
    setIsCoaching(true);
  };

  const turnCameraOff = () => {
    setIsCoaching(false);
    stopSpeaking();
    setCameraOn(false);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (next) stopSpeaking();
      return next;
    });
  };

  const clearFeed = () => {
    setFeedback([]);
    lastFeedbackRef.current = '';
  };

  return (
    <section id="demo" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-page">
        <div className="max-w-2xl">
          <h2 className="text-section font-semibold">try it now.</h2>
          <p className="mt-5 text-lead text-muted">
            Turn on your camera, pick a sport and press start. Stand back so your whole body is in
            frame. Cues show up within a few seconds.
          </p>
        </div>

        <div className="window mt-12">
          <WindowBar title="acuity kinetic">
            {cameraOn && (
              <button
                type="button"
                onClick={turnCameraOff}
                className="rounded-full px-2.5 py-0.5 text-xs text-muted transition-colors hover:bg-white hover:text-ink"
              >
                turn camera off
              </button>
            )}
          </WindowBar>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-4 py-3">
            <label htmlFor="sport" className="sr-only">
              Sport
            </label>
            <select
              id="sport"
              value={selectedSport}
              onChange={(e) => onSportChange(e.target.value)}
              disabled={isCoaching}
              className="field w-auto min-w-[11rem] cursor-pointer py-2 pr-9 text-sm"
            >
              {sports.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={muted}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 text-sm text-muted transition-colors hover:border-line hover:text-ink"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? 'muted' : 'sound on'}
            </button>
            <button
              type="button"
              onClick={clearFeed}
              disabled={feedback.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 text-sm text-muted transition-colors hover:border-line hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              clear
            </button>

            <button
              type="button"
              onClick={toggleCoaching}
              disabled={!cameraReady}
              className={`ml-auto py-2 text-sm ${isCoaching ? 'pill-outline' : 'pill-dark'}`}
            >
              {isCoaching ? (
                <>
                  <Square className="h-3.5 w-3.5" fill="currentColor" /> stop coaching
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" fill="currentColor" /> start coaching
                </>
              )}
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            {cameraOn ? (
              <CameraFeed
                videoRef={videoRef}
                isCoaching={isCoaching}
                onReadyChange={onReadyChange}
                onDistanceChange={onDistanceChange}
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-stage p-6 text-center">
                <Camera className="h-7 w-7 text-white/60" strokeWidth={1.75} aria-hidden="true" />
                <p className="max-w-xs text-sm text-white/70">
                  Your camera stays off until you turn it on.
                </p>
                <button
                  type="button"
                  onClick={() => setCameraOn(true)}
                  className="pill border-white bg-white text-ink"
                >
                  turn on camera
                </button>
              </div>
            )}

            <FeedbackPanel feedback={feedback} isCoaching={isCoaching} cameraReady={cameraReady} />
          </div>
        </div>
      </div>
    </section>
  );
}
