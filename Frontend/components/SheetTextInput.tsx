import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type SheetTextProps = {
  value: string;
  onChangeText: (text: string) => void;
  onTextRefresh?: (text: string) => void; 
  placeholder?: string;
  suggestions?: string[];
  style?: any;
  secureTextEntry?: boolean; 
  onSubmitEditing?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; 
};

export interface SheetTextRef {
  focus: () => void;
  clearWord: () => void;
  getWord: () => string;
}

const SheetText = forwardRef<SheetTextRef, SheetTextProps>(({
  value,
  onChangeText,
  placeholder,
  suggestions,
  style,
  secureTextEntry, 
  onSubmitEditing, 
  autoCapitalize = 'none', 
}, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [focused, setFocused] = useState(false);

  const [internalWord, setInternalWord] = useState(value);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setInternalWord(value);
  }, [value]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clearWord: () => {
        setInternalWord('');
        onChangeText('');
    },
    getWord: () => internalWord,
  }));

  useEffect(() => {
    if (focused && suggestions && internalWord.length > 0) { 
        const filteredSuggestions = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(internalWord.toLowerCase()) && suggestion.toLowerCase() !== internalWord.toLowerCase()
      ).slice(0, 3); 

      setCurrentSuggestions(filteredSuggestions);
    } else {
      setCurrentSuggestions([]); 
    }
  }, [internalWord, suggestions, focused]);


  const handleTextChange = (newWord: string) => {
    setInternalWord(newWord);
  };

  const handleBlur = () => {
    onChangeText(internalWord); 
    setFocused(false);
  };

  const handleFocus = () => {
    setFocused(true);
  }

  const handleSuggestionPress = (suggestion: string) => {
    setInternalWord(suggestion);
    onChangeText(suggestion); 
    setCurrentSuggestions([]);
    inputRef.current?.blur(); 
  };

  const InputComponent = Platform.OS === 'ios' ? BottomSheetTextInput : TextInput;

  return (
    <View>
      <View style={[styles.inputContainer, style]}>
        <InputComponent
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={colors.placeholder} 
          cursorColor={colors.primary}
          autoCapitalize={autoCapitalize} 
          autoCorrect={!secureTextEntry} 
          placeholder={placeholder}
          value={internalWord}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          onFocus={handleFocus} 
          secureTextEntry={secureTextEntry} 
          onSubmitEditing={onSubmitEditing} 
        />
      </View>
      {currentSuggestions.length > 0 && ( 
        <FlatList
          data={currentSuggestions}
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(item, index) => `${item}-${index}`} 
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSuggestionPress(item)}>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{item}</Text> 
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
    backgroundColor: colors.inputBackground || colors.background,
    borderRadius: 10, 
  },
  input: {
    flex: 1,
    fontFamily: `Montserrat-Regular`, 
    color: colors.text || colors.primary300, 
    paddingHorizontal: MARGIN_HORIZONTAL,
    fontSize: 16,
    height: 48, 
  },
  suggestionsList: {
    backgroundColor: colors.card, 
    borderRadius: 5,
    marginTop: Platform.OS === 'ios' ? 0 : -10, 
    marginHorizontal: 5,
    maxHeight: 150, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: MARGIN_HORIZONTAL,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: 15,
    color: colors.text,
  },
});

export default SheetText;
