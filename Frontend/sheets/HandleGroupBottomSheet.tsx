import React, { useState, useCallback, useRef, forwardRef } from "react";
import { Text, StyleSheet, View, Pressable, Platform } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants"; // Import MARGIN_HORIZONTAL
import SheetText, { SheetTextRef } from "../components/SheetTextInput";
import useEmojiPicker from "../hooks/useEmojiPicker";



interface HandleGroupBottomSheetProps {
  onGroupAdd: (name: string, icon: string, color: string, members: string[]) => void;
  onChangeIndex?: (index: number) => void;
}

const HandleGroupBottomSheet = forwardRef<BottomSheetModal, HandleGroupBottomSheetProps>(
  ({ onGroupAdd, onChangeIndex }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const nameInputRef = useRef<SheetTextRef>(null);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#ff5733");
    const [members, setMembers] = useState<string[]>([]);

    const { emojis, selectedEmoji, selectEmoji } = useEmojiPicker();

    const handleAdd = () => {
        if (!name || !selectedEmoji || !color) return;
        onGroupAdd(name, selectedEmoji, color, members);
        setName("");
        selectEmoji(emojis[0]); 
        setColor("#ff5733");
        setMembers([]);
        (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      };

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
      []
    );

    const renderContainerComponent =
      Platform.OS === "ios"
        ? useCallback(({ children }: any) => <FullWindowOverlay>{children}</FullWindowOverlay>, [])
        : undefined;

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
          <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 16 }}>Add New Group</Text>

          <SheetText
            ref={nameInputRef}
            placeholder="Group name"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: 12, paddingVertical: 4, borderRadius: 10 }}
          />

          <View style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Select Group Icon</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {emojis.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => selectEmoji(emoji)}
                  style={{
                    padding: 8,
                    margin: 4,
                    borderRadius: 8,
                    backgroundColor: selectedEmoji === emoji ? colors.primary : colors.card,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <SheetText
            placeholder="Group color (e.g., #ff5733)"
            value={color}
            onChangeText={setColor}
            style={{ marginBottom: 12, paddingVertical: 4, borderRadius: 10 }}
          />

          <SheetText
            placeholder="Members (comma-separated IDs)"
            value={members.join(", ")}
            onChangeText={(text) => setMembers(text.split(",").map((id) => id.trim()))}
            style={{ marginBottom: 12, paddingVertical: 4, borderRadius: 10 }}
          />

          <Pressable
            onPress={handleAdd}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Add Group</Text>
          </Pressable>
          <Pressable
            onPress={() => handleAdd(true)}
            style={{
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 15,
            }}
        >
            <Text style={{ color: colors.primary, fontWeight: "bold" }}>Add this and another</Text>
        </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      paddingHorizontal: MARGIN_HORIZONTAL, 
      marginVertical: 10, 
    },
  });

export default HandleGroupBottomSheet;