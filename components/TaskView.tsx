import { TaskItem } from "../types/Task";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";

type TaskItemProps = {
  index: number,
  taskItem: TaskItem,
  onTaskPress: (id: number) => void,
}

const TaskView = ({ index, taskItem, onTaskPress }: TaskItemProps) => {
  const { colors } = useTheme();
  const { id, title, description, priority, groupName } = taskItem;
  const styles = getStyles(colors);

  return (
    <>
    {index > 0 && <View style={{ height: 1 }} />}
      <Pressable style={styles.root} onPress={() => onTaskPress(id)}>
        <View
          style={{
            height: 10,
            width: 10,
            borderRadius: 100,
            backgroundColor: priority == 3 ? '#ec5555' : priority == 2 ? '#ecdf55' : '#afe497'
          }}
        />
        <View style={styles.textContainer}>
          <Text style={styles.header} numberOfLines={1}>{title}</Text>
          <Text style={styles.subheader} numberOfLines={1}>{description}</Text>
        </View>
      </Pressable>
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.card
  },
  textContainer: {
    marginLeft: MARGIN_VERTICAL / 2,
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  subheader: {
    fontSize: 12,
    opacity: 0.7,
  }
});

export default TaskView;