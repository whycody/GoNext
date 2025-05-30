import React, { useCallback, forwardRef } from "react";
import { Text, StyleSheet, View, Pressable, Platform } from "react-native";
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
        <BottomSheetScrollView style={styles.root} scrollEnabled={false}>
          <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 16 }}>
            Manage User
          </Text>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold" }}>Name:</Text>
            <Text>{user.name}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 8 }}>Email:</Text>
            <Text>{user.email}</Text>
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
                <Text style={{ color: "white", fontWeight: "bold", marginBottom: 20 }}>Remove from Group</Text>
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