import { FlatList, StyleSheet, View } from "react-native";
import GroupsHeader from "../components/GroupsHeader"; 
import GroupsView from "../components/GroupsView"; 
import { useGroupStats } from "../hooks/useGroupStats"; // Zmieniono na useGroupStats
import { useTheme } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import HandleGroupBottomSheet from "../sheets/HandleGroupBottomSheet";
import { useState, useRef } from "react";

const GroupsScreen = () => {
  const groups = useGroupStats(); // Użycie useGroupStats
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleGroupBottomSheetRef = useRef<BottomSheetModal>(null);

  const handleGroupAdd = (name: string, icon: string, color: string, members: string[]) => {
    console.log("New group added:", { name, icon, color, members });
  };

  const handleGroupEdit = (id: number, name: string, icon: string, color: string, members: string[]) => {
    console.log("Group edited:", { id, name, icon, color, members });
  };

  const handleGroupLongPress = (id: number) => {
    setSelectedGroupId(id); 
    handleGroupBottomSheetRef.current?.present(); // Open the bottom sheet
  };

  const handleFABPress = () => {
    setSelectedGroupId(null); 
    handleGroupBottomSheetRef.current?.present(); 
  };

  return (
    <View style={styles.container}>
      <GroupsHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 }} /> 
      <FlatList
        style={{ marginTop: 2 }}
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <GroupsView
            index={index}
            group={item}
            taskCount={item.taskCount} // Przekazanie liczby zadań
            memberCount={item.memberCount} // Przekazanie liczby członków
            onGroupPress={() => console.log("Group pressed:", item.id)}
            onLongPress={() => handleGroupLongPress(item.id)} 
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        color={colors.primary}
        onPress={handleFABPress}
      />
      <HandleGroupBottomSheet
        ref={handleGroupBottomSheetRef} 
        groupId={selectedGroupId} 
        onGroupAdd={handleGroupAdd} 
        onGroupEdit={handleGroupEdit} 
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

export default GroupsScreen;