import React, { useState, useRef, forwardRef } from "react";
import { Text, TextInput, View, Button } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";

interface HandleTaskCardBottomSheetProps {
    onTaskAdd: (title: string, description: string, priority: "low" | "medium" | "high", group: string) => void;
}

const HandleTaskCardBottomSheet = forwardRef<BottomSheetModal, HandleTaskCardBottomSheetProps>(
    ({ onTaskAdd }, ref) => {
      const { colors } = useTheme();
  
      const titleInputRef = useRef<TextInput>(null);
      const descriptionInputRef = useRef<TextInput>(null);
  
      const [title, setTitle] = useState("");
      const [description, setDescription] = useState("");
      const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
      const [group, setGroup] = useState("");
  
      const handleAdd = () => {
        if (!title || !description || !group) return; 
        onTaskAdd(title, description, priority, group);
        setTitle("");
        setDescription("");
        setGroup("");
      };
  
      return (
        <View style={{ padding: 20, backgroundColor: colors.background }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Add New Task</Text>

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

          <TextInput
            placeholder="Task Group"
            value={group}
            onChangeText={setGroup}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />

          <Button title="Add Task" onPress={handleAdd} />
        </View>
      );
    }
);

export default HandleTaskCardBottomSheet;