import React, { useState, useCallback, useRef, forwardRef } from "react";
import { Text, TextInput, Platform, StyleSheet, Button, View } from "react-native";
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
    };

    const renderBackdrop = useCallback((props: any) =>
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

    const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
      <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={["45%", "65%"]}
        backdropComponent={renderBackdrop}
        onChange={(index: number) => onChangeIndex?.(index)}
        containerComponent={renderContainerComponent}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      >
        <BottomSheetScrollView style={styles.root}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            {taskId ? 'Edit task' : 'Add task'}
          </Text>

          <SheetText
            ref={titleInputRef}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />

          <SheetText
            ref={descriptionInputRef}
            placeholder="Task Description"
            value={description}
            onChangeText={setDescription}
            style={{ borderBottomWidth: 1, marginBottom: 10}}
          />

          <View style={{ backgroundColor: "#f0f0f0", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
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

          <View style={{ marginBottom: 10 }}>
            <Text style={{ marginBottom: 5 }}>Select Priority:</Text>
            <RadioButton.Group onValueChange={newValue => setPriority(newValue)} value={priority}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <RadioButton value="minor" color="green"/><Text>Minor</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton value="moderate" color="yellow" /><Text>Moderate</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton value="critical" color="red" /><Text>Critical</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>
          
          <View style={{ marginBottom: 10 }}>
            <Button title="Add Task" onPress={() => handleAdd(false)} />
          </View>
          <View>
            <Button title="Add This and Another" onPress={() => handleAdd(true)} />
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