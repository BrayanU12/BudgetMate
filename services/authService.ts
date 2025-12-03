
import { User } from '../types';

const USERS_KEY = 'budgetMate_users';
const SESSION_KEY = 'budgetMate_session';

export const authService = {
  register: (name: string, email: string, password: string): User | { error: string } => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if email exists
    if (users.find((u: any) => u.email === email)) {
      return { error: 'El correo electrónico ya está registrado.' };
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, never store plain text passwords!
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: (email: string, password: string): User | { error: string } => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      const { password, ...safeUser } = user; // Exclude password from session
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return safeUser;
    }

    return { error: 'Credenciales inválidas.' };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};
