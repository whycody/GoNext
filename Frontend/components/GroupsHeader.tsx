import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { FC } from "react";

type GroupsHeaderProps = {
  style?: any;
};

const GroupsHeader: FC<GroupsHeaderProps> = ({ style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.header}>
        Manage your <Text style={{ fontStyle: "italic", color: colors.primary }}>groups</Text> today
      </Text>
      <Text style={styles.subheader}>
        Explore and organize your groups. It's a great time to collaborate!
      </Text>
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      backgroundColor: colors.card,
    },
    header: {
      fontSize: 25,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    subheader: {
      fontSize: 14,
      opacity: 0.6,
      color: colors.text,
    },
  });

export default GroupsHeader;