import { apiCall } from "../utils/ApiHandler";

export const loginToApp = async (username: string, password: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/login/',
      data: { username, password }
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