import { useCallback, useRef, useState } from 'react';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Stats from './components/Stats.jsx';
import Journey from './components/Journey.jsx';
import Products from './components/Products.jsx';
import FounderNote from './components/FounderNote.jsx';
import Faq from './components/Faq.jsx';
import Closing from './components/Closing.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
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
        <Stats />
        <Journey />
        <Products />
        <FounderNote showToast={showToast} />
        <Faq />
        <Closing />
      </main>
      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
