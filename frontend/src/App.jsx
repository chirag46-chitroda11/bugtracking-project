import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import { ConfirmProvider } from "./context/ConfirmContext";

function App() {
  return (
    <ConfirmProvider>
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