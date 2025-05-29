import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Alert, Text } from 'react-native';
import { getRefreshToken, loadToken, removeTokens, setAccessToken, setRefreshToken } from './ApiHandler';
import LoginScreen from "../screens/LoginScreen";
import { getInfo, loginToApp, logoutFromApp, registerToApp } from "../hooks/useApi";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, useTheme } from "@react-navigation/native";
import RegisterScreen from "../screens/RegisterScreen";

type User = {
  username: string;
  user_id: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => Promise<boolean>;
}

const Stack = createNativeStackNavigator();

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const nav = useNavigation();
  const { colors } = useTheme();

  const checkAuth = async () => {
    try {
      await loadToken();
      const res = await getInfo();
      if (res) {
        setUser(res);
        setIsAuthenticated(true);
      } else setIsAuthenticated(false);
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    setAuthError(null);
    const res = await loginToApp(username, password, rememberMe);
    if (res) {
      await setTokens(res.access, res.refresh);
      await checkAuth();
    } else {
      setIsAuthenticated(false);
      setAuthError('Invalid username or password');
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setRegisterError(null);
    const res = await registerToApp(username, email, password);
    if (res) {
      Alert.alert('Success', 'Registration successful. You can now log in.');
      nav.navigate('Login');
    } else {
      setRegisterError('Registration failed. Please try again.');
    }
  }

  const logout = async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;
    const res = await logoutFromApp(refreshToken);
    console.log(res);
    if (res) {
      await removeTokens();
      setIsAuthenticated(false);
      return true;
    }
    return false;
  }

  const setTokens = async (accessToken: string, refreshToken: string) => {
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) return <Text>Ładowanie...</Text>;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout }}>
      {isAuthenticated ? children :
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.card } }}
        >
          <Stack.Screen name="Login">
            {() => <LoginScreen login={login} authError={authError}/>}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {() => <RegisterScreen register={register} registerError={registerError}/>}
          </Stack.Screen>
        </Stack.Navigator>

      }
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;