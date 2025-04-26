import { apiCall } from "../utils/ApiHandler";

export const loginToApp = async (username: string, password: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/login/',
      data: { username, password, remember_me: true }
    });
  } catch (e) {
    return null;
  }
}

export const logoutFromApp = async (refreshToken: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/token/logout/',
      data: { refresh_token: refreshToken, device_id: 'test-device-id-6ba7b810-9dad-11d1-80b4-00c04fd430c8' }
    });
  } catch (e) {
    return null;
  }
}

export const getUserTodos = async () => {
  try {
    return await apiCall({
      method: 'GET',
      url: '/todos/',
    });
  } catch (e) {
    return null;
  }
}