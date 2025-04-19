import React from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import GroupsHeader from "../components/GroupsHeader";
import { useGroupStats } from "../hooks/useGroupStats";
import { useTheme } from "@react-navigation/native";

const GroupsScreen = () => {
  const groupStats = useGroupStats(); // Pobierz statystyki grup
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <GroupsHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 }} />
      <View style={styles.separator} />
      <FlatList
        data={groupStats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.groupContainer}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupStats}>
                {item.taskCount} tasks • {item.memberCount} members
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      
    },
    groupContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: colors.card,
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
    groupName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    groupStats: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.6,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
  });

export default GroupsScreen;