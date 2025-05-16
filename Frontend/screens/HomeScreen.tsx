import { ScrollView, View, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import HomeHeader from "../components/HomeHeader";
import CategoryItem from "../components/CategoryItem";
import { useEffect, useRef, useState } from "react";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import { Task, TaskItem } from "../types/Task";
import { useTheme } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import HandleTaskBottomSheet from "../sheets/HandleTaskBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { addUserTodo } from "../hooks/useApi";
import { useTaskItems } from "../hooks/useTaskItems";
import TaskItemsList from "../components/TaskItemsList";

export enum Categories {
  PRIORITY = 'Priority',
  GROUP = 'Group',
}

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(Categories.GROUP);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const handleTaskBottomSheetRef = useRef<BottomSheetModal>(null);
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
  const { globalTaskItems, loadTasks } = useTaskItems();

  const handleFABPress = () => {
    handleTaskBottomSheetRef.current?.present();
  }

  useEffect(() => {
    if (!globalTaskItems || globalTaskItems.length == 0) return;
    setTaskItems(globalTaskItems);
    setLoading(false);
  }, [globalTaskItems]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    await loadTasks();
    setRefreshing(false);
    setLoading(false);
  };

  const handleTask = async (task: Task) => {
    setLoading(true);
    await addUserTodo(task);
    await loadTasks();
    setLoading(false);
  }

  return (
    <>
      <HandleTaskBottomSheet
        ref={handleTaskBottomSheetRef}
        taskId={null}
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
        <TaskItemsList
          taskItems={taskItems}
          setTaskItems={setTaskItems}
          onDataChange={loadTasks}
          selectedCategory={selectedCategory}
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
});

export default HomeScreen;