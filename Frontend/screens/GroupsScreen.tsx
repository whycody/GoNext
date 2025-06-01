import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import GroupsHeader from "../components/GroupsHeader";
import GroupsView from "../components/GroupsView";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import HandleGroupBottomSheet from "../sheets/HandleGroupBottomSheet";
import { useState, useRef } from "react";
import { createGroup } from "../hooks/useApi";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useGroupsContext } from "../store/GroupsContext";
import { useTaskItemsContext } from "../store/TaskItemsContext";

const GroupsScreen = () => {
  const { tasks } = useTaskItemsContext();
  const { groups, syncGroups } = useGroupsContext();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleGroupBottomSheetRef = useRef<BottomSheetModal>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncGroups();
    setRefreshing(false);
  }

  const handleGroupAdd = async (name: string, icon: string, color: string, members: string[]) => {
    const result = await createGroup(name, icon, color);
    handleGroupBottomSheetRef.current?.dismiss();
    await syncGroups();
  };

  const handleGroupEdit = (id: number, name: string, icon: string, color: string, members: string[]) => {
    console.log("Group edited:", { id, name, icon, color, members });
  };

  const handleFABPress = () => {
    setSelectedGroupId(null);
    handleGroupBottomSheetRef.current?.present();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={240}
          />
        }>
        <GroupsHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 }}/>
        <FlatList
          style={{ marginTop: 2 }}
          data={groups}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <GroupsView
              index={index}
              group={item}
              taskCount={tasks.filter((task) => task.groupId == item.id).length}
              memberCount={item.members.length}
              onGroupPress={() => navigation.navigate("GroupDetails", { groupId: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator}/>}
        />

      </ScrollView>
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