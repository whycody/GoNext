import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GroupLongPressMenu = ({
  visible,
  onClose,
  onGenerateInvitationLink,
  onEditGroup,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onGenerateInvitationLink: () => void;
  onEditGroup: () => void;
  colors: any;
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu}>
          <TouchableOpacity
            onPress={() => {
              onClose();
              onGenerateInvitationLink();
            }}
          >
            <Text style={styles.menuItem}>Generate Invitation Link</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            onPress={() => {
              onClose();
              onEditGroup();
            }}
          >
            <Text style={styles.menuItem}>Edit Group</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default GroupLongPressMenu;