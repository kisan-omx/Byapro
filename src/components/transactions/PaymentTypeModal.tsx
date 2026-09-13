import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

export interface PaymentTypeOption {
  id: string;
  label: string;
  renderIcon: () => React.ReactNode;
  bgColor: string;
}

export interface PaymentTypeModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

const PAYMENT_OPTIONS: PaymentTypeOption[] = [
  {
    id: "Cash",
    label: "Cash",
    bgColor: "bg-emerald-50",
    renderIcon: () => (
      <MaterialCommunityIcons name="cash-multiple" size={22} color="#16A34A" />
    ),
  },
  {
    id: "Cheque",
    label: "Cheque",
    bgColor: "bg-amber-50",
    renderIcon: () => (
      <FontAwesome5 name="money-check" size={17} color="#D97706" />
    ),
  },
  {
    id: "Bank",
    label: "Bank",
    bgColor: "bg-sky-50",
    renderIcon: () => (
      <MaterialCommunityIcons name="bank" size={20} color="#0284C7" />
    ),
  },
  {
    id: "Online",
    label: "Online",
    bgColor: "bg-purple-50",
    renderIcon: () => (
      <Ionicons name="card-outline" size={20} color="#9333EA" />
    ),
  },
];

export default function PaymentTypeModal({
  visible,
  onClose,
  selectedMethod,
  onSelectMethod,
}: PaymentTypeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-surface rounded-t-3xl w-full pb-8 overflow-hidden shadow-2xl">
              {/* Bottom Sheet Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
                <Text className="text-lg font-bold text-slate-800">
                  Payment Type
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-1 rounded-full active:bg-slate-100"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Payment Type Options */}
              <View className="py-1">
                {PAYMENT_OPTIONS.map((item) => {
                  const isSelected =
                    selectedMethod.toLowerCase() === item.id.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        onSelectMethod(item.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                      className="flex-row items-center justify-between px-6 py-3.5 border-b border-slate-100 active:bg-slate-50"
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-9 h-9 rounded-xl items-center justify-center mr-3.5 ${item.bgColor}`}
                        >
                          {item.renderIcon()}
                        </View>
                        <Text className="text-base font-semibold text-slate-800">
                          {item.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#0EA5E9" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
