import { FlatList, StyleSheet, View } from "react-native";
import GroupsHeader from "../components/GroupsHeader"; 
import GroupsView from "../components/GroupsView"; 
import { useGroups } from "../hooks/useGroups"; 
import { useTheme } from "@react-navigation/native";

const GroupsScreen = () => {
  const groups = useGroups(); 
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleGroupPress = (id: number) => {
    console.log("Group pressed:", id);
  };

  const handleGroupLongPress = (id: number) => {
    console.log("Group long pressed:", id);
  };

  return (
    <View style={styles.container}>
      <GroupsHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 }} /> 
      <FlatList
        style={{ marginTop: 2 }}
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <GroupsView
            index={index}
            group={item}
            onGroupPress={handleGroupPress}
            onLongPress={handleGroupLongPress}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    separator: {
      height: 1, 
      backgroundColor: colors.background,
    },
  });

export default GroupsScreen;