import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Text } from 'react-native';
import { apiCall, loadToken, setAccessToken, setRefreshToken } from './ApiHandler';
import LoginScreen from "../screens/LoginScreen";
import { loginToApp } from "../hooks/useApi";

interface AuthContextType {
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await loadToken();
        await apiCall({ method: 'GET', url: '/user/info' });
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setAuthError(null);
    const res = await loginToApp(username, password);
    if (res) {
      setTokens(res.access, res.refresh);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setAuthError('Invalid username or password');
    }
  }

  const setTokens = (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) return <Text>Ładowanie...</Text>;

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {isAuthenticated ? children : <LoginScreen login={login} authError={authError}/>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;