import { useTasks } from "./useTasks";
import { useGroups } from "./useGroups";
import { useEffect, useState } from "react";
import { TaskItem } from "../types/Task";

export const useTaskItems = () => {
  const groups = useGroups();
  const { tasks, loadTasks } = useTasks();
  const [globalTaskItems, setGlobalTaskItems] = useState<TaskItem[]>([]);

  useEffect(() => {
    const newTaskItems: TaskItem[] = tasks.map((task) => {
      const group = groups.find((g) => g.id === task.groupId);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        groupName: group ? group.name : "Nieznana grupa",
        isCompleted: task.isCompleted,
      };
    });

    setGlobalTaskItems(newTaskItems);
  }, [tasks, groups]);

  return { globalTaskItems, loadTasks };
};