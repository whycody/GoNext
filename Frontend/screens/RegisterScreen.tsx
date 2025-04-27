import { View, Text, StyleSheet, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { FC, useEffect, useState } from "react";
import AuthTextInput from "../components/AuthTextInput";

type RegisterScreenProps = {
  register: (username: string, email: string, password: string) => Promise<void>;
  registerError: string | null;
}

const RegisterScreen: FC<RegisterScreenProps> = ({ register, registerError }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [warning, setWarning] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const filled = username.length > 0 && password.length > 0 && confirmPassword.length > 0 && email.length > 0;
  const nav = useNavigation();

  const handleRegisterPress = async () => {
    if (!filled || loading) return;

    if (!isValidPassword(password)) {
      setWarning('Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }


    if (password !== confirmPassword) {
      setWarning('Passwords do not match');
      return;
    }

    if (!isValidEmail(email)) {
      setWarning('Invalid email address');
      return;
    }

    setLoading(true);
    await register(username, email, password);
    setLoading(false);
  }

  const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    setWarning(registerError);
  }, [registerError]);

  useEffect(() => {
    setWarning(null);
  }, [username, email, password, confirmPassword]);

  return (
    <KeyboardAvoidingView style={styles.root}>
      <View style={{ flex: 0.4 }}/>
      <View style={{ justifyContent: 'center' }}>
        <Text style={styles.header}>Sign up</Text>
        <Text style={styles.subheader}>Create an account to increase your efficiency</Text>
      </View>
      <View style={styles.inputsContainer}>
        <AuthTextInput
          label={'Username'}
          value={username}
          editable={!loading}
          onChangeText={setUsername}
        />
        <AuthTextInput
          label={'Email'}
          value={email}
          editable={!loading}
          style={{ marginTop: 10 }}
          onChangeText={setEmail}
          textContentType={'emailAddress'}
        />
        <AuthTextInput
          label={'Password'}
          value={password}
          editable={!loading}
          style={{ marginTop: 10 }}
          onChangeText={setPassword}
          textContentType={'password'}
        />
        <AuthTextInput
          label={'Confirm password'}
          value={confirmPassword}
          editable={!loading}
          style={{ marginTop: 10 }}
          onChangeText={setConfirmPassword}
          textContentType={'password'}
        />
        <Text style={{ color: 'red', fontWeight: 'bold', marginTop: 10 }}>
          {warning}
        </Text>
      </View>
      <View style={{ flex: 1 }}/>
      <View style={{ flex: 0 }}>
        <View style={[styles.loginButton, !filled && { opacity: 0.5 }]}>
          {loading ?
            <ActivityIndicator size="small" color={colors.background} style={{ justifyContent: 'center' }}/> :
            <Text style={styles.loginButtonLabel} onPress={handleRegisterPress}>Create account</Text>
          }
        </View>
        <Text style={styles.registerButton} onPress={() => nav.goBack()}>Sign in</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    marginVertical: 20,
    marginTop: 50,
    marginHorizontal: MARGIN_HORIZONTAL,
  },
  header: {
    fontSize: 38,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.text,
    opacity: 0.8
  },
  inputsContainer: {
    marginTop: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
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
  textInput: {
    flex: 1,
    fontSize: 17,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 4,
    height: 40,
  },
  loginButtonLabel: {
    color: colors.background,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    padding: 20,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default RegisterScreen;