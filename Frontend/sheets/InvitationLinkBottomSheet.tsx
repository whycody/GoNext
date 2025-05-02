import React, { useState, useCallback, forwardRef } from "react";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Text, View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";

type Props = {
  link: string | null;
  loading: boolean;
  onClose: () => void;
};

const InvitationLinkBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ link, loading, onClose }, ref) => {
    const { colors } = useTheme();

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.primary }}
      >
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Invitation Link</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : link ? (
            <>
              <Text selectable style={[styles.link, { color: colors.primary }]}>
                {link}
              </Text>
              <Pressable onPress={onClose}>
                <Text style={[styles.closeButton, { color: colors.notification }]}>Close</Text>
              </Pressable>
            </>
          ) : (
            <Text style={{ color: colors.text }}>Unable to generate link.</Text>
          )}
        </View>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    fontSize: 16,
  },
  closeButton: {
    textAlign: "center",
    marginTop: 12,
    fontWeight: "bold",
  },
});

export default InvitationLinkBottomSheet;
