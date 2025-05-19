import { useEffect, useState } from "react";
import { Group, GroupModel } from "../types/Group";
import { getUserGroups } from "./useApi";

export const useGroups = (refresh?: number) => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const loadGroups = async () => {
      const groups: GroupModel[] = await getUserGroups();
      setGroups(groups.map(group => ({
        id: group.id,
        name: group.name,
        color: "#000000",
        icon: "🔍",
        membersIds: [],
      })))
    }

    loadGroups();
  }, [refresh]); 

  return groups;
};