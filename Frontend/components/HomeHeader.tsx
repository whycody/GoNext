import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { FC } from "react";

type HomeHeaderProps = {
  style?: any;
}

const HomeHeader: FC<HomeHeaderProps> = ({ style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.header}>Let's do some <Text
        style={{ fontStyle: 'italic', color: colors.primary }}>stuff</Text> today</Text>
      <Text style={styles.subheader}>Take a look on your current tasks. It's a perfect moment to do something!</Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.card,
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

export default HomeHeader;