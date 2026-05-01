import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthContext';
import { SplashScreen } from './pages/auth/SplashScreen';

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AuthProvider>
      <UserProvider>
        <div className="bg-[#101010] w-full h-screen flex justify-center items-center">
          {/* Mobile container */}
          <div className="w-full h-full max-w-[414px] max-h-[896px] bg-[#1C1A1B] relative overflow-hidden sm:rounded-[44px] sm:shadow-[0_32px_80px_rgba(0,0,0,0.6)] sm:border-[8px] border-[#1a1a1a] flex flex-col">
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
