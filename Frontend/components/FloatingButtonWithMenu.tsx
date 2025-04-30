import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB } from "react-native-paper";

const FloatingButtonWithMenu = ({
  onCreate,
  onJoin,
  colors,
}: {
  onCreate: () => void;
  onJoin: () => void;
  colors: any;
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <FAB
        style={[styles.fab, { backgroundColor: colors.background }]}
        icon="plus"
        color={colors.primary}
        onPress={() => setMenuVisible(true)}
      />

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                onJoin();
              }}
            >
              <Text style={styles.menuItem}>Join Existing Group</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                onCreate();
              }}
            >
              <Text style={styles.menuItem}>Add New Group</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    elevation: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  menu: {
    backgroundColor: "white",
    padding: 15,
    borderTopLeftRadius: 16, 
    borderTopRightRadius: 16, 
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8, 
    opacity: 0.5,
  },
});

export default FloatingButtonWithMenu;