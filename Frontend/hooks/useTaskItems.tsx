import { useTasks } from "./useTasks";
import { useEffect, useState } from "react";
import { TaskItem } from "../types/Task";
import { useGroupsContext } from "../store/GroupsContext";

export const useTaskItems = () => {
  const { groups } = useGroupsContext();
  const { tasks, loadTasks } = useTasks();
  const [globalTaskItems, setGlobalTaskItems] = useState<TaskItem[]>([]);

  useEffect(() => {
    const newTaskItems: TaskItem[] = tasks.map((task) => {
      const group = groups.find((g) => g.id === task.groupId);
      console.log(task.groupId)
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        groupName: task.groupId == null ? 'Personal' : group ? group.name : "Nieznana grupa",
        isCompleted: task.isCompleted,
      };
    });

    setGlobalTaskItems(newTaskItems);
  }, [tasks, groups]);

  return { globalTaskItems, loadTasks };
};