import { useEffect, useState } from "react";
import { SettingsButton } from "../types/SettingsButton";

export const useSettingsButtons = () => {
  const [settingsButtons, setSettingsButtons] = useState<SettingsButton[]>([
    { id: 1, name: "Change password", description: "Change your current password", color: "#ff5733", icon: "🔐"},
    { id: 2, name: "Log out", description: "Bye-bye!", color: "#33ff57", icon: "👋🏻" },
  ]);

  const settingsButtonsView = settingsButtons.map((button) => {
    const name = button.name;
    const description = button.description;
    return {
      ...button,
      name,
      description,
    };
  });

  return settingsButtonsView;
};