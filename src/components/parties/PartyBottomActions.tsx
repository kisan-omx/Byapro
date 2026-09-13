import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../common/PrimaryButton";

export interface PartyBottomActionsProps {
  onOpenAddPartyModal: () => void;
}

export const PartyBottomActions: React.FC<PartyBottomActionsProps> = ({
  onOpenAddPartyModal,
}) => {
  return (
    <View className="absolute bottom-5 left-0 right-0 items-center justify-center pointer-events-box-none px-4">
      <PrimaryButton
        title="Add New Party"
        renderIcon={() => (
          <Ionicons
            name="person"
            size={22}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
        )}
        onPress={onOpenAddPartyModal}
        className="bg-primary px-7 py-3.5 rounded-full shadow-xl shadow-primary/35 flex-row items-center justify-center"
        textClassName="text-base font-extrabold text-white tracking-wide"
      />
    </View>
  );
};

export default PartyBottomActions;
