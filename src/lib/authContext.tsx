import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: 'admin' | 'customer';
};

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  status: AuthStatus;
  user: AuthUser | null;
};

type AuthProviderProps = {
  children: ReactNode;
};

type AuthResponse = {
  ok: boolean;
  message?: string;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'same-origin',
        });
        const data = (await response.json()) as AuthResponse;

        if (isMounted) {
          setUser(data.user);
          setStatus(data.user ? 'authenticated' : 'anonymous');
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setStatus('anonymous');
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      login: async (email, password) => {
        const data = await authRequest('/api/auth/login', {email, password});
        setUser(data.user);
        setStatus(data.user ? 'authenticated' : 'anonymous');
      },
      logout: async () => {
        await authRequest('/api/auth/logout', {});
        setUser(null);
        setStatus('anonymous');
      },
      signup: async (name, email, password) => {
        const data = await authRequest('/api/auth/signup', {name, email, password});
        setUser(data.user);
        setStatus(data.user ? 'authenticated' : 'anonymous');
      },
      status,
      user,
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

async function authRequest(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({
    ok: false,
    message: 'The server returned an unreadable response.',
    user: null,
  }))) as AuthResponse;

  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed.');
  }

  return data;
}
