import { useRoute, useTheme, useNavigation } from "@react-navigation/native";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import GroupsView from "../components/GroupsView";
import { useGroupsContext } from "../store/GroupsContext";
import { useTaskItemsContext } from "../store/TaskItemsContext";
import { useRef, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import UserView from "../components/UserView";
import TaskItemsList from "../components/TaskItemsList";
import { Categories } from "./HomeScreen";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { FAB } from "react-native-paper";
import HandleGroupBottomSheet from "../sheets/HandleGroupBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { addUserTodo, updateGroup, leaveGroup } from "../hooks/useApi";
import InviteUserBottomSheet from "../sheets/InviteUserBottomSheet";
import { Task } from "../types/Task";
import HandleTaskBottomSheet from "../sheets/HandleTaskBottomSheet";
import { useAuthContext } from "../utils/AuthProvider";

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

  const group = groups.find((group) => group.id == groupId)
  const [groupTaskItems, setGroupTaskItems] = useState(taskItems.filter((item) => item.groupId == groupId));

  const handleTaskBottomSheetRef = useRef<BottomSheetModal>(null);
  const handleGroupBottomSheetRef = useRef<BottomSheetModal>(null);
  const inviteUserBottomSheetRef = useRef<BottomSheetModal>(null);

  const currentUser = group?.members.find((member) => member.id == user?.user_id)
  const isAdmin = currentUser && currentUser.role == 'admin';

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
  }

  const handleEditGroupPress = () => {
    handleGroupBottomSheetRef.current?.present();
  }

  const handleLeaveGroupPress = () => {
    Alert.alert(
      "Leave group",
      "Are you sure you want to leave this group?",
      [
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
              Alert.alert("Error", e?.response?.data?.error || "Could not leave group.");
            }
          }
        }
      ]
    );
  };

  const handleTaskAdd = () => {
    handleTaskBottomSheetRef.current?.present();
  }

  const handleTask = async (task: Task) => {
    await addUserTodo(task);
    await syncTaskItems();
  }

  const handleDataChange = async () => {
    console.log("Data changed");
    await syncTaskItems();
  }

  const onGroupEdit = async (id: number, name: string, icon: string, color: string, members: string[]) => {
    const res = await updateGroup({ id, name, icon, color });
    await syncGroups();
  }

  return (
    <View style={{ flex: 1 }}>
      <HandleGroupBottomSheet
        ref={handleGroupBottomSheetRef}
        groupId={group.id}
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
        selectedGroupId={group ? group.name : undefined}
      />
      <GroupsView
        index={0}
        group={group}
        taskCount={tasks.filter((task) => task.groupId == group.id).length}
        memberCount={group.members.length}
        onGroupPress={() => {
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Ionicons name={'person-circle'} size={28} color={colors.primary}/>
          <Text style={styles.header}>Members of group</Text>
        </View>
        <FlatList
          data={group.members}
          renderItem={(itemView) =>
            <UserView member={itemView.item}/>
          }
        />
        <View style={styles.headerContainer}>
          <Ionicons name={'clipboard'} size={24} color={colors.primary}/>
          <Text style={styles.header}>List of tasks</Text>
        </View>
        <TaskItemsList
          taskItems={groupTaskItems}
          setTaskItems={setGroupTaskItems}
          selectedCategory={Categories.GROUP}
          onDataChange={handleDataChange}
          displayHeader={false}
        />
      </ScrollView>
      <View style={styles.bottomBarContainer}>
        <FAB
          visible={isAdmin}
          style={{ position: 'absolute', right: 28, bottom: 150, backgroundColor: colors.background }}
          icon="account-multiple-plus-outline"
          color={colors.primary}
          onPress={handleUserInvitation}
          size={'small'}
        />
        <FAB
          style={{ position: 'absolute', right: 20, bottom: 80, backgroundColor: colors.background }}
          icon="plus"
          color={colors.primary}
          onPress={handleTaskAdd}
        />
        <Pressable style={styles.buttonContainer} onPress={handleLeaveGroupPress}>
          <Text style={styles.buttonLabel}>Leave</Text>
        </Pressable>
        {isAdmin &&
          <Pressable style={styles.buttonContainer} onPress={handleEditGroupPress}>
            <Text style={styles.buttonLabel}>Edit</Text>
          </Pressable>
        }
      </View>
    </View>
  )
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 8,
    opacity: 0.9
  },
  bottomBarContainer: {
    height: 60,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: MARGIN_HORIZONTAL,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: '#efefef',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLabel: {
    textAlign: 'center',
    color: colors.primary,
  }
});

export default GroupDetailsScreen;