import { FC, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";

type AuthTextInputProps = {
  label: string;
  value: string;
  style?: TextInputProps['style'];
  onChangeText: (text: string) => void;
  textContentType?: TextInputProps['textContentType'];
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'textContentType'>;

const AuthTextInput: FC<AuthTextInputProps> = ({ label, value, style, onChangeText, textContentType, ...props }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = textContentType === 'password';

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.textInputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          textContentType={textContentType}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          cursorColor={colors.primary}
          style={{ flex: 1, paddingVertical: 12 }}
          {...props}
        />
        {isPassword && (
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            style={styles.icon}
            color={colors.text}
            onPress={() => setShowPassword((prev) => !prev)}
          />
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  textInputContainer: {
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  icon: {
    padding: 5,
    paddingRight: 0
  }
});

export default AuthTextInput;