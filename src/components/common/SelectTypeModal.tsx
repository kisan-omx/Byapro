import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { TransactionType } from '../../types/transaction';
import { TRANSACTION_TYPE_OPTIONS } from '../../constants/transactionConstants';

interface SelectTypeModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTypeFilter: TransactionType | 'All';
  onSelectTypeFilter: (type: TransactionType | 'All') => void;
  title?: string;
}

export default function SelectTypeModal({
  visible,
  onClose,
  selectedTypeFilter,
  onSelectTypeFilter,
  title = 'Filter by Type',
}: SelectTypeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="w-full bg-surface rounded-t-3xl pt-5 pb-8 px-6 shadow-2xl max-h-[85%]">
              {/* Header Title */}
              <View className="pb-3 border-b border-border/60 mb-2">
                <Text className="text-xl font-bold text-text">{title}</Text>
              </View>

              {/* Scrollable List of Transaction Types */}
              <ScrollView showsVerticalScrollIndicator={false} className="divide-y divide-border/20">
                {TRANSACTION_TYPE_OPTIONS.map((opt) => {
                  const isSelected = selectedTypeFilter === opt.id;

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => {
                        onSelectTypeFilter(opt.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                      className="py-3.5 flex-row items-center justify-between"
                    >
                      {/* Left: Option Title */}
                      <Text
                        className={`text-base font-bold ${
                          isSelected ? 'text-text' : 'text-text/90'
                        }`}
                      >
                        {opt.label}
                      </Text>

                      {/* Right: Radio Button Indicator */}
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          isSelected ? 'border-primary bg-transparent' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
