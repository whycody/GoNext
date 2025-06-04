import React, { useState, useCallback, forwardRef, useRef } from "react";
import { Text, StyleSheet, View, Pressable, Platform, Alert } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants";
import SheetText, { SheetTextRef } from "../components/SheetTextInput";
import { acceptGroupInvitation } from "../hooks/useApi";

interface AcceptInvitationBottomSheetProps {
  onAccept: (token: string) => void;
  onChangeIndex?: (index: number) => void;
}

const AcceptInvitationBottomSheet = forwardRef<BottomSheetModal, AcceptInvitationBottomSheetProps>(
  ({ onAccept, onChangeIndex }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const sheetRef = useRef<SheetTextRef>(null);

    const handleAcceptInvitation = async () => {
      const currentToken = sheetRef?.current?.getWord() || token;
      if (!currentToken) {
        Alert.alert("Error", "Please enter a valid invitation token.");
        return;
      }

      try {
        setLoading(true);
        const response = await acceptGroupInvitation(currentToken.trim());
        if (response && response.message) {
          Alert.alert("Success", response.message);
          onAccept(currentToken);
          setToken("");
          sheetRef?.current?.clearWord();
          (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
        } else if (response && response.error) {
          Alert.alert("Error", response.error);
        } else {
          Alert.alert("Error", "Failed to accept the invitation.");
        }
      } catch (error) {
        console.error("Error accepting invitation:", error);
        Alert.alert("Error", "An error occurred while accepting the invitation.");
      } finally {
        setLoading(false);
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
            Accept Group Invitation
          </Text>

          <SheetText
            ref={sheetRef}
            placeholder="Enter invitation token"
            value={token}
            onChangeText={setToken}
            style={{ marginBottom: 12, paddingVertical: 4, borderRadius: 10 }}
          />

          <Pressable
            onPress={handleAcceptInvitation}
            style={[{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 25,
            }, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Accept Invitation</Text>
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

export default AcceptInvitationBottomSheet;