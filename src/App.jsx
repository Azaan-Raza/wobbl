import { useCallback, useRef, useState } from 'react';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Demo from './components/Demo.jsx';
import FounderNote from './components/FounderNote.jsx';
import Faq from './components/Faq.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import { SPORTS } from './utils/sports.js';

export default function App() {
  const [selectedSport, setSelectedSport] = useState('Basketball');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Nav />

      <main id="main">
        <Hero />
        <HowItWorks />
        <Demo
          sports={SPORTS}
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
          showToast={showToast}
        />
        <FounderNote showToast={showToast} />
        <Faq />
      </main>

      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
