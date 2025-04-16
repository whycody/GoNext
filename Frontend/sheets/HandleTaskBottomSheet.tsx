import React, { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { Text, TextInput, Platform, StyleSheet, Button, View, Pressable } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants";
import SheetText, { SheetTextRef } from "../components/SheetTextInput";
import { Picker } from "@react-native-picker/picker"; //you need to run npm install @react-native-picker/picker
import { useGroups } from "../hooks/useGroups";
import { useTasks } from "../hooks/useTasks";

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

    const titleInputRef = useRef<SheetTextRef>(null);
    const descriptionInputRef = useRef<SheetTextRef >(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

    const [selectedGroup, setSelectedGroup] = useState("");

    const groups = useGroups();
    const tasks = useTasks();

    useEffect(() => {
      if (taskId) {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          setTitle(task.title);
          setDescription(task.description);
    
          const priorityMap: { [key: number]: TaskPriority } = {
            1: TaskPriority.LOW,
            2: TaskPriority.MEDIUM,
            3: TaskPriority.HIGH,
          };
          setPriority(priorityMap[task.priority] || TaskPriority.MEDIUM);
    
          const group = groups.find((g) => g.id === task.groupId);
          setSelectedGroup(group ? group.name : "");
        }
      }
    }, [taskId, tasks, groups]);

    const handleAdd = (clearForm: boolean) => {
      if (!title) return;
      onTaskAdd(title, description, priority);
      if (clearForm) {
        setTitle(""); 
        setDescription(""); 
        setPriority(TaskPriority.MEDIUM);
        setSelectedGroup("");
        titleInputRef.current?.focus();
      }
      else {
        (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      }
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
          <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 16 }}>
            {taskId ? 'Edit task' : 'Add task'}
          </Text>

          <SheetText
            ref={titleInputRef}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            style={{ marginBottom: 12, paddingVertical: 4, borderRadius: 10 }}
          />

          <SheetText
            ref={descriptionInputRef}
            placeholder="Task description"
            value={description}
            onChangeText={setDescription}
            style={{ marginBottom: 12, paddingVertical: 4, borderRadius: 10, }}
          />

          <View style={{ backgroundColor: "#f0f0f0", borderRadius: 8, overflow: "hidden", marginBottom: 15 }}>
            <Picker
              selectedValue={selectedGroup}
              onValueChange={(itemValue) => setSelectedGroup(itemValue)}
            >
              <Picker.Item label="Select a group..." value="" color="gray" />
              {groups.map((group) => (
                <Picker.Item key={group.id} label={group.name} value={group.name} />
              ))}
            </Picker>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Select priority:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
              <Pressable
                onPress={() => setPriority(TaskPriority.LOW)}
                style={[styles.priorityContainer, { backgroundColor: priority === TaskPriority.LOW ? "green" : "#f0f0f0", borderBottomLeftRadius: 5, borderTopLeftRadius: 5 }]}
              >
                <Text style={{ color: priority === TaskPriority.LOW ? "white" : "black" }}>Low</Text>
              </Pressable>

              <Pressable
                onPress={() => setPriority(TaskPriority.MEDIUM)}
                style={[styles.priorityContainer, { backgroundColor: priority === TaskPriority.MEDIUM ? "orange" : "#f0f0f0", }]}
              >
                <Text style={{ color: priority === TaskPriority.MEDIUM ? "white" : "black" }}>Medium</Text>
              </Pressable>

              <Pressable
                onPress={() => setPriority(TaskPriority.HIGH)}
                style={[styles.priorityContainer, { backgroundColor: priority === TaskPriority.HIGH ? "red" : "#f0f0f0", borderBottomRightRadius: 5, borderTopRightRadius: 5 }]}
              >
                <Text style={{ color: priority === TaskPriority.HIGH ? "white" : "black" }}>High</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            {taskId ? (
              <Pressable
                onPress={() => handleAdd(false)}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Edit task</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  onPress={() => handleAdd(false)}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 5,
                    alignItems: "center",
                    marginVertical: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>Add task</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleAdd(true)}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: "bold" }}>Add this and another</Text>
                </Pressable>
              </>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    marginVertical: 10,
  },
  priorityContainer: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  }
});

export default HandleTaskCardBottomSheet;