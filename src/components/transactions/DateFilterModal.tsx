import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DateFilterType, TransactionType } from '../../types/transaction';
import { DATE_FILTER_OPTIONS } from '../../constants/transactionConstants';

interface DateFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDateFilter: DateFilterType;
  onSelectDateFilter: (filter: DateFilterType) => void;
  selectedTypeFilter: TransactionType | 'All';
  onSelectTypeFilter: (type: TransactionType | 'All') => void;
}

const TYPE_OPTIONS: { id: TransactionType | 'All'; label: string }[] = [
  { id: 'All', label: 'All Transactions' },
  { id: 'Sale', label: 'Sales Only' },
  { id: 'Purchase', label: 'Purchases Only' },
  { id: 'PaymentIn', label: 'Payment In' },
  { id: 'PaymentOut', label: 'Payment Out' },
  { id: 'Expense', label: 'Expenses Only' },
];

export default function DateFilterModal({
  visible,
  onClose,
  selectedDateFilter,
  onSelectDateFilter,
  selectedTypeFilter,
  onSelectTypeFilter,
}: DateFilterModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 justify-center items-center px-5">
          <TouchableWithoutFeedback>
            <View className="w-full bg-surface rounded-2xl p-5 shadow-lg max-w-sm">
              {/* Header */}
              <View className="flex-row items-center justify-between pb-3 border-b border-border">
                <Text className="text-base font-bold text-text">Filter Transactions</Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Date Filter Section */}
              <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-4 mb-2">
                Date Range
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DATE_FILTER_OPTIONS.map((opt) => {
                  const isSelected = selectedDateFilter === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => {
                        onSelectDateFilter(opt.id);
                      }}
                      className={`px-3 py-2 rounded-xl border ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-primary' : 'text-text'
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Transaction Type Section */}
              <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-5 mb-2">
                Transaction Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected = selectedTypeFilter === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => {
                        onSelectTypeFilter(opt.id);
                      }}
                      className={`px-3 py-2 rounded-xl border ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-primary' : 'text-text'
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                onPress={onClose}
                className="mt-6 bg-primary py-3 rounded-xl items-center justify-center"
              >
                <Text className="text-white font-bold text-sm">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
