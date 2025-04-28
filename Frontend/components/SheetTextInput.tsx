import React, { FC, useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { useTheme } from "@react-navigation/native";
import { View, StyleSheet, Platform, TextInput, FlatList, Pressable } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type SheetTextProps = {
  value: string; 
  onChangeText: (text: string) => void; 
  onTextRefresh: (text: string) => void;
  placeholder?: string;
  suggestions?: string[];
  style?: any;
};

const SheetText: FC<SheetTextProps> = forwardRef(({ value, onChangeText, onTextRefresh, placeholder,  suggestions, style }, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [focused, setFocused] = useState(false);

  const [internalWord, setInternalWord] = useState(value);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setInternalWord(value);
  }, [value]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clearWord: () => setInternalWord(''),
    getWord: () => internalWord,
  }));

  useEffect(() => {
    const filteredSuggestions = suggestions ? suggestions.filter((suggestion) =>
      suggestion.toLowerCase().startsWith(internalWord.toLowerCase()) && suggestion.toLowerCase() !== internalWord.toLowerCase()
    ).slice(0, 2) : [];

    setCurrentSuggestions(filteredSuggestions);
  }, [internalWord, suggestions]);


  const handleTextChange = (newWord: string) => {
    setInternalWord(newWord);
  };

  const handleBlur = () => {
    onChangeText(internalWord);
    setFocused(false);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInternalWord(suggestion);
    setCurrentSuggestions([]);
    onChangeText(suggestion);
  };

  return (
    <View>
      <View style={[styles.inputContainer, style]}>
        {Platform.OS == 'ios' ?
          <BottomSheetTextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={colors.primary}
            autoCapitalize={'none'}
            autoCorrect={true}
            placeholder={placeholder}
            value={internalWord}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
          /> :
          <TextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={colors.primary}
            autoCorrect={true}
            autoCapitalize={'none'}
            textContentType={'none'}
            placeholder={placeholder}
            value={internalWord}
            onFocus={setFocused}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
          />
        }
      </View>
      {currentSuggestions.length > 0 && focused && (
        <FlatList
          data={currentSuggestions}
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSuggestionPress(item)}>
              <View style={styles.suggestionItem}>
              </View>
            </Pressable>
          )}
          style={styles.suggestionsList}
        />
      )}
    </View>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    fontFamily: `Montserrat-Regular`,
    color: colors.primary300,
    paddingLeft: MARGIN_HORIZONTAL,
    fontSize: 16,
    height: 42,
  },
  suggestionsList: {
    marginTop: 10,
    borderColor: colors.border,
  },
  suggestionItem: {
    marginTop: 5,
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.primary300,
  },
});

export default SheetText;
