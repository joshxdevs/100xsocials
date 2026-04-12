import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { getUserFromToken, setSession, clearSession, type AuthUser } from '../lib/auth';
import api from '../lib/api';

interface VerifyOtpParams {
  email: string;
  otp: string;
  role: 'MEMBER' | 'RECRUITER';
  companyName?: string;
  website?: string;
}

interface SendOtpParams {
  email: string;
  role: 'MEMBER' | 'RECRUITER';
  companyName?: string;
  website?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  sendOtp: (params: SendOtpParams) => Promise<void>;
  verifyOtp: (params: VerifyOtpParams) => Promise<{ isNewUser: boolean; hasProfile: boolean; user: AuthUser }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getUserFromToken());
  const [loading, setLoading] = useState(false);

  const login = (token: string) => {
    setSession(token);
    setUser(getUserFromToken());
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const sendOtp = async ({ email, role, companyName, website }: SendOtpParams) => {
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email, role, companyName, website });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async ({
    email,
    otp,
    role,
    companyName,
    website,
  }: VerifyOtpParams): Promise<{ isNewUser: boolean; hasProfile: boolean; user: AuthUser }> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp, role, companyName, website });
      login(res.data.token);
      const userData = getUserFromToken()!;
      return { isNewUser: res.data.isNewUser, hasProfile: res.data.hasProfile, user: userData };
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login,
    logout,
    sendOtp,
    verifyOtp,
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
