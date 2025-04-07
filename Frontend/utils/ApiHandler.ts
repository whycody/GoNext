import * as SecureStore from "expo-secure-store";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

class ApiHandler {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:8000';
    (async () => {
      await this.loadToken();
    })();
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync('authToken', token);
  }

  async loadToken(): Promise<void> {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      this.token = token;
    }
  }

  async apiCall<T>(options: { method: string; url: string; data?: object | string }): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response: AxiosResponse<T> = await axios({
        method: options.method,
        url: `${this.baseURL}${options.url}`,
        headers,
        data: options.data,
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Nieautoryzowany – token wygasł lub jest nieprawidłowy.');
      }

      throw new Error(`API error: ${error.response?.status || error.message}`);
    }
  }
}

export default ApiHandler;