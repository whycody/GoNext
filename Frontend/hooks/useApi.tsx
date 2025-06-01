import { apiCall } from "../utils/ApiHandler";
import { Task, TaskModel } from "../types/Task";
import { Group, GroupModel } from "../types/Group";
import * as Application from 'expo-application';

// Authentication

const getDeviceId = () => {
  return Application.getAndroidId() || Application.nativeApplicationVersion || '';
};

export const loginToApp = async (username: string, password: string, rememberMe: boolean) => {
  try {
    const deviceId = getDeviceId();
    return await apiCall({
      method: 'POST',
      url: '/login/',
      data: { username, password, remember_me: rememberMe, device_id: deviceId }
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
    const deviceId = getDeviceId();
    return await apiCall({
      method: 'POST',
      url: '/token/refresh/',
      data: { refresh_token: refreshToken, device_id: deviceId }
    }, false, true);
  } catch (e) {
    console.error('/token/refresh/', e);
    return null;
  }
}

export const logoutFromApp = async (refreshToken: string) => {
  try {
    const deviceId = getDeviceId();
    return await apiCall({
      method: 'POST',
      url: '/token/logout/',
      data: { refresh_token: refreshToken, device_id: deviceId }
    });
  } catch (e) {
    console.error('/token/logout/', e);
    return null;
  }
}

export const changeUserPassword = async (
  oldPassword: string,
  newPassword1: string,
  newPassword2: string,
  currentDeviceId?: string 
) => {
  try {
    const deviceId = getDeviceId();
    const data: any = {
      old_password: oldPassword,
      new_password1: newPassword1,
      new_password2: newPassword2,
      current_device_id: deviceId,
    };
    return await apiCall({
      method: 'POST',
      url: '/password/change/', 
      data: data,               
    });
  } catch (e) {
    console.error('/password/change/', e);
    return null;
  }
};

export const getInfo = async () => {
  try {
    return await apiCall({
      method: 'GET',
      url: '/info/',
    });
  } catch (e) {
    console.error('/info/', e);
    return [];
  }
}

export async function promoteUserToAdmin(groupId: number, userId: number) {
  try {
    return await apiCall({
      method: 'POST',
      url: `/groups/${groupId}/admins/${userId}/`,
      data: {},
    });
  } catch (e) {
    console.error(`/groups/${groupId}/admins/${userId}/`, e);
    throw e;
  }
}

export async function demoteUserFromAdmin(groupId: number, userId: number) {
  try {
    return await apiCall({
      method: 'DELETE',
      url: `/groups/${groupId}/admins/${userId}/`,
    });
  } catch (e) {
    console.error(`/groups/${groupId}/admins/${userId}/`, e);
    throw e;
  }
}

export async function removeUserFromGroup(groupId: number, userId: number) {
  try {
    return await apiCall({
      method: 'DELETE',
      url: `/groups/${groupId}/members/${userId}/`,
    });
  } catch (e) {
    console.error(`/groups/${groupId}/members/${userId}/`, e);
    throw e;
  }
}

export const acceptGroupInvitation = async (token: string) => {
  try {
    return await apiCall({
      method: 'POST',
      url: `/invitations/${token}/accept`,
    });
  } catch (e) {
    console.error(`/invitations/${token}/accept`, e);
    throw e;
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
        group: task.groupId
      },
    });
  } catch (e) {
    console.error(`PUT /todos/${task.id}/`, e);
    return [];
  }
}

export const addUserTodo = async (task: Task) => {
  try {
    console.log('Dodaje nowego taska!')
    return await apiCall({
      method: 'POST',
      url: `/todos/`,
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        is_completed: task.isCompleted,
        group_id: task.groupId
      },
    });
  } catch (e) {
    console.error(`POST /todos/`, e);
    return [];
  }
}

// Groups handling

export const getUserGroups = async (): Promise<Group[]> => {
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

export const createGroupInvitation = async (
  groupId: number,
  email: string,
  expirationDays: number = 7,
  maxUses: number = 1
) => {
  try {
    return await apiCall({
      method: 'POST',
      url: '/invitations/create/',
      data: {
        group_id: groupId,
        email,
        expiration_days: expirationDays,
        max_uses: maxUses,
      },
    });
  } catch (e) {
    console.error('/invitations/create/', e);
    return null;
  }
};

export const createGroup = async (
  name: string,
  icon?: string,
  color?: string
): Promise<GroupModel | null> => {
  try {
    const data: { name: string; icon?: string; color?: string } = { name };
    if (icon !== undefined) {
      data.icon = icon;
    }
    if (color !== undefined) {
      data.color = color;
    }

    return await apiCall({
      method: 'POST',
      url: '/groups/create/',
      data: data,
    });
  } catch (e) {
    console.error('POST /groups/create/', e);
    return null;
  }
}

export const updateGroup = async (group: Group) => {
  try {
    return await apiCall({
      method: 'PUT',
      url: `/groups/${group.id}/`,
      data: {
        name: group.name,
        icon: group.icon,
        color: group.color,
      },
    });
  } catch (e) {
    console.error(`PUT /groups/${group.id}/`, e);
    return [];
  }
}

export const removeGroup = async (groupId: number) => {
  try {
    return await apiCall({
      method: 'DELETE',
      url: `/groups/${groupId}/`,
    });
  } catch (e) {
    console.error(`DELETE /groups/${groupId}`, e);
    throw e;
  }
};


export const leaveGroup = async (groupId: number) => {
  try {
    return await apiCall({
      method: 'DELETE',
      url: `/groups/${groupId}/leave/`,
    });
  } catch (e) {
    console.error(`DELETE /groups/${groupId}/leave/`, e);
    throw e;
  }
};

export const toggleTodoCompleted = async (id: number, currentValue: boolean) => {
  try {
    return await apiCall({
      method: 'PATCH',
      url: `/todos/${id}/`,
      data: {
        is_completed: !currentValue
      },
    });
  } catch (e) {
    console.error(`PATCH /todos/${id}/, `, e);
    return null;
  }
}