import React, { useState, useCallback, useRef, forwardRef } from "react";
import { Text, StyleSheet, View, Pressable, Platform, Alert } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants"; 
import SheetText, { SheetTextRef } from "../components/SheetTextInput";
import { resetPassword } from "../hooks/useApi";

interface ChangePasswordBottomSheetProps {
  onChangeIndex?: (index: number) => void;
}

const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email nie może być pusty.";
  }
  if (!emailRegex.test(email)) {
    return "Podaj poprawny adres e-mail.";
  }
  return null;
};

const ChangePasswordBottomSheet = forwardRef<BottomSheetModal, ChangePasswordBottomSheetProps>(
  ({ onChangeIndex }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const emailInputRef = useRef<SheetTextRef>(null);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [emailValidationError, setEmailValidationError] = useState<string | null>(null);

    const handleReset = async () => {
      const currentEmail = emailInputRef?.current?.getWord() || "";
      setError(null);
      setEmailValidationError(null);

      if (!currentEmail) {
        setError("Email cannot be empty.");
        emailInputRef.current?.focus();
        return;
      }

      const emailValidationError = validateEmail(currentEmail);

      if (emailValidationError) {
        setEmailValidationError(emailValidationError);
        emailInputRef.current?.focus();
        return;
      }

      const res = await resetPassword(currentEmail);
      console.log(res);
      setEmail("");

      Alert.alert("Success!", "Password has been reset. Check your email for further instructions.");
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
        onChange={(index: number) => {
          onChangeIndex?.(index);
          if (index === -1) {
            setEmail("");
            setError(null);
            setEmailValidationError(null);
          } else if (index >= 0) {
            setTimeout(() => emailInputRef.current?.focus(), 100);
          }
        }}
        containerComponent={renderContainerComponent}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      >
        <BottomSheetScrollView style={styles.root} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Reset password 🔐</Text>

          <SheetText
            ref={emailInputRef}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null); 
            }}
            style={styles.input}
          />
          {emailValidationError && <Text style={styles.errorText}>{emailValidationError}</Text>}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? colors.border : colors.primary },
              ]}
            >
              <Text style={styles.buttonText}>Reset password</Text>
            </Pressable>
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
    },
    contentContainer: { 
        paddingVertical: 20, 
    },
    title: {
      fontSize: 19,
      fontWeight: "bold",
      marginBottom: 20,
      color: colors.text,
    },
    input: {
      marginBottom: 8, 
      paddingVertical: 5,
      borderRadius: 10,
    },
    errorText: {
      color: colors.notification, 
      marginBottom: 12, 
      fontSize: 12, 
      textAlign: 'left', 
      paddingHorizontal: 4, 
    },
    buttonContainer: {
      marginTop: 20,
      marginBottom: Platform.OS === 'ios' ? 30 : 20, 
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default ChangePasswordBottomSheet;