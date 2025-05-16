import { ScrollView, View, StyleSheet, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import HomeHeader from "../components/HomeHeader";
import CategoryItem from "../components/CategoryItem";
import { useEffect, useRef, useState } from "react";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import { Task, TaskItem } from "../types/Task";
import TaskView from "../components/TaskView";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FAB } from "react-native-paper";
import HandleTaskBottomSheet from "../sheets/HandleTaskBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { addUserTodo, updateUserTodo } from "../hooks/useApi";
import { useTaskItems } from "../hooks/useTaskItems";
import { useTasks } from "../hooks/useTasks";

enum Categories {
  PRIORITY = 'Priority',
  GROUP = 'Group',
}

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(Categories.GROUP);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const handleTaskBottomSheetRef = useRef<BottomSheetModal>(null);
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
  const { tasks, loadTasks } = useTasks();
  const globalTaskItems = useTaskItems();

  useEffect(() => {
    setTaskItems(globalTaskItems);
  }, [tasks]);

  const handleTaskPress = async (id: number, currentValue: boolean) => {
    // await toggle(id, currentValue);
    const newTask = { ...taskItems.find(task => task.id === id) } as TaskItem;
    newTask.isCompleted = !newTask.isCompleted;
    setTaskItems(taskItems.map(task => task.id === id ? newTask : task));
  }

  const renderTaskItem = ({ index, item }: { index: number, item: TaskItem }) => (
    <TaskView
      index={index}
      taskItem={item}
      onTaskPress={handleTaskPress}
      onLongPress={(id) => {
        setSelectedTaskId(id);
        handleTaskBottomSheetRef.current?.present();
      }}
    />
  );

  const groupedTaskItems = () => {
    const grouped = taskItems.reduce((acc, task) => {
      const primaryKey = selectedCategory === Categories.PRIORITY ? task.priority : task.groupName;
      const secondaryKey = selectedCategory === Categories.PRIORITY ? task.groupName : task.priority;

      if (!acc[primaryKey]) {
        acc[primaryKey] = {};
      }
      if (!acc[primaryKey][secondaryKey]) {
        acc[primaryKey][secondaryKey] = [];
      }
      acc[primaryKey][secondaryKey].push(task);
      return acc;
    }, {} as Record<string, Record<string, TaskItem[]>>);

    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map(primaryKey => ({
        title: primaryKey,
        data: Object.keys(grouped[primaryKey]).map(secondaryKey => ({
          title: secondaryKey,
          data: grouped[primaryKey][secondaryKey].sort((a, b) => a.isCompleted ? 1 : -1),
        })).sort((a, b) => b.title.localeCompare(a.title)),
      }));
  };

  const handleFABPress = () => {
    setSelectedTaskId(null);
    handleTaskBottomSheetRef.current?.present();
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }

  const handleTask = async (task: Task) => {
    setLoading(true);
    selectedTaskId ? await updateUserTodo(task) : await addUserTodo(task);
    setLoading(false);
  }

  const translatePriority = (priority: number) => {
    switch (priority) {
      case 3:
        return 'Critical';
      case 2:
        return 'Moderate';
      default:
        return 'Minor';
    }
  }

  return (
    <>
      <HandleTaskBottomSheet
        ref={handleTaskBottomSheetRef}
        taskId={selectedTaskId}
        onTaskHandle={handleTask}
      />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={240}
          />
        }
      >
        <HomeHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 15 }}/>
        <View style={styles.categoriesContainer}>
          <CategoryItem
            value={Categories.PRIORITY}
            selected={selectedCategory}
            onPress={() => setSelectedCategory(Categories.PRIORITY)}
          />
          <CategoryItem
            value={Categories.GROUP}
            selected={selectedCategory}
            onPress={() => setSelectedCategory(Categories.GROUP)}
          />
        </View>
        {loading &&
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginVertical: MARGIN_VERTICAL }}
          />
        }
        <FlatList
          scrollEnabled={false}
          data={groupedTaskItems()}
          ListFooterComponent={<View style={{ height: 150 }}/>}
          renderItem={({ item }) => (
            <View>
              <View style={styles.sectionHeaderContainer}>
                <MaterialCommunityIcons
                  name={selectedCategory == Categories.PRIORITY ? 'flag' : 'account-group'}
                  size={22}
                  color={colors.primary}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.sectionHeader}>
                  {selectedCategory == Categories.PRIORITY ? translatePriority(Number(item.title)) : item.title}
                </Text>
              </View>
              {item.data.map(subItem => (
                <View key={subItem.title}>
                  <View style={styles.subsectionHeaderContainer}>
                    <MaterialCommunityIcons
                      name={selectedCategory == Categories.PRIORITY ? 'account-group' : 'flag'}
                      size={18}
                      color={colors.text}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.subsectionHeader}>
                      {selectedCategory == Categories.GROUP ? translatePriority(Number(subItem.title)) : subItem.title}
                    </Text>
                  </View>
                  <FlatList
                    data={subItem.data}
                    renderItem={renderTaskItem}
                    scrollEnabled={false}
                  />
                </View>
              ))}
            </View>
          )}
        />
      </ScrollView>
      <FAB
        style={{ position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.background }}
        icon="plus"
        color={colors.primary}
        onPress={handleFABPress}
      />
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  categoriesContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: 15
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL / 1.5
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    color: colors.primary,
  },
  subsectionHeaderContainer: {
    flexDirection: 'row',
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL / 2,
    backgroundColor: colors.card,
  },
  subsectionHeader: {
    fontWeight: 'bold',
    fontSize: 15,
  }
});

export default HomeScreen;