import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { AUTH_API } from '../client-configuration/home-API';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// -------------------- Types --------------------
export interface LoginCredentials {
  email: string;
  password: string;
  newOne: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  newOne: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  token?: string;
}

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  googleLoginFunc: (data: { email: string; name: string; googleId: string; profilePicture?: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  // `isLoading` is true while the provider validates the session with server
  isLoading: boolean;
}

// -------------------- Context --------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// -------------------- Provider --------------------
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount, check session with server to restore auth state from HttpOnly cookie
  useEffect(() => {
    const checkSession = async () => {
      // Skip session check for public routes
      const publicRoutes = ['/login/token', '/email-verification', '/set-password', '/google-set-password', '/forgot-password'];
      const currentPath = window.location.pathname;
      
      if (publicRoutes.some(route => currentPath.startsWith(route))) {
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`${BASE_URL}/skill-mint/check`, {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.loggedIn) {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        // silent
      }
      finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // -------------------- Service Wrappers --------------------
  const login = async (email: string, password: string) => {
    const res: AuthResponse = await loginUser({ email, password, newOne: false });
    if (res.success) {
      if (res.token) setToken(res.token);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string) => {
    const res: AuthResponse = await signupUser({ name, email, password, newOne: true });
    if (res.success) {
      if (res.token) setToken(res.token);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const googleLoginFunc = async (data: { email: string; name: string; googleId: string; profilePicture?: string }) => {
    const res: AuthResponse = await googleLogin(data);
    if (res.success) {
      if (res.token) setToken(res.token);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Attempt server-side logout to clear cookie
    (async () => {
      try {
        await fetch(`${BASE_URL}/skill-mint/logout`, { method: 'POST', credentials: 'include' });
      } catch (err) {
        // ignore
      }
    })();

    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, login, signup, googleLoginFunc, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// -------------------- Hook --------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// -------------------- Existing Service Functions --------------------
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    credentials.newOne = false;
    const response = await fetch(AUTH_API.LOGIN.url, {
      method: AUTH_API.LOGIN.method,
      headers: AUTH_API.LOGIN.headers,
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();

    if (!response.ok) return { success: false, message: data.message || 'Login failed' };

    return { success: true, data, token: data.token };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Network error occurred' };
  }
};

export const signupUser = async (signupData: SignupData): Promise<AuthResponse> => {
  try {
    signupData.newOne = true;
    const response = await fetch(AUTH_API.SIGNUP.url, {
      method: AUTH_API.SIGNUP.method,
      headers: AUTH_API.SIGNUP.headers,
      credentials: 'include',
      body: JSON.stringify(signupData)
    });
    const data = await response.json();

    if (!response.ok) return { success: false, message: data.message || 'Signup failed' };

    return { success: true, data, token: data.token };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Network error occurred' };
  }
};

export const googleLogin = async (googleUserData: { email: string; name: string; googleId: string; profilePicture?: string }): Promise<AuthResponse> => {
  try {
    const response = await fetch(AUTH_API.GOOGLE_LOGIN.url, {
      method: AUTH_API.GOOGLE_LOGIN.method,
      headers: AUTH_API.GOOGLE_LOGIN.headers,
      credentials: 'include',
      body: JSON.stringify(googleUserData)
    });
    const data = await response.json();

    if (response.status === 429) {
      return { success: false, message: 'Too many requests. This is a free service with rate limits. Please wait a moment and try again.' };
    }

    if (!response.ok) return { success: false, message: data.message || 'Google login failed' };

    return { success: true, data, token: data.token };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Network error occurred' };
  }
};

// -------------------- Session Timeout Helper --------------------
export const initSessionTimeout = (timeoutMs: number = 30 * 60 * 1000) => {
  let timer: number | undefined;

  const logoutAndRedirect = () => {
    window.location.href = '/login';
  };

  const resetTimer = () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      logoutAndRedirect();
    }, timeoutMs) as unknown as number;
  };

  const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
  events.forEach((ev) => window.addEventListener(ev, resetTimer));

  // Start the timer
  resetTimer();

  // Return cleanup
  return () => {
    if (timer) window.clearTimeout(timer);
    events.forEach((ev) => window.removeEventListener(ev, resetTimer));
  };
};