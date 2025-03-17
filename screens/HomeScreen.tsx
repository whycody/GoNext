import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.root}>
        <Text style={styles.header}>Let's do some <Text style={{ color: colors.primary}}>stuff</Text>!</Text>
        <Text style={styles.subheader}>Take a look on your current tasks. It's perfect time to do some tasks!</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
  },
  subheader: {
    fontSize: 15,
    opacity: 0.6,
    color: colors.text,
  }
});

export default HomeScreen;