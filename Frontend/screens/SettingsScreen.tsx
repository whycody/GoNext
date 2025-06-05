import { Alert, FlatList, StyleSheet, View } from "react-native";
import React, { useContext, useRef } from "react";
import { AuthContext } from "../utils/AuthProvider";
import { useTheme } from "@react-navigation/native";
import SettingsHeader from "../components/SettingsHeader";
import SettingsButton from "../components/SettingsButton";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ChangePasswordBottomSheet from "../sheets/ChangePasswordBottomSheet";
import { changeUserPassword } from "../hooks/useApi";

const SettingsScreen = () => {
  const authContext = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const resetPasswordSheetRef = useRef<BottomSheetModal>(null);

  const settingsItems = [
    { id: 1, name: "Change password", description: "Change your current password", color: "#ff5733", icon: "🔐" },
    { id: 2, name: "Log out", description: "Bye-bye!", color: "#33ff57", icon: "👋🏻" },
  ];

  const logout = async () => {
    await authContext?.logout();
  };

  const handleOpenResetPasswordSheet = () => {
    resetPasswordSheetRef.current?.present();
  };

  const handlePasswordReset = async (newPassword: string) => {
    console.log("Nowe hasło do ustawienia:", newPassword);
    // here api integration 
  };

  const handleSettingsItemPress = (itemId: number) => {
    if (itemId === 1) {
      handleOpenResetPasswordSheet();
    } else if (itemId === 2) {
      logout();
    } else {
      console.log("Button pressed:", itemId);
    }
  };

  return (
    <View style={styles.container}>
      <SettingsHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 }} />
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
            onButtonPress={() => handleSettingsItemPress(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <ChangePasswordBottomSheet
        ref={resetPasswordSheetRef}
        onPasswordReset={async (oldPassword, newPassword1, newPassword2) => {
          const response = await changeUserPassword(oldPassword, newPassword1, newPassword2);
          if (response && response.message) {
            Alert.alert("Success", response.message);
          } 
        }}
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
