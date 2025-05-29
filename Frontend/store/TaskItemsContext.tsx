import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Task, TaskItem, TaskModel } from "../types/Task";
import { getUserTodos } from "../hooks/useApi";
import { useGroupsContext } from "./GroupsContext";

type TaskItemsContextType = {
  tasks: Task[];
  taskItems: TaskItem[];
  syncTaskItems: () => Promise<void>;
};

const TaskItemsContext = createContext<TaskItemsContextType | undefined>(undefined);

export const TaskItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { groups } = useGroupsContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const todos: TaskModel[] = await getUserTodos();
      const mappedTasks: Task[] = todos.map((taskModel) => ({
        id: taskModel.id,
        title: taskModel.title,
        description: taskModel.description,
        priority: taskModel.priority >= 1 && taskModel.priority <= 3 ? taskModel.priority : 1,
        date: new Date(taskModel.created_at),
        isCompleted: taskModel.is_completed,
        groupId: taskModel.group_id,
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const newTaskItems: TaskItem[] = tasks.map((task) => {
      const group = groups.find((g) => g.id === task.groupId);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        groupId: task.groupId,
        groupName: task.groupId == null ? 'Personal' : group ? group.name : "Nieznana grupa",
        isCompleted: task.isCompleted,
      };
    });
    setTaskItems(newTaskItems);
  }, [tasks, groups]);

  return (
    <TaskItemsContext.Provider value={{ tasks, taskItems, syncTaskItems: loadTasks }}>
      {children}
    </TaskItemsContext.Provider>
  );
};

export const useTaskItemsContext = () => {
  const context = useContext(TaskItemsContext);
  if (!context) {
    throw new Error("useTaskItemsContext must be used within a TaskItemsProvider");
  }
  return context;
};