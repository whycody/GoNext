import { useEffect, useState, useCallback } from "react";
import { Task, TaskModel } from "../types/Task";
import { getUserTodos } from "./useApi";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const todos: TaskModel[] = await getUserTodos();
      const mappedTasks: Task[] = todos.map((taskModel) => ({
        id: taskModel.id,
        title: taskModel.title,
        description: taskModel.description,
        priority: (taskModel.priority >= 1 && taskModel.priority <= 3 ? taskModel.priority : 1) as 1 | 2 | 3,
        date: new Date(taskModel.due_date),
        isCompleted: taskModel.is_completed,
        groupId: 0,
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return { tasks, loadTasks };
};