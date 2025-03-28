import { StyleSheet, Text } from "react-native";
import { FC } from "react";
import { useTheme } from "@react-navigation/native";

type CategoryItemProps = {
  value: string;
  selected: string;
  onPress: () => void;
}

const CategoryItem: FC<CategoryItemProps> = ({ value, selected, onPress }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Text onPress={onPress} style={[styles.item, selected === value && styles.selectedItem]}>
      {value}
    </Text>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  item: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginRight: 5,
    borderRadius: 4,
    color: colors.border,
    borderColor: colors.border,
  },
  selectedItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.card,
    opacity: 1
  }
})

export default CategoryItem;