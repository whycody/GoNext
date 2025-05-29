import React, { createContext, useContext, useEffect, useState, useCallback, FC } from "react";
import { getUserGroups } from "../hooks/useApi";
import { Group } from "../types/Group";

type GroupsContextType = {
  groups: Group[];
  syncGroups: () => Promise<void>;
};

const GroupsContext = createContext<GroupsContextType>({
  groups: [],
  syncGroups: async () => {}
});

export const GroupsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);

  const loadGroups = useCallback(async () => {
    try {
      const groups: Group[] = await getUserGroups();
      setGroups(groups);
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <GroupsContext.Provider value={{ groups, syncGroups: loadGroups }}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroupsContext = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error("useGroupsContext must be used within a GroupsProvider");
  }
  return context;
};