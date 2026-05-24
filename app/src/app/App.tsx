import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from '@/router';
import { UserProvider } from '@/providers/UserContext';
import { AuthProvider } from '@/providers/AuthContext';
import { SplashScreen } from '@/pages/auth/splash/SplashScreen';
import { GlobalLoading } from '@/components/GlobalLoading';

function readDarkMode(): boolean {
  try {
    const stored = localStorage.getItem('app_settings');
    return stored ? JSON.parse(stored).darkMode === true : false;
  } catch {
    return false;
  }
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const apply = () => {
      const dark = readDarkMode();
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    window.addEventListener('storage', apply);
    return () => window.removeEventListener('storage', apply);
  }, []);

  return (
    <AuthProvider>
      <UserProvider>
        <div className="bg-[#101010] w-full h-screen flex justify-center items-center">
          {/* Mobile container */}
          <div id="app-container" className="w-full h-full max-w-[414px] max-h-[100vh] bg-[#1C1A1B] relative sm:shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">
            <GlobalLoading />
            <Toaster
              position="top-center"
              gap={12}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#292526',
                  color: '#FDFDFD',
                  border: '1px solid #3a3637',
                  borderRadius: '14px',
                  fontSize: '13px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  marginTop: '8px',
                },
              }}
              className="!absolute !top-[60px] !z-[10000]"
            />
            {!splashDone ? (
              <SplashScreen onComplete={() => setSplashDone(true)} />
            ) : (
              <RouterProvider router={router} />
            )}
          </div>
        </div>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
