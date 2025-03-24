import * as SecureStore from 'expo-secure-store';

class ApiHandler {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.data) {
      fetchOptions.body = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
    }

    const response = await fetch(`${this.baseURL}${options.url}`, fetchOptions);

    if (response.status === 401) {
      throw new Error('Nieautoryzowany – token wygasł lub jest nieprawidłowy.');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
}

export default ApiHandler;