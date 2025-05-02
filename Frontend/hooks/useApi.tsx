import { apiCall } from "../utils/ApiHandler";
import { Task, TaskItem, TaskModel } from "../types/Task";
import TaskView from "../components/TaskView";
import { GroupModel } from "../types/Group";

// Authentication

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

// Tasks handling

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

export const getUserTodo = async (id: number): Promise<TaskModel | null> => {
  try {
    return await apiCall({
      method: 'GET',
      url: `/todos/${id}/`,
    });
  } catch (e) {
    console.error(`GET /todos/${id}/`, e);
    return null;
  }
}

export const updateUserTodo = async (task: Task) => {
  try {
    return await apiCall({
      method: 'PUT',
      url: `/todos/${task.id}/`,
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        is_completed: task.isCompleted
      },
    });
  } catch (e) {
    console.error(`PUT /todos/${task.id}/`, e);
    return [];
  }
}

export const addUserTodo = async (task: Task) => {
  try {
    return await apiCall({
      method: 'POST',
      url: `/todos/`,
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        is_completed: task.isCompleted,
        group: task.groupId
      },
    });
  } catch (e) {
    console.error(`POST /todos/`, e);
    return [];
  }
}

// Groups handling

export const getUserGroups = async (): Promise<GroupModel[]> => {
  try {
    return await apiCall({
      method: 'GET',
      url: '/groups/',
    });
  } catch (e) {
    console.error('/groups/', e);
    return [];
  }
}
export const generateGroupInvitationLink = async (groupId: number) => {
  try {
    return await apiCall({
      method: 'POST',
      url: `/groups/${groupId}/generate-invitation-link/`, 
    });
  } catch (e) {
    console.error(`/groups/${groupId}/generate-invitation-link/`, e); 
    return null;
  }
};
