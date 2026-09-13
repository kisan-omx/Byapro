import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { PartyPaymentFilter } from "../../types/party";
import { PAYMENT_FILTER_OPTIONS } from "../../constants/parties";

export interface PaymentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedPaymentFilter: PartyPaymentFilter;
  onSelectPaymentFilter: (filter: PartyPaymentFilter) => void;
}

export const PaymentFilterModal: React.FC<PaymentFilterModalProps> = ({
  visible,
  onClose,
  selectedPaymentFilter,
  onSelectPaymentFilter,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="bg-surface rounded-t-3xl p-5 pb-8 border-t border-border">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between pb-4 border-b border-border/40 mb-2">
                <Text className="text-lg font-bold text-text">
                  Select Payment Status
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  className="p-1"
                >
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              {PAYMENT_FILTER_OPTIONS.map((option) => {
                const isSelected = selectedPaymentFilter === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectPaymentFilter(option.id);
                      onClose();
                    }}
                    className={`py-3.5 px-4 rounded-xl flex-row items-center justify-between mb-1.5 ${
                      isSelected ? "bg-primary/10" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        isSelected ? "text-primary" : "text-text"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={18} color="#0EA5E9" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PaymentFilterModal;
