import React, { useState, useCallback, useRef, forwardRef } from "react";
import { Text, TextInput, Platform, StyleSheet, Button } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants";

interface HandleTaskBottomSheetProps {
  taskId?: number,
  onTaskAdd: (title: string, description: string, priority: TaskPriority ) => void;
  onChangeIndex?: (index: number) => void;
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

const HandleTaskCardBottomSheet = forwardRef<BottomSheetModal, HandleTaskBottomSheetProps>(
  ({ taskId, onTaskAdd, onChangeIndex }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const titleInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

    const handleAdd = () => {
      if (!title) return;
      onTaskAdd(title, description, priority);
      setTitle("");
      setDescription("");
    };

    const renderBackdrop = useCallback((props: any) =>
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

    const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
      <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        backdropComponent={renderBackdrop}
        onChange={(index: number) => onChangeIndex?.(index)}
        containerComponent={renderContainerComponent}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      >
        <BottomSheetScrollView style={styles.root}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {taskId ? 'Edit task' : 'Add task'}
          </Text>

          <TextInput
            ref={titleInputRef}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />

          <TextInput
            ref={descriptionInputRef}
            placeholder="Task Description"
            value={description}
            onChangeText={setDescription}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />

          <Button title="Add Task" onPress={handleAdd}/>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    marginVertical: 20,
  },
});

export default HandleTaskCardBottomSheet;