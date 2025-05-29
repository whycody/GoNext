import { Member } from "../types/Group";
import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

type UserViewType = {
  member: Member
}

const UserView: FC<UserViewType> = ({ member }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  return (
    <View style={styles.root}>
      <Ionicons name={'person'} size={24} color={colors.text} />
      <View style={styles.textContainer}>
        <Text style={styles.header}>{member.username}</Text>
        <Text>{member.role}</Text>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: MARGIN_HORIZONTAL,
    backgroundColor: 'white',
    marginBottom: 2,
  },
  textContainer: {
    marginHorizontal: MARGIN_HORIZONTAL
  },
  header: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.primary,
  },
  subheader: {}
});

export default UserView;