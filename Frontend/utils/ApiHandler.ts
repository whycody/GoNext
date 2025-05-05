import * as SecureStore from "expo-secure-store";
import axios, { AxiosResponse } from "axios";
import { refreshUserAccessToken } from "../hooks/useApi";

let accessToken: string | null = null;
let refreshToken: string | null = null;

const baseURL = process.env["API_BASE_URL"] || 'http://localhost:8000';

export const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('refreshToken');
};

export const setAccessToken = async (token: string): Promise<void> => {
  accessToken = token;
  await SecureStore.setItemAsync('accessToken', token);
};

export const setRefreshToken = async (token: string): Promise<void> => {
  refreshToken = token;
  await SecureStore.setItemAsync('refreshToken', token);
};

export const removeTokens = async (): Promise<void> => {
  accessToken = null;
  refreshToken = null;
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

export const loadToken = async (): Promise<void> => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    accessToken = token;
  }
};

const refreshAccessToken = async (options: any, header: boolean = false) => {
  refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error('Brak refresh token.');
  }

  try {
    const response = await refreshUserAccessToken(refreshToken);
    if (response?.access_token) {
      await setAccessToken(response?.access_token);
      await apiCall(options, header, true);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Nie można odświeżyć tokena.');
  }
};

export const apiCall = async <T>(
  options: { method: string; url: string; data?: object | string }, header: boolean = true, refreshed: boolean = false): Promise<T> => {

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  console.log(options.method, options.url, accessToken);

  if (accessToken && header) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    console.log(options.method, `${baseURL}${options.url}`, headers, options.data, 2000);
    const response: AxiosResponse<T> = await axios({
      method: options.method,
      url: `${baseURL}${options.url}`,
      headers,
      data: options.data,
      timeout: 2000,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (refreshed)
        throw new Error('Nieautoryzowany – accessToken wygasł lub jest nieprawidłowy.');
      else {
        console.log('refreshuje')
        await refreshAccessToken(options);
      }
    }

    throw new Error(`API error: ${error.response?.status || error.message}`);
  }
};