import { apiCall } from "../utils/ApiHandler";
import { TaskModel } from "../types/Task";

export const loginToApp = async (username: string, password: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/login/',
      data: { username, password, remember_me: true }
    }, false);
  } catch (e) {
    console.error('/login/', e);
    return null;
  }
}

export const registerToApp = async (username: string, email: string, password: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/register/',
      data: { username, email, password }
    }, false);
  } catch (e) {
    console.error('/register/', e);
    return null;
  }
}

export const refreshUserAccessToken = async (refreshToken: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/token/refresh/',
      data: { refresh_token: refreshToken, device_id: 'test-device-id-6ba7b810-9dad-11d1-80b4-00c04fd430c8' }
    }, false, true);
  } catch (e) {
    console.error('/token/refresh/', e);
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
    console.error('/token/logout/', e);
    return null;
  }
}

export const getUserTodos = async (): Promise<TaskModel[]> => {
  try {
    return await apiCall({
      method: 'GET',
      url: '/todos/',
    });
  } catch (e) {
    console.error('/todos/', e);
    return [];
  }
}