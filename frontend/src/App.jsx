import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import { ConfirmProvider } from "./context/ConfirmContext";

function App() {
  return (
    <ConfirmProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#1e293b',
            fontWeight: 'bold',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }} 
      />
      <AppRouter />
    </ConfirmProvider>
  );
}

export default App;