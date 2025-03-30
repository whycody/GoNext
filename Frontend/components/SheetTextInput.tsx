import React, { FC, useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { useTheme } from "@react-navigation/native";
import { View, StyleSheet, Platform, TextInput } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import debounce from "lodash.debounce";

type SheetTextProps = {
  value: string; 
  onChangeText: (text: string) => void; 
  placeholder?: string;
  style?: any;
};

export type SheetTextRef = {
  focus: () => void;
  onWordRefresh: (word: string) => void;
  clearWord: () => void;
  getWord: () => string;
};

const SheetText = forwardRef<SheetTextRef, SheetTextProps>(
  ({ value, onChangeText, placeholder, style }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<any>(null);

    const [internalWord, setInternalWord] = useState(value);

    useEffect(() => {
      setInternalWord(value);
    }, [value]);
  
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clearWord: () => setInternalWord(''),
      getWord: () => internalWord,
    }));
  
  
    const debouncedOnWordChange = useCallback(debounce(onChangeText, 300), []);
  
    const handleTextChange = (newWord: string) => {
      setInternalWord(newWord);
      debouncedOnWordChange(newWord);
    };
  
    const handleBlur = () => {
      onChangeText(internalWord);
      setFocused(false);
    };
  

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
            value={internalWord}
            onChangeText={onChangeText}
            onBlur={handleBlur}
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
            value={internalWord}
            onFocus={() => setFocused()}
            onChangeText={onChangeText}
            onBlur={handleBlur}
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