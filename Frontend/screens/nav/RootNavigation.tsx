import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text } from "react-native";
import HomeScreen from "../HomeScreen";
import GroupsScreen from "../GroupsScreen";
import SettingsScreen from "../SettingsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TaskViewScreen from "../TaskViewScreen";
import { useTheme } from "@react-navigation/native";
import GroupDetailsScreen from "../GroupDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const RootNavigation = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator initialRouteName="RootNavigation" screenOptions={{ headerShown: false, navigationBarColor: colors.card }}>
      <Stack.Screen name="RootNavigation" component={TabNavigation} />
      <Stack.Screen name="TaskView" component={TaskViewScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
    </Stack.Navigator>
  );
}

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const iconSize = route.name === 'Home' ? 28 : 26;
          let iconName = route.name === 'Home' ? 'home' : route.name === 'Groups' ? 'account-group' : 'account-cog';
          if (!focused) iconName += '-outline';
          return (
            <MaterialCommunityIcons
              name={iconName}
              size={iconSize}
              style={!focused && { opacity: 0.5 }}
              color={color}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={[{ color, fontSize: 12 }, focused ? { fontWeight: 'bold' } : { opacity: 0.6 }]}>
            {route.name}
          </Text>
        ),
        tabBarStyle: styles.tabBarStyle,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 58,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 20,
    borderTopWidth: 0,
  },
});

export default RootNavigation;