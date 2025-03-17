import { ScrollView, View, StyleSheet } from "react-native";
import HomeHeader from "../components/HomeHeader";
import CategoryItem from "../components/CategoryItem";
import { useState } from "react";

enum Categories {
  PRIORITY = 'Priorytet',
  GROUP = 'Grupa',
}

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(Categories.GROUP);

  return (
    <ScrollView style={{ flex: 1 }}>
      <HomeHeader style={{ paddingHorizontal: 20, paddingVertical: 30 }}/>
      <View style={styles.categoriesContainer}>
        <CategoryItem
          value={Categories.PRIORITY}
          selected={selectedCategory}
          onPress={() => setSelectedCategory(Categories.PRIORITY)}
        />
        <CategoryItem
          value={Categories.GROUP}
          selected={selectedCategory}
          onPress={() => setSelectedCategory(Categories.GROUP)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15
  }
});

export default HomeScreen;