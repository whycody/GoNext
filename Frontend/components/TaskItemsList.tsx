import { Task, TaskItem } from "../types/Task";
import { Dispatch, FC, SetStateAction, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import { Categories } from "../screens/HomeScreen";
import TaskView from "./TaskView";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import HandleTaskBottomSheet from "../sheets/HandleTaskBottomSheet";
import { toggleTodoCompleted, updateUserTodo } from "../hooks/useApi";
import { useTaskItems } from "../hooks/useTaskItems";

type TaskItemsListProps = {
  taskItems: TaskItem[];
  setTaskItems: Dispatch<SetStateAction<TaskItem[]>>;
  onDataChange?: () => void;
  selectedCategory: Categories;
  displayHeader?: boolean;
}

const TaskItemsList: FC<TaskItemsListProps> = ({ taskItems, setTaskItems, onDataChange, selectedCategory, displayHeader = true }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const handleTaskBottomSheetRef = useRef<BottomSheetModal>(null);
  const { loadTasks } = useTaskItems();

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
          data: grouped[primaryKey][secondaryKey]
            .sort((a, b) => a.title.localeCompare(b.title))
            .sort((a, b) => a.isCompleted ? 1 : b.isCompleted ? -1 : 0)
        })).sort((a, b) => b.title.localeCompare(a.title)),
      }));
  };


  const handleTaskPress = async (id: number, currentValue: boolean) => {
    await toggleTodoCompleted(id, currentValue);
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

  const handleTask = async (task: Task) => {
    setLoading(true);
    await updateUserTodo(task);
    onDataChange();
    setLoading(false);
  }

  return (
    <>
      <HandleTaskBottomSheet
        ref={handleTaskBottomSheetRef}
        taskId={selectedTaskId}
        onTaskHandle={handleTask}
      />
      <FlatList
        scrollEnabled={false}
        data={groupedTaskItems()}
        ListFooterComponent={<View style={{ height: 150 }}/>}
        renderItem={({ item }) => (
          <View>
            {displayHeader && <View style={styles.sectionHeaderContainer}>
              <MaterialCommunityIcons
                name={selectedCategory == Categories.PRIORITY ? 'flag' : 'account-group'}
                size={22}
                color={colors.primary}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sectionHeader}>
                {selectedCategory == Categories.PRIORITY ? translatePriority(Number(item.title)) : item.title}
              </Text>
            </View>}
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

export default TaskItemsList;