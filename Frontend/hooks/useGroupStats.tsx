import { useGroups } from "./useGroups";
import { useTasks } from "./useTasks";

export const useGroupStats = () => {
  const groups = useGroups();
  const tasks = useTasks();

  const groupStats = groups.map((group) => {
    const taskCount = tasks.filter((task) => task.groupId === group.id).length;
    const memberCount = group.membersIds.length;

    return {
      ...group,
      taskCount,
      memberCount,
    };
  });

  return groupStats;
};