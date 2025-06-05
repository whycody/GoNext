import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { FC } from "react";

type SettingsHeaderProps = {
  style?: any;
};

const SettingsHeader: FC<SettingsHeaderProps> = ({ style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.header}>
        Adjust your <Text style={{ fontStyle: "italic", color: colors.primary }}>settings</Text>
      </Text>
      <Text style={styles.subheader}>
        Personalize your experience. Make the app work for you!
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

export default SettingsHeader;
