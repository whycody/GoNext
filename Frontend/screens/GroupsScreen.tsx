import { FlatList, StyleSheet, View } from "react-native";
import GroupsHeader from "../components/GroupsHeader"; 
import GroupsView from "../components/GroupsView"; 
import { useGroups } from "../hooks/useGroups"; 
import { useTheme } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import HandleGroupBottomSheet from "../sheets/HandleGroupBottomSheet";
import { useState, useRef } from "react";

const GroupsScreen = () => {
  const groups = useGroups(); 
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleGroupBottomSheetRef = useRef<BottomSheetModal>(null);

  const handleGroupAdd = (name: string, icon: string, color: string, members: string[]) => {
    console.log("New group added:", { name, icon, color, members });
  };

  const handleGroupLongPress = (id: number) => {
    console.log("Group long pressed:", id);
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
            onGroupPress={handleGroupAdd}
            onLongPress={handleGroupLongPress}
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
        onGroupAdd={handleGroupAdd} 
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