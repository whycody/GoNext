import { useState } from "react";
import { Group } from "../types/Group";

export const useGroups = () => {
  const [groups] = useState<Group[]>([
    { id: "1", name: "Praca", color: "#ff5733", icon: "💼", membersIds: ["101", "102"] },
    { id: "2", name: "Rodzina", color: "#33ff57", icon: "🏡", membersIds: ["103", "104"] },
    { id: "3", name: "Znajomi", color: "#3357ff", icon: "🎉", membersIds: ["105", "106"] },
    { id: "4", name: "Sport", color: "#ff33a8", icon: "⚽", membersIds: ["107", "108"] },
  ]);

  return groups;
};