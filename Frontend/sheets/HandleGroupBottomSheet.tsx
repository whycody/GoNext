import React, { useState, useCallback, useRef, forwardRef, useEffect, useMemo } from "react";
import { Text, StyleSheet, View, Pressable, Platform } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants";
import SheetText, { SheetTextRef } from "../components/SheetTextInput";
import { useGroupsContext } from "../store/GroupsContext";

interface HandleGroupBottomSheetProps {
  groupId?: number;
  onGroupAdd: (name: string, icon: string, color: string, members: string[]) => void;
  onGroupEdit: (id: number, name: string, icon: string, color: string, members: string[]) => void;
  onChangeIndex?: (index: number) => void;
}

const useEmojiPicker = () => {
  const emojis = useMemo(
    () => ["💼", "🎉", "📚", "🚀", "❤️", "🌟", "🎨", "🎵", "⚽", "🍕", "🏡", "💰", "🏢", "💻"],
    []
  );

  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0]);

  const selectEmoji = useCallback((emoji: string) => {
    setSelectedEmoji(emoji);
  }, []);

  return { emojis, selectedEmoji, selectEmoji };
};

const HandleGroupBottomSheet = forwardRef<BottomSheetModal, HandleGroupBottomSheetProps>(
  ({ groupId, onGroupAdd, onGroupEdit, onChangeIndex }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { groups } = useGroupsContext();

    const nameInputRef = useRef<SheetTextRef>(null);
    const [name, setName] = useState("");
    const [selectedColor, setSelectedColor] = useState("#ff5733");
    const [members, setMembers] = useState<string[]>([]);
    const { emojis, selectedEmoji, selectEmoji } = useEmojiPicker();

    const colorOptions = ["#ff5733", "#33ff57", "#3357ff", "#ff33a8", "#040404", "#9632BF", "#53BFD4"];

    useEffect(() => {
      if (groupId) {
        const group = groups.find((g) => g.id === groupId);
        if (group) {
          setName(group.name);
          setSelectedColor(group.color);
          selectEmoji(group.icon);
          setMembers(group.membersIds);
        }
      } else {
        setName("");
        setSelectedColor("#ff5733");
        selectEmoji(emojis[0]);
        setMembers([]);
      }
    }, [groupId, groups, selectEmoji, emojis]);

    const handleAdd = (clearForm: boolean) => {
      if (!nameInputRef.current?.getWord() || !selectedEmoji || !selectedColor) return;
      if (groupId) {
        onGroupEdit(groupId, nameInputRef.current?.getWord(), selectedEmoji, selectedColor, members);
      } else {
        onGroupAdd(nameInputRef.current?.getWord(), selectedEmoji, selectedColor, members);
      }
      if (clearForm) {
        setName("");
        setSelectedColor("#ff5733");
        selectEmoji(emojis[0]);
        setMembers([]);
        nameInputRef.current?.focus();
      } else {
        (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      }
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
        <BottomSheetScrollView style={styles.root} scrollEnabled={false}>
          <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 16 }}>
            {groupId ? "Edit Group" : "Add New Group"}
          </Text>

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

          <View style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Select Group Color</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    width: 40,
                    height: 40,
                    margin: 4,
                    borderRadius: 20,
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 2 : 0,
                    borderColor: selectedColor === color ? colors.primary : "transparent",
                  }}
                />
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            {groupId ? (
              <Pressable
                onPress={() => handleAdd(false)}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Edit group</Text>
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
                  <Text style={{ color: "white", fontWeight: "bold" }}>Add Group</Text>
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

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      paddingHorizontal: MARGIN_HORIZONTAL,
      marginVertical: 10,
    },
  });

export default HandleGroupBottomSheet;