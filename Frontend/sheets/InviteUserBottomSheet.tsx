import React, { useState, useCallback, forwardRef } from "react";
import { Text, StyleSheet, View, Pressable, Platform, Alert } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants";
import SheetText, { SheetTextRef } from "../components/SheetTextInput";
import { createGroupInvitation } from "../hooks/useApi"; 

interface InviteUserBottomSheetProps {
  onSendInvitation: (email: string) => void;
  onChangeIndex?: (index: number) => void;
  groupName: string | null;
  groupId: number | null;
}

const InviteUserBottomSheet = forwardRef<BottomSheetModal, InviteUserBottomSheetProps>(
  ({ onSendInvitation, onChangeIndex, groupName, groupId }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendInvitation = async () => { 
        if (!email) {
          Alert.alert("Error", "Please enter a valid email.");
          return;
        }
  
        if (!groupId) {
          Alert.alert("Error", "Group ID is missing.");
          return;
        }
  
        try {
          setLoading(true);
          const response = await createGroupInvitation(groupId, email); 
          console.log("Backend response:", response); 
          if (response) {
            Alert.alert("Success", "Invitation sent successfully!");
            onSendInvitation(email);
            setEmail("");
            (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
          } else {
            Alert.alert("Error", "Failed to send the invitation.");
          }
        } catch (error) {
          console.error("Error sending invitation:", error);
          Alert.alert("Error", "An error occurred while sending the invitation.");
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
          Invite user to {groupName ? `${groupName}` : "this group"}
          </Text>

          <SheetText
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            style={{ marginBottom: 12, paddingVertical: 4, borderRadius: 10 }}
          />

          <Pressable
            onPress={handleSendInvitation}
            style={[{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 25,
            }, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Send Invitation Link</Text>
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

export default InviteUserBottomSheet;