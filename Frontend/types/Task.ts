export type Task = {
  id: number;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  date: Date;
  groupId: number;
  isCompleted: boolean;
}

export type TaskItem = {
  id: number;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  groupId: string;
  groupName: string;
  isCompleted: boolean;
};

export type TaskModel = {
  id: number;
  title: string;
  created_at: string;
  description: string;
  group_id: string;
  group_name: string;
  is_completed: boolean;
  priority: 1 | 2 | 3;
  user_id: string;
}