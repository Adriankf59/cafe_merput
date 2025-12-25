import { User } from '@/lib/types';
import { mockUsers } from '@/lib/data/mockData';

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface AuthService {
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  checkSession: () => User | null;
  getCurrentUser: () => User | null;
}

const AUTH_STORAGE_KEY = 'cafe_merah_putih_auth';

export const authService: AuthService = {
  /**
   * Authenticate user with email and password
   * Requirements: 1.2 - Valid credentials authentication
   */
  login: async (email: string, password: string): Promise<LoginResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find user by email
    const user = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return {
        success: false,
        error: 'Email atau password salah',
      };
    }

    // Check if user is active
    if (user.status === 'Nonaktif') {
      return {
        success: false,
        error: 'Akun Anda tidak aktif. Hubungi manager.',
      };
    }

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword as User,
    };
  },

  /**
   * Logout user and clear session
   * Requirements: 1.4 - End session on logout
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  /**
   * Check if there's an existing session
   * Requirements: 1.5 - Store authenticated user session
   */
  checkSession: (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        return JSON.parse(storedAuth) as User;
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return null;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: (): User | null => {
    return authService.checkSession();
  },
};
