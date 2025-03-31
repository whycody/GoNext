import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigation from "./screens/nav/RootNavigation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AuthProvider from "./utils/AuthProvider";

export default function App() {
  return (
    <>
      <StatusBar/>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <BottomSheetModalProvider>
            <NavigationContainer>
              <AuthProvider>
                <RootNavigation/>
              </AuthProvider>
            </NavigationContainer>
          </BottomSheetModalProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
