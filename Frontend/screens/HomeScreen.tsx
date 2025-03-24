import { ScrollView, View, StyleSheet, FlatList } from "react-native";
import HomeHeader from "../components/HomeHeader";
import CategoryItem from "../components/CategoryItem";
import { useEffect, useState } from "react";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { useTaskItems } from "../hooks/useTaskItems";
import { TaskItem } from "../types/Task";
import TaskView from "../components/TaskView";

enum Categories {
  PRIORITY = 'Priority',
  GROUP = 'Group',
}

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(Categories.GROUP);
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
  const loadedTaskItems = useTaskItems();

  useEffect(() => {
    setTaskItems(loadedTaskItems);
  }, []);

  const renderTaskItem = ({ index, item }: { index: number, item: TaskItem }) => (
    <TaskView index={index} taskItem={item} onTaskPress={(id) => {
      const newTask = { ...taskItems.find(task => task.id === id) } as TaskItem;
      newTask.isCompleted = !newTask.isCompleted;
      setTaskItems(taskItems.map(task => task.id === id ? newTask : task));
    }}/>
  );

  return (
    <ScrollView style={{ flex: 1 }}>
      <HomeHeader style={{ paddingHorizontal: 20, paddingVertical: 30 }}/>
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
      <FlatList
        data={taskItems}
        renderItem={renderTaskItem}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: 15
  }
});

export default HomeScreen;