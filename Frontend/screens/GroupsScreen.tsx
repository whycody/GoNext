import { FlatList, StyleSheet, View } from "react-native";
import GroupsHeader from "../components/GroupsHeader";
import GroupsView from "../components/GroupsView";
import { useGroupStats } from "../hooks/useGroupStats";
import { useTheme } from "@react-navigation/native";
import { useState, useRef } from "react";
import HandleGroupBottomSheet from "../sheets/HandleGroupBottomSheet";
import FloatingButtonWithMenu from "../components/FloatingButtonWithMenu";
import GroupLongPressMenu from "../components/GroupLongPressMenu";
import InvitationLinkBottomSheet from "../sheets/InvitationLinkBottomSheet";
import { generateGroupInvitationLink } from "../hooks/useApi";

const GroupsScreen = () => {
  const groups = useGroupStats();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [longPressMenuVisible, setLongPressMenuVisible] = useState(false);
  const handleGroupBottomSheetRef = useRef<BottomSheetModal>(null);
  const invitationLinkSheetRef = useRef<BottomSheetModal>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [invitationLoading, setInvitationLoading] = useState(false);

  const handleGroupAdd = (name: string, icon: string, color: string, members: string[]) => {
    console.log("New group added:", { name, icon, color, members });
  };

  const handleGroupEdit = (id: number, name: string, icon: string, color: string, members: string[]) => {
    console.log("Group edited:", { id, name, icon, color, members });
  };

  const handleGroupLongPress = (id: number) => {
    setSelectedGroupId(id);
    setLongPressMenuVisible(true);
  };

  const handleGenerateInvitationLink = async () => {
    if (selectedGroupId !== null) {
      setInvitationLoading(true);
      setInvitationLink(null);
      invitationLinkSheetRef.current?.present();
  
      const res = await generateGroupInvitationLink(selectedGroupId);
      if (res?.link) {
        setInvitationLink(res.link);
      } else {
        setInvitationLink(null);
      }
      setInvitationLoading(false);
    }
  };

  const handleEditGroupFromMenu = () => {
    handleGroupBottomSheetRef.current?.present();
  };

  return (
    <View style={styles.container}>
      <GroupsHeader style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 }} />
      <FlatList
        style={{ marginTop: 2 }}
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <GroupsView
            index={index}
            group={item}
            taskCount={item.taskCount}
            memberCount={item.memberCount}
            onGroupPress={() => console.log("Group pressed:", item.id)}
            onLongPress={() => handleGroupLongPress(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <FloatingButtonWithMenu
        onCreate={() => {
          setSelectedGroupId(null);
          handleGroupBottomSheetRef.current?.present();
        }}
        onJoin={() => {
          console.log("Join existing group pressed");
        }}
        colors={colors}
      />
      <HandleGroupBottomSheet
        ref={handleGroupBottomSheetRef}
        groupId={selectedGroupId}
        onGroupAdd={handleGroupAdd}
        onGroupEdit={handleGroupEdit}
      />
      <InvitationLinkBottomSheet
        ref={invitationLinkSheetRef}
        invitationLink={invitationLink}
        onClose={() => invitationLinkSheetRef.current?.dismiss()}
      />

      <GroupLongPressMenu
        visible={longPressMenuVisible}
        onClose={() => setLongPressMenuVisible(false)}
        onGenerateInvitationLink={handleGenerateInvitationLink}
        onEditGroup={handleEditGroupFromMenu}
        colors={colors}
      />
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    separator: {
      height: 1,
      backgroundColor: colors.background,
    },
  });

export default GroupsScreen;
