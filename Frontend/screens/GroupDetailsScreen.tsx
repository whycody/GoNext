import { useRoute, useTheme } from "@react-navigation/native";
import { Text, View, StyleSheet } from "react-native";

type GroupDetailsProps = {
  groupId: string;
};

const GroupDetailsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const groupId = (route.params as GroupDetailsProps)?.groupId || 1;

  return (
    <View>
      <Text>Group details screen {groupId}</Text>
    </View>
  )
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary
  }
});

export default GroupDetailsScreen;