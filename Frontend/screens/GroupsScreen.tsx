import { FlatList, StyleSheet, View } from "react-native";
import GroupsHeader from "../components/GroupsHeader"; 
import GroupsView from "../components/GroupsView"; 
import { useGroupStats } from "../hooks/useGroupStats"; 
import { useTheme } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import HandleGroupBottomSheet from "../sheets/HandleGroupBottomSheet";
import InviteUserBottomSheet from "../sheets/InviteUserBottomSheet";
import { useState, useRef } from "react";
import { createGroup } from "../hooks/useApi"; 

const GroupsScreen = () => {
  const [refreshGroups, setRefreshGroups] = useState(0);
  const groups = useGroupStats(refreshGroups);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null); 

  const handleGroupBottomSheetRef = useRef<BottomSheetModal>(null);
  const inviteUserBottomSheetRef = useRef<BottomSheetModal>(null);

  const handleGroupAdd = async (name: string, icon: string, color: string, members: string[]) => {
    const result = await createGroup(name, icon, color);
    if (result) {
      setRefreshGroups(r => r + 1); 
    }
  };

  const handleGroupEdit = (id: number, name: string, icon: string, color: string, members: string[]) => {
    console.log("Group edited:", { id, name, icon, color, members });
  };

  const handleSendInvitation = (email: string) => {
    console.log(`Invitation sent to ${email} for group ID: ${selectedGroupId}`);
  };

  const handleGroupLongPress = (id: number) => {
    const group = groups.find((g) => g.id === id); 
    setSelectedGroupId(id); 
    setSelectedGroupName(group?.name || null);
    inviteUserBottomSheetRef.current?.present(); 
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
            taskCount={item.taskCount} 
            memberCount={item.memberCount} 
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
      <InviteUserBottomSheet
        ref={inviteUserBottomSheetRef} 
        onSendInvitation={handleSendInvitation} 
        groupName={selectedGroupName}
        groupId={selectedGroupId}
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