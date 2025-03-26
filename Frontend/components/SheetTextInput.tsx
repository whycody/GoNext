import React, { FC, forwardRef, useImperativeHandle, useRef } from "react";
import { useTheme } from "@react-navigation/native";
import { View, StyleSheet, Platform, TextInput } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type SheetTextProps = {
  value: string; 
  onChangeText: (text: string) => void; 
  placeholder?: string;
  style?: any;
};

export type SheetTextRef = {
  focus: () => void;
  clearWord: () => void;
  getWord: () => string;
};

const SheetText = forwardRef<SheetTextRef, SheetTextProps>(
  ({ value, onChangeText, placeholder, style }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const inputRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clearWord: () => onChangeText(""),
      getWord: () => value,
    }));

    return (
      <View style={[styles.inputContainer, style]}>
        {Platform.OS === "ios" ? (
          <BottomSheetTextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={colors.primary}
            autoCapitalize={"none"}
            autoCorrect={true}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
          />
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={colors.primary}
            autoCorrect={true}
            autoCapitalize={"none"}
            textContentType={"none"}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
          />
        )}
      </View>
    );
  }
);

const getStyles = (colors: any) => StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontFamily: `Montserrat-Regular`,
    color: colors.primary300,
    paddingLeft: MARGIN_HORIZONTAL,
    backgroundColor: colors.background,
    fontSize: 16,
    height: 42,
  },
});

export default SheetText;