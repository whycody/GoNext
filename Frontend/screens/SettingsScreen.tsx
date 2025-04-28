import { View, Text, Button } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../utils/AuthProvider";

const SettingsScreen = () => {

  const authContext = useContext(AuthContext);

  const logout = async () => {
    const res = await authContext?.logout();
  }

  return (
    <View>
      <Text>Settings Screen</Text>
      <Button title={'Wyloguj'} onPress={logout} />
    </View>
  );
}

export default SettingsScreen;