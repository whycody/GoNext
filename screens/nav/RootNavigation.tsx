import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, StyleSheet } from "react-native";
import HomeScreen from "../HomeScreen";
import GroupsScreen from "../GroupsScreen";

const Tab = createBottomTabNavigator();

const RootNavigation = () => {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const iconSize = route.name === 'Home' ? 28 : 26;
          let iconName = route.name === 'Home' ? 'home' : 'view-grid';
          return (
            <MaterialCommunityIcons
              name={iconName}
              size={iconSize}
              style={!focused && { opacity: 0.6 }}
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
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 58,
    paddingBottom: 5,
    paddingTop: 8,
    paddingHorizontal: 20,
    borderTopWidth: 0,
  },
});

export default RootNavigation;