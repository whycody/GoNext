import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.root}>
        <Text style={styles.header}>Let's do some <Text style={{ fontStyle: 'italic', color: colors.primary }}>stuff</Text> today</Text>
        <Text style={styles.subheader}>Take a look on your current tasks. It's a perfect moment to do something!</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
  },
  subheader: {
    fontSize: 14,
    opacity: 0.6,
    color: colors.text,
  }
});

export default HomeScreen;