import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Group } from "../types/Group";

type GroupViewProps = {
  index: number;
  group: Group;
  onGroupPress: (id: number) => void;
};

const GroupsView = ({ index, group, onGroupPress, onLongPress }: GroupViewProps) => {
  const { colors } = useTheme();
  const { id, name, color, icon } = group;
  const styles = getStyles(colors);

  return (
    <>
      <Pressable
        style={styles.root} 
        onPress={() => onGroupPress(id)}
        onLongPress={() => onLongPress?.(id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.header}>{name}</Text>
        </View>
      </Pressable>
    </>
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
    },
    textContainer: {
      flex: 1,
    },
    header: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
  });

export default GroupsView;