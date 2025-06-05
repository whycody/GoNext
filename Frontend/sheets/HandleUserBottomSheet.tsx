import React, { forwardRef, useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants";


interface HandleUserBottomSheetProps {
  user: {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  groupId: number;
  onPromote: (userId: number) => void;
  onDemote: (userId: number) => void;
  onRemove: (userId: number) => void;
  onChangeIndex?: (index: number) => void;
}

const HandleUserBottomSheet = forwardRef<BottomSheetModal, HandleUserBottomSheetProps>(
  ({ user, groupId, onPromote, onDemote, onRemove, onChangeIndex }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

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
        <BottomSheetScrollView style={styles.root} scrollEnabled={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 19, fontWeight: "bold" }}>
              Manage User
              <Text style={{ fontSize: 17, marginLeft: 10, color: colors.primary, fontWeight: "bold" }}>
                {"  "}{user.name}
              </Text>
            </Text>
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", marginTop: 8 }}>Role:</Text>
            <Text>{user.isAdmin ? "Admin" : "Member"}</Text>
          </View>
          {user.isAdmin ? (
            <Pressable
              onPress={() => onDemote(user.id)}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Demote to Member</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => onPromote(user.id)}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Promote to Admin</Text>
              </Pressable>
              <Pressable
                onPress={() => onRemove(user.id)}
                style={{
                  backgroundColor: colors.error || "#e53935",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold"}}>Remove from Group</Text>
              </Pressable>
            </>
          )}
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
      paddingBottom: 30, 
    },
  });

export default HandleUserBottomSheet;