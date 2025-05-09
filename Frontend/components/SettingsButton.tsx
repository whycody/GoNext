import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Group } from "../types/Group";
import { SettingsButton } from "../types/SettingsButton";

type SettingsButtonProps = {
  index: number;
  button: SettingsButton;
  onButtonPress: (id: number) => void;
};

const SettingsButtonsView = ({ index, button, onButtonPress}: SettingsButtonProps) => {
  const { colors } = useTheme();
  const { id, name, description, color, icon } = button;
  const styles = getStyles(colors);

  return (
    <Pressable
      style={styles.root}
      onPress={() => onButtonPress(id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.header}>{name}</Text>
        <Text style={styles.details}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: colors.card,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginBottom: 1,
      borderRadius: 8,
    },
    iconContainer: {
      height: 40,
      width: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    icon: {
      fontSize: 20,
      color: "#fff",
    },
    textContainer: {
      flex: 1,
    },
    header: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    details: {
      fontSize: 14,
      color: colors.text,
      marginTop: 4,
    },
  });

export default SettingsButtonsView;