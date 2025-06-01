import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigation from "./screens/nav/RootNavigation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider from "./utils/AuthProvider";
import { TaskItemsProvider } from "./store/TaskItemsContext";
import { GroupsProvider } from "./store/GroupsContext";

export default function App() {
  return (
    <>
      <StatusBar/>
      <SafeAreaProvider>
        <NavigationContainer>
          <GestureHandlerRootView>
            <BottomSheetModalProvider>
              <AuthProvider>
                <GroupsProvider>
                  <TaskItemsProvider>
                    <SafeAreaView style={styles.container}>
                      <RootNavigation/>
                    </SafeAreaView>
                  </TaskItemsProvider>
                </GroupsProvider>
              </AuthProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </NavigationContainer>
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
