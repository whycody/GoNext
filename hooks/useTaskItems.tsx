import { useState } from "react";
import { useTasks } from "./useTasks";
import { useGroups } from "./useGroups";
import { TaskItem } from "../types/Task";

export const useTaskItems = () => {
  const tasks = useTasks();
  const groups = useGroups();

  const [taskItems] = useState<TaskItem[]>(
    tasks.map((task) => {
      const group = groups.find((g) => g.id === task.groupId);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        groupName: group ? group.name : "Nieznana grupa",
      };
    })
  );

  return taskItems;
};