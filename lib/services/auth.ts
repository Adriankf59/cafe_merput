import { User } from '@/lib/types';

interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

interface AuthService {
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkSession: () => Promise<User | null>;
  getCurrentUser: () => Promise<User | null>;
}

const AUTH_TOKEN_KEY = 'cafe_merah_putih_token';
const AUTH_USER_KEY = 'cafe_merah_putih_user';

// Helper to get stored token
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Helper to get stored user
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
      };
    }
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
  }
  return null;
}

// Helper to store auth data
function storeAuthData(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

// Helper to clear auth data
function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export const authService: AuthService = {
  /**
   * Authenticate user with email and password
   * Requirements: 2.1 - Valid credentials authentication via API
   */
  login: async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Email atau password salah',
        };
      }

      // Map API response to User type
      const user: User = {
        id: data.data.user.user_id,
        name: data.data.user.username,
        email: data.data.user.email,
        phone: data.data.user.phone || '',
        role: data.data.user.nama_role || data.data.user.role_name || data.data.user.role,
        status: data.data.user.status,
        createdAt: data.data.user.created_at ? new Date(data.data.user.created_at) : new Date(),
      };

      // Store token and user data
      storeAuthData(data.data.token, user);

      return {
        success: true,
        user,
        token: data.data.token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      };
    }
  },

  /**
   * Logout user and clear session
   * Requirements: 2.3 - End session on logout via API
   */
  logout: async (): Promise<void> => {
    try {
      const token = getStoredToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      clearAuthData();
    }
  },

  /**
   * Check if there's an existing session by verifying token with API
   * Requirements: 2.4 - Verify token and get current user
   */
  checkSession: async (): Promise<User | null> => {
    const token = getStoredToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Token invalid or expired, clear storage
        clearAuthData();
        return null;
      }

      // Map API response to User type
      const user: User = {
        id: data.data.user_id,
        name: data.data.username,
        email: data.data.email,
        phone: data.data.phone || '',
        role: data.data.role_name || data.data.role,
        status: data.data.status,
        createdAt: new Date(data.data.created_at),
      };

      // Update stored user data
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Check session error:', error);
      // On network error, return cached user if available
      return getStoredUser();
    }
  },

  /**
   * Get current authenticated user (from cache or API)
   */
  getCurrentUser: async (): Promise<User | null> => {
    // First try to get from cache
    const cachedUser = getStoredUser();
    if (cachedUser) {
      return cachedUser;
    }
    // If no cached user, check session with API
    return authService.checkSession();
  },
};

// Export helper to get token for API calls
export function getAuthToken(): string | null {
  return getStoredToken();
}

// Export helper to check if user is authenticated
export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}
