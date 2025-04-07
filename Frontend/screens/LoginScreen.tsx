import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { FC, useEffect, useState } from "react";

type LoginProps = {
  login: (username: string, password: string) => void
}

const LoginScreen: FC<LoginProps> = ({ login }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [warning, setWarning] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const filled = username.length > 0 && password.length > 0;

  const handleLoginPress = async () => {
    if (!filled) return;
    login(username, password);
    setWarning('Invalid username or password');
  }

  useEffect(() => {
    setWarning(null);
  }, [username, password]);

  return (
    <KeyboardAvoidingView style={styles.root}>
      <View style={{ flex: 0.4 }}/>
      <View style={{ justifyContent: 'center' }}>
        <Text style={styles.header}>GoNext</Text>
        <Text style={styles.subheader}>Realize your tasks in a better way</Text>
      </View>
      <View style={styles.inputsContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.textInput}
          cursorColor={colors.primary}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.textInput}
          cursorColor={colors.primary}
          textContentType={'password'}
          secureTextEntry={true}
        />
        <Text style={{ color: 'red', fontWeight: 'bold', marginTop: 10 }}>
          {warning}
        </Text>
      </View>
      <View style={{ flex: 1 }}/>
      <View style={{ flex: 0 }}>
        <Text style={[styles.loginButton, !filled && { opacity: 0.5 }]} onPress={handleLoginPress}>Log in</Text>
        <Text style={styles.registerButton}>Create new account</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    marginVertical: 20,
    marginHorizontal: MARGIN_HORIZONTAL
  },
  header: {
    fontSize: 38,
    color: colors.primary,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.text,
    opacity: 0.8
  },
  inputsContainer: {
    marginTop: 50,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
  },
  textInput: {
    marginTop: 5,
    paddingHorizontal: MARGIN_HORIZONTAL,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  loginButton: {
    backgroundColor: colors.primary,
    color: colors.background,
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default LoginScreen;