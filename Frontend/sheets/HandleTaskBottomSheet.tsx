import React, { useState, useCallback, useRef, forwardRef } from "react";
import { Text, TextInput, Platform, StyleSheet, Button, View, Pressable } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants";
import SheetText, { SheetTextRef } from "../components/SheetTextInput";
import { Picker } from "@react-native-picker/picker"; //you need to run npm install @react-native-picker/picker
import { RadioButton } from 'react-native-paper';

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

    const groups = ["Personal", "Znajomi", "Sport", "Rodzina", "Praca"]; //hardcoded temporary


    const handleAdd = (clearForm: boolean) => {
      if (!title) return;
      onTaskAdd(title, description, priority);
      if (clearForm) {
        setTitle(""); 
        setDescription(""); 
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
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            {taskId ? 'Edit task' : 'Add task'}
          </Text>

          <SheetText
            ref={titleInputRef}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            style={{ borderBottomWidth: 1, marginBottom: 12, paddingVertical: 8 }}
          />

          <SheetText
            ref={descriptionInputRef}
            placeholder="Task description"
            value={description}
            onChangeText={setDescription}
            style={{ borderBottomWidth: 1, marginBottom: 12, paddingVertical: 8 }}
          />

          <View style={{ backgroundColor: "#f0f0f0", borderRadius: 8, overflow: "hidden", marginBottom: 15 }}>
            <Picker
              selectedValue={selectedGroup}
              onValueChange={(itemValue) => setSelectedGroup(itemValue)}
            >
              <Picker.Item label="Select a group..." value="" color="gray" />
              {groups.map((group, index) => (
                <Picker.Item key={index} label={group} value={group} />
              ))}
            </Picker>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Select priority:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Pressable
                onPress={() => setPriority(TaskPriority.LOW)}
                style={{
                  flex: 1,
                  backgroundColor: priority === TaskPriority.LOW ? "green" : "#f0f0f0",
                  paddingVertical: 10,
                  marginHorizontal: 5,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: priority === TaskPriority.LOW ? "white" : "black" }}>Low</Text>
              </Pressable>

              {/* Medium Priority */}
              <Pressable
                onPress={() => setPriority(TaskPriority.MEDIUM)}
                style={{
                  flex: 1,
                  backgroundColor: priority === TaskPriority.MEDIUM ? "orange" : "#f0f0f0",
                  paddingVertical: 10,
                  marginHorizontal: 5,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: priority === TaskPriority.MEDIUM ? "white" : "black" }}>Medium</Text>
              </Pressable>

              {/* High Priority */}
              <Pressable
                onPress={() => setPriority(TaskPriority.HIGH)}
                style={{
                  flex: 1,
                  backgroundColor: priority === TaskPriority.HIGH ? "red" : "#f0f0f0",
                  paddingVertical: 10,
                  marginHorizontal: 5,
                  borderRadius: 8,
                  alignItems: "center",
                }}
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
                    borderRadius: 8,
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>Add task</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleAdd(true)}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>Add this and another</Text>
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
});

export default HandleTaskCardBottomSheet;