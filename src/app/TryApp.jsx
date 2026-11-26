import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { PRODUCTS, findDrill } from '../drills/index.js';
import { saveSession, sessionsFor } from '../engine/history.js';
import { SessionRunner } from './runner.js';
import DrillPicker from './DrillPicker.jsx';
import SetupPanel from './SetupPanel.jsx';
import LivePanel from './LivePanel.jsx';
import Report from './Report.jsx';
import Logo from '../components/Logo.jsx';

const defaultsFor = (drill) =>
  Object.fromEntries((drill.options || []).map((o) => [o.id, o.default]));

// The drill can come from the link: /try/#piano opens the piano drill.
function drillFromHash() {
  const id = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  return findDrill(id) || PRODUCTS[0].drills[0];
}

export default function TryApp() {
  const [drill, setDrill] = useState(drillFromHash);
  const [settings, setSettings] = useState(() => defaultsFor(drillFromHash()));
  const [phase, setPhase] = useState('setup'); // setup | live | report
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [feed, setFeed] = useState([]);
  const [snap, setSnap] = useState(null);
  const [lastRep, setLastRep] = useState(null);
  const [calibration, setCalibration] = useState(null);
  const [summary, setSummary] = useState(null);
  const [muted, setMuted] = useState(false);
  const [history, setHistory] = useState(() => sessionsFor(drillFromHash().id));

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const runnerRef = useRef(null);

  useEffect(() => {
    const onHash = () => {
      if (runnerRef.current) return;
      const d = drillFromHash();
      setDrill(d);
      setSettings(defaultsFor(d));
      setHistory(sessionsFor(d.id));
      setPhase('setup');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => () => runnerRef.current?.stop(), []);

  const pickDrill = (d) => {
    if (window.location.hash.slice(1) !== d.id) window.location.hash = d.id;
    setDrill(d);
    setSettings(defaultsFor(d));
    setHistory(sessionsFor(d.id));
    setError(null);
    setPhase('setup');
  };

  const startedAt = useRef(0);

  const onEvent = useCallback((e) => {
    // Time into the session, like 1:07.
    const secs = Math.max(0, Math.floor((performance.now() - startedAt.current) / 1000));
    const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    const add = (item) => setFeed((prev) => [{ id: `${Date.now()}-${Math.random()}`, time, ...item }, ...prev].slice(0, 40));
    switch (e.type) {
      case 'status':
        setStatus(e.text);
        break;
      case 'error':
        if (runnerRef.current?.running) add({ kind: 'error', text: e.text });
        else setError(e.text);
        break;
      case 'hint':
        add({ kind: 'hint', text: e.text });
        break;
      case 'cue':
        add({ kind: 'cue', text: e.text, source: e.source });
        break;
      case 'praise':
        add({ kind: 'praise', text: e.text });
        break;
      case 'fatigue':
        add({ kind: 'rest', text: e.text });
        break;
      case 'set':
        add({ kind: 'note', text: `Set ${e.index} started after your rest.` });
        break;
      case 'rep':
        setLastRep(e);
        break;
      case 'calibrating':
        setCalibration(e.progress);
        break;
      case 'calibrated':
        setCalibration(null);
        add({ kind: 'note', text: 'Baseline saved. Coaching starts now.' });
        break;
      default:
    }
  }, []);

  const start = async () => {
    setError(null);
    setFeed([]);
    setSnap(null);
    setLastRep(null);
    setCalibration(null);
    setPhase('live');
    // Wait a frame so the <video> and <canvas> exist.
    await new Promise((r) => requestAnimationFrame(r));
    const runner = new SessionRunner({
      drill,
      settings,
      video: videoRef.current,
      canvas: canvasRef.current,
      onEvent,
      onTick: setSnap,
    });
    runner.setMuted(muted);
    runnerRef.current = runner;
    startedAt.current = performance.now();
    const ok = await runner.start();
    if (!ok) {
      runnerRef.current = null;
      setStatus(null);
      setPhase('setup');
    }
  };

  const stop = () => {
    const result = runnerRef.current?.stop();
    runnerRef.current = null;
    setStatus(null);
    setHistory(saveSession(result).filter((s) => s.drillId === drill.id));
    setSummary(result);
    setPhase('report');
  };

  const toggleMute = () => {
    setMuted((m) => {
      runnerRef.current?.setMuted(!m);
      return !m;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F9] text-ink">
      <header className="border-b border-rule bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-5 sm:px-8">
          <a href="../" aria-label="wobbl home">
            <Logo size={22} />
          </a>
          <div className="flex items-center gap-4">
            <a href="../" className="hidden text-sm text-muted hover:text-ink sm:inline">
              Back to the site
            </a>
            <button type="button" onClick={toggleMute} aria-pressed={!muted} className="btn-secondary btn-sm">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? 'Voice off' : 'Voice on'}
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
        <DrillPicker products={PRODUCTS} current={drill} onPick={pickDrill} locked={phase === 'live'} />

        <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
          {phase === 'setup' && (
            <SetupPanel
              drill={drill}
              settings={settings}
              onSettings={setSettings}
              onStart={start}
              error={error}
              history={history}
            />
          )}
          {phase === 'live' && (
            <LivePanel
              drill={drill}
              videoRef={videoRef}
              canvasRef={canvasRef}
              status={status}
              snap={snap}
              lastRep={lastRep}
              feed={feed}
              calibration={calibration}
              onStop={stop}
            />
          )}
          {phase === 'report' && summary && (
            <Report drill={drill} summary={summary} history={history} onAgain={start} onBack={() => setPhase('setup')} />
          )}
        </main>
      </div>
    </div>
  );
}
