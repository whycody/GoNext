import { useGroups } from "./useGroups";
import { useTasks } from "./useTasks";

export const useGroupStats = (refresh?: number) => {
  const groups = useGroups(refresh);
  const tasks = useTasks(refresh).tasks;

  return groups.map((group) => {
    const taskCount = tasks.filter((task) => task.groupId === group.id).length;
    const memberCount = group.membersIds.length;

    return {
      ...group,
      taskCount,
      memberCount,
    };
  });
};