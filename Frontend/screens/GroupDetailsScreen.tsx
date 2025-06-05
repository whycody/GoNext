import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import GroupsView from "../components/GroupsView";
import { useGroupsContext } from "../store/GroupsContext";
import { useTaskItemsContext } from "../store/TaskItemsContext";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import UserView from "../components/UserView";
import TaskItemsList from "../components/TaskItemsList";
import { Categories } from "./HomeScreen";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { FAB } from "react-native-paper";
import HandleGroupBottomSheet from "../sheets/HandleGroupBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  addUserTodo,
  demoteUserFromAdmin,
  leaveGroup,
  promoteUserToAdmin,
  removeGroup,
  removeUserFromGroup,
  updateGroup
} from "../hooks/useApi";
import InviteUserBottomSheet from "../sheets/InviteUserBottomSheet";
import { Task } from "../types/Task";
import HandleTaskBottomSheet from "../sheets/HandleTaskBottomSheet";
import { useAuthContext } from "../utils/AuthProvider";
import HandleUserBottomSheet from "../sheets/HandleUserBottomSheet"

type GroupDetailsProps = {
  groupId: string;
};

const GroupDetailsScreen = () => {
  const { colors } = useTheme();
  const { groups, syncGroups } = useGroupsContext();
  const { taskItems, tasks, syncTaskItems } = useTaskItemsContext();
  const navigation = useNavigation();
  const styles = getStyles(colors);
  const { user } = useAuthContext();

  const route = useRoute();
  const groupId = (route.params as GroupDetailsProps)?.groupId || 1;

  const group = groups.find((group) => group.id == groupId);
  const [groupTaskItems, setGroupTaskItems] = useState(
    taskItems.filter((item) => item.groupId == groupId)
  );

  const handleTaskBottomSheetRef = useRef<BottomSheetModal>(null);
  const handleGroupBottomSheetRef = useRef<BottomSheetModal>(null);
  const inviteUserBottomSheetRef = useRef<BottomSheetModal>(null);

  const currentUser = group?.members.find((member) => member.id == user?.user_id)
  const isAdmin = currentUser && currentUser.role == 'admin';
  const numberOfAdmins = group?.members.filter((member) => member.role == 'admin').length || 0;
  const handleUserBottomSheetRef = useRef<BottomSheetModal>(null);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    setGroupTaskItems(taskItems.filter((item) => item.groupId == groupId));
  }, [taskItems]);

  if (!group) {
    return (
      <View style={styles.root}>
        <Text>Group not found</Text>
      </View>
    );
  }

  const handleUserInvitation = () => {
    inviteUserBottomSheetRef.current?.present();
  };

  const handleEditGroupPress = () => {
    handleGroupBottomSheetRef.current?.present();
  };

  const handleGroupRemove = () => {
    if (group.members.length > 1) {
      Alert.alert("Remove group", "You cannot remove this group because there are still members in it.", [{
        text: "Cancel",
        style: "cancel"
      },]);
      return;
    }

    Alert.alert("Remove group", "Are you sure you want to remove this group? All tasks will be removed also.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeGroup(group.id);
            await syncGroups();
            navigation.goBack();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.error || "Could not remove group."
            );
          }
        },
      },
    ]);
  }

  const handleLeaveGroupPress = () => {
    if (numberOfAdmins == 1 && isAdmin) {
      Alert.alert("Leave group", "You cannot leave this group because you are the only admin.", [{
        text: "Cancel",
        style: "cancel"
      },]);
      return;
    }

    Alert.alert("Leave group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await leaveGroup(group.id);
            await syncGroups();
            navigation.goBack();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.error || "Could not leave group."
            );
          }
        },
      },
    ]);
  };

  const handleTaskAdd = () => {
    handleTaskBottomSheetRef.current?.present();
  };

  const handleTask = async (task: Task) => {
    console.log('Adding task', task);
    await addUserTodo(task);
    await syncTaskItems();
  };

  const handleDataChange = async () => {
    console.log("Data changed");
    await syncTaskItems();
  };

  const onGroupEdit = async (
    id: number,
    name: string,
    icon: string,
    color: string,
    members: string[]
  ) => {
    const res = await updateGroup({ id, name, icon, color });
    await syncGroups();
  };

  const handleUserPress = (item: any) => {
    setSelectedUser({
      id: item.id,
      name: item.username,
      email: item.email,
      isAdmin: item.role === "admin" || item.isAdmin,
    });
    handleUserBottomSheetRef.current?.present();
  };

  const handlePromote = async (userId: number) => {
    try {
      await promoteUserToAdmin(group.id, userId);
      await syncGroups();
      handleUserBottomSheetRef.current?.dismiss();
    } catch (e: any) {
      Alert.alert("Błąd", e?.response?.data?.error || "Nie udało się awansować użytkownika.");
    }
  };

  const handleDemote = async (userId: number) => {
    try {
      await demoteUserFromAdmin(group.id, userId);
      await syncGroups();
      handleUserBottomSheetRef.current?.dismiss();
    } catch (e: any) {
      Alert.alert("Błąd", e?.response?.data?.error || "Nie udało się zdegradować użytkownika.");
    }
  };

  const handleRemove = async (userId: number) => {
    try {
      await removeUserFromGroup(group.id, userId);
      await syncGroups();
      handleUserBottomSheetRef.current?.dismiss();
    } catch (e: any) {
      Alert.alert("Błąd", e?.response?.data?.error || "Nie udało się usunąć użytkownika z grupy.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <HandleGroupBottomSheet
        ref={handleGroupBottomSheetRef}
        group={group}
        onGroupAdd={syncGroups}
        onGroupEdit={onGroupEdit}
      />
      <InviteUserBottomSheet
        ref={inviteUserBottomSheetRef}
        onSendInvitation={() => {
        }}
        groupName={group.name}
        groupId={group.id}
      />
      <HandleTaskBottomSheet
        ref={handleTaskBottomSheetRef}
        taskId={null}
        onTaskHandle={handleTask}
        selectedGroupId={group.id}
      />

      <GroupsView
        index={0}
        group={group}
        taskCount={tasks.filter((task) => task.groupId == group.id).length}
        memberCount={group.members.length}
        onGroupPress={() => {
        }}
      />
      <FlatList
        data={group.members}
        keyExtractor={(item) => item.id?.toString() ?? item.email}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4, backgroundColor: "white" }}>
            <UserView member={item}/>
            {isAdmin && (
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Pressable
                  style={{ padding: 15, borderRadius: 16, marginRight: 8 }}
                  onPress={() => handleUserPress(item)}
                  hitSlop={8}
                >
                  <Ionicons name="pencil" size={25} color={colors.primary}/>
                </Pressable>
              </View>
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <Ionicons name="person-circle" size={28} color={colors.primary}/>
              <Text style={styles.header}>Members of group</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <>
            <View style={styles.headerContainer}>
              <Ionicons name="clipboard" size={24} color={colors.primary}/>
              <Text style={styles.header}>List of tasks</Text>
            </View>
            <TaskItemsList
              taskItems={groupTaskItems}
              setTaskItems={setGroupTaskItems}
              selectedCategory={Categories.GROUP}
              onDataChange={handleDataChange}
              displayHeader={false}
            />
            <View style={{ height: 180 }}/>
          </>
        }
      />

      <View style={styles.bottomBarContainer}>
        <FAB
          visible={isAdmin}
          style={{ position: "absolute", zIndex: 20, right: 29, bottom: 200, backgroundColor: colors.background }}
          icon="trash-can-outline"
          color={colors.primary}
          onPress={handleGroupRemove}
          size="small"
        />
        <FAB
          visible={isAdmin}
          style={{ position: "absolute", zIndex: 20, right: 29, bottom: 150, backgroundColor: colors.background }}
          icon="account-multiple-plus-outline"
          color={colors.primary}
          onPress={handleUserInvitation}
          size="small"
        />
        <FAB
          style={{ position: "absolute", zIndex: 20, right: 20, bottom: 80, backgroundColor: colors.background }}
          icon="plus"
          color={colors.primary}
          onPress={handleTaskAdd}
        />
        <Pressable style={styles.buttonContainer} onPress={handleLeaveGroupPress}>
          <Text style={styles.buttonLabel}>Leave</Text>
        </Pressable>
        {isAdmin && (
          <Pressable style={styles.buttonContainer} onPress={handleEditGroupPress}>
            <Text style={styles.buttonLabel}>Edit</Text>
          </Pressable>
        )}
      </View>

      {selectedUser && (
        <HandleUserBottomSheet
          ref={handleUserBottomSheetRef}
          user={selectedUser}
          groupId={group.id}
          onPromote={handlePromote}
          onDemote={handleDemote}
          onRemove={handleRemove}
        />
      )}
    </View>
  );

};

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    header: {
      fontWeight: "bold",
      fontSize: 18,
      paddingLeft: 8,
      opacity: 0.9,
    },
    bottomBarContainer: {
      height: 60,
      flexDirection: "row",
      gap: 5,
      backgroundColor: "white",
      paddingVertical: 10,
      paddingHorizontal: MARGIN_HORIZONTAL,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonContainer: {
      flex: 1,
      height: "100%",
      backgroundColor: "#efefef",
      borderRadius: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonLabel: {
      textAlign: "center",
      color: colors.primary,
    },
  });

export default GroupDetailsScreen;