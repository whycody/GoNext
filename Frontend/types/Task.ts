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
  groupName: string;
  isCompleted: boolean;
};

export type TaskModel = {
  id: number;
  title: string;
  created_at: string;
  description: string;
  due_date: string;
  group: string;
  is_completed: boolean;
  priority: number;
  user: string;
}