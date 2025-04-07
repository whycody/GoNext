import ApiHandler from "../utils/ApiHandler";


export const loginToApp = async (email: string, password: string): Promise<void> => {
  try {
    const api = new ApiHandler();
    const res = await api.apiCall({
      method: 'POST',
      url: '/login/',
      data: { email, password }
    });
    // await setToken(res.token);
    return res;
  } catch (e) {
    console.error(e);
  }
}