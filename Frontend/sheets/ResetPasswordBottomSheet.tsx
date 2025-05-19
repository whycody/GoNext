import React, { useState, useCallback, useRef, forwardRef } from "react";
import { Text, StyleSheet, View, Pressable, Platform, Alert } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { FullWindowOverlay } from "react-native-screens";
import { MARGIN_HORIZONTAL } from "../src/constants"; 
import SheetText, { SheetTextRef } from "../components/SheetTextInput"; 

interface ResetPasswordBottomSheetProps {
  onPasswordReset: (newPassword: string) => void; 
  onChangeIndex?: (index: number) => void;
}

const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 8) {
    return "Your password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Your password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Your password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Your password must contain at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Your password must contain at least one special character.";
  }
  return null; 
};

const ResetPasswordBottomSheet = forwardRef<BottomSheetModal, ResetPasswordBottomSheetProps>(
  ({ onPasswordReset, onChangeIndex }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const newPasswordInputRef = useRef<SheetTextRef>(null);
    const confirmPasswordInputRef = useRef<SheetTextRef>(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [passwordStrengthError, setPasswordStrengthError] = useState<string | null>(null);

    const handleReset = () => {
      setError(null);
      setPasswordStrengthError(null);

      if (!newPassword) {
        setError("New password cannot be empty.");
        newPasswordInputRef.current?.focus();
        return;
      }

      const strengthValidationError = validatePasswordStrength(newPassword);
      if (strengthValidationError) {
        setPasswordStrengthError(strengthValidationError);
        newPasswordInputRef.current?.focus();
        return;
      }

      if (!confirmPassword) {
        setError("Password confirmation cannot be empty.");
        confirmPasswordInputRef.current?.focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        setConfirmPassword("");
        confirmPasswordInputRef.current?.focus();
        return;
      }

      onPasswordReset(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success!", "Password has been reset.");
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
            setNewPassword("");
            setConfirmPassword("");
            setError(null);
            setPasswordStrengthError(null);
          } else if (index >= 0) {
            setTimeout(() => newPasswordInputRef.current?.focus(), 100);
          }
        }}
        containerComponent={renderContainerComponent}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      >
        <BottomSheetScrollView style={styles.root} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Reset password 🔐</Text>

          <SheetText
            ref={newPasswordInputRef}
            placeholder="New password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (passwordStrengthError) setPasswordStrengthError(null); 
              if (error) setError(null); 
            }}
            secureTextEntry
            style={styles.input}
          />
          {passwordStrengthError && <Text style={styles.errorText}>{passwordStrengthError}</Text>}

          <SheetText
            ref={confirmPasswordInputRef}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={(text) => {
                setConfirmPassword(text);
                if (error) setError(null); 
            }}
            secureTextEntry
            style={styles.input}
            onSubmitEditing={handleReset}
          />
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
      paddingVertical: 12,
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

export default ResetPasswordBottomSheet;
