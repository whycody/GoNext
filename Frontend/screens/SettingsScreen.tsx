import { FlatList, View, Button, StyleSheet } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../utils/AuthProvider";
import { useTheme } from "@react-navigation/native";
import SettingsHeader from "../components/SettingsHeader";
import SettingsButton from "../components/SettingsButton";
import { useSettingsButtons } from "../hooks/useSettingsButtons";

const SettingsScreen = () => {
  const authContext = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const settingsItems = [
    { id: 1, name: "Change password", description: "Change your current password", color: "#ff5733", icon: "🔐"},
    { id: 2, name: "Log out", description: "Bye-bye!", color: "#33ff57", icon: "👋🏻" },
    ];
  const logout = async () => {
    await authContext?.logout();
  };

  return (
    <View style={styles.container}>
      <SettingsHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 }}/>
      <FlatList
        style={{ marginTop: 2 }}
        data={settingsItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <SettingsButton
            index={index}
            name={item.name}
            description={item.description}
            color={item.color}
            icon={item.icon}
            onButtonPress={() => item.id === 2 ? logout() : console.log("Button pressed:", item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
       />
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    separator: {
      height: 1, 
      backgroundColor: colors.background,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: colors.card,
    },
  });

export default SettingsScreen;
