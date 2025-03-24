export type Task = {
  id: number;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  date: Date;
  groupId: number;
  category: string;
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