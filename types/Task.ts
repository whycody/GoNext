export type Task = {
  id: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  date: Date;
  groupId: string;
  category: string;
  isCompleted: boolean;
}

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  groupName: string;
};