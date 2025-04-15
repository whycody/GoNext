import * as SecureStore from "expo-secure-store";
import axios, { AxiosResponse } from "axios";

let accessToken: string | null = null;
let refreshToken: string | null = null;

const baseURL = process.env.API_BASE_URL || 'http://localhost:8000';

export const setAccessToken = async (token: string): Promise<void> => {
  accessToken = token;
  await SecureStore.setItemAsync('accessToken', token);
};

export const setRefreshToken = async (token: string): Promise<void> => {
  refreshToken = token;
  await SecureStore.setItemAsync('refreshToken', token);
};

export const loadToken = async (): Promise<void> => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    accessToken = token;
  }
};

export const apiCall = async <T>(options: { method: string; url: string; data?: object | string }): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  console.log(options.method, options.url, accessToken);

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
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
      throw new Error('Nieautoryzowany – accessToken wygasł lub jest nieprawidłowy.');
    }

    throw new Error(`API error: ${error.response?.status || error.message}`);
  }
};