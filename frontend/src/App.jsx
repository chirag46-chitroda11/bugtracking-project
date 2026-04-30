import { useState, useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import { ConfirmProvider } from "./context/ConfirmContext";
import FixifyPreloader from "./components/loader/FixifyPreloader";

function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical', 
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ConfirmProvider>
      {/* Premium brand preloader — overlays via position:fixed */}
      {!preloaderDone && (
        <FixifyPreloader onComplete={() => setPreloaderDone(true)} />
      )}
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '14px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 12px 35px rgba(0,0,0,0.08)',
            padding: '12px 16px',
            maxWidth: '380px',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: { borderLeft: '4px solid #10b981' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { borderLeft: '4px solid #ef4444' },
          },
        }}
      />
      <AppRouter />
    </ConfirmProvider>
  );
}

export default App;