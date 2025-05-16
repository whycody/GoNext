import { useTasks } from "./useTasks";
import { useGroups } from "./useGroups";

export const useTaskItems = () => {
  const tasks = useTasks().tasks;
  const groups = useGroups();

  return tasks.map((task) => {
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
};