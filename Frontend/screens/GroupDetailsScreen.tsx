import { useRoute, useTheme } from "@react-navigation/native";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import GroupsView from "../components/GroupsView";
import { useGroupsContext } from "../store/GroupsContext";
import { useTaskItemsContext } from "../store/TaskItemsContext";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import UserView from "../components/UserView";
import TaskItemsList from "../components/TaskItemsList";
import { Categories } from "./HomeScreen";

type GroupDetailsProps = {
  groupId: string;
};

const GroupDetailsScreen = () => {
  const { colors } = useTheme();
  const { groups } = useGroupsContext();
  const { taskItems, tasks, syncTaskItems } = useTaskItemsContext();
  const styles = getStyles(colors);

  const route = useRoute();
  const groupId = (route.params as GroupDetailsProps)?.groupId || 1;

  const group = groups.find((group) => group.id == groupId)
  const [groupTaskItems, setGroupTaskItems] = useState(taskItems.filter((item) => item.groupId == groupId));

  if (!group) {
    return (
      <View style={styles.root}>
        <Text>Group not found</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <GroupsView
        index={0}
        group={group}
        taskCount={tasks.filter((task) => task.groupId == group.id).length}
        memberCount={group.members.length}
        onGroupPress={() => {
        }}
      />
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
        onDataChange={syncTaskItems}
        displayHeader={false}
      />
    </ScrollView>
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
  }
});

export default GroupDetailsScreen;