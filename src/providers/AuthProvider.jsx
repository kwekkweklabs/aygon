import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/react";

const AuthContext = createContext({
  authenticated: false,
  accessToken: null,
  login: () => {},
  logout: () => {},
  user: null,
  ready: false,
  me: null,
  isLoadingMe: true,
});

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [me, setMe] = useState(null);
  const [isLoadingMe, setIsLoadingMe] = useState(true);
  const navigate = useNavigate();

  const { authenticated, getAccessToken, login, logout, user, ready } =
    usePrivy();

  const fetchMeData = async () => {
    try {
      setIsLoadingMe(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            email: user?.email?.address,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ME data");
      }

      const data = await response.json();
      setMe(data);
    } catch (error) {
      console.error("Error fetching ME data:", error);
      // Optionally handle error state here
    } finally {
      setIsLoadingMe(false);
    }
  };

  useEffect(() => {
    if (ready) {
      console.log("Authenticated:", authenticated);

      // If user is not authenticated and trying to access protected routes
      if (!authenticated && window.location.pathname.startsWith("/play")) {
        navigate("/login");
      }

      // If user is authenticated and on login page, redirect to play
      if (authenticated && window.location.pathname === "/login") {
        navigate("/play");
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

  // Effect to fetch ME data when we have both user and accessToken
  useEffect(() => {
    if (ready && authenticated && accessToken && user?.email) {
      fetchMeData();
    }
  }, [ready, authenticated, accessToken, user?.email]);

  const value = {
    authenticated,
    accessToken,
    login,
    logout,
    user,
    ready,
    me,
    isLoadingMe,
  };

  // Show loading spinner while fetching ME data if authenticated
  if (ready && authenticated && isLoadingMe) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="animate-pulse mt-4">Loading your data...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }) {
  const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === "true";

  const { authenticated, ready, isLoadingMe } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !authenticated && !isAuthDisabled) {
      navigate("/login");
    }
  }, [authenticated, ready, navigate]);

  // If auth is disabled via env var, render children without protection
  if (import.meta.env.VITE_DISABLE_AUTH === "true") {
    return children;
  }

  if (!ready || (authenticated && isLoadingMe)) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="animate-pulse mt-4">Please wait...</p>
      </div>
    );
  }

  return authenticated ? children : null;
}
