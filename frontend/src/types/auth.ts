// src/types/auth.ts

export interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export interface TokenState {
  token: string;
  setAccessToken: (token: string) => void;
  csrfToken: string;
  setCsrfToken: (token: string) => void;
}