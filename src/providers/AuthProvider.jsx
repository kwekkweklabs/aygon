// authContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@heroui/react';

const AuthContext = createContext({
  authenticated: false,
  accessToken: null,
  login: () => { },
  logout: () => { },
  user: null,
  ready: false
});

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();
  const {
    authenticated,
    getAccessToken,
    login,
    logout,
    user,
    ready,
  } = usePrivy();

  useEffect(() => {
    if (ready) {
      console.log('Authenticated:', authenticated);
      // If user is not authenticated and trying to access protected routes
      if (!authenticated && window.location.pathname.startsWith('/play')) {
        navigate('/login');
      }

      // If user is authenticated and on login page, redirect to play
      if (authenticated && window.location.pathname === '/login') {
        navigate('/play');
      }

      // Get and store access token when authenticated
      if (authenticated) {
        const fetchToken = async () => {
          const token = await getAccessToken();
          setAccessToken(token);
        };
        fetchToken();
      }
    }
  }, [authenticated, ready, navigate, getAccessToken]);

  const value = {
    authenticated,
    accessToken,
    login,
    logout,
    user,
    ready
  };

  return (

    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Example usage in a protected route component
export function ProtectedRoute({ children }) {
  const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true';

  const { authenticated, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !authenticated && !isAuthDisabled) {
      navigate('/login');
    }
  }, [authenticated, ready, navigate]);

  // If auth is disabled via env var, render children without protection
  if (import.meta.env.VITE_DISABLE_AUTH === "true") {
    return children;
  }

  if (!ready) {
    return (
      <div className='w-screen h-screen flex flex-col items-center justify-center'>
        <Spinner size='lg' />
        <div>
          <p className='text-lg animate-pulse mt-2'>Please wait</p>
        </div>
      </div>
    );
  }

  return authenticated ? children : null;
}