import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADD_TRANSACTION_SECTIONS } from '../../constants/addTransactionConstants';
import { TransactionCategoryOption } from '../../types/addTransaction';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ visible, onClose }: AddTransactionModalProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive layout calculations
  const isTablet = width >= 600;
  const isSmallPhone = width < 360;

  const itemWidthClass = isTablet ? 'w-[22%]' : 'w-[30%]';
  const iconBoxSizeClass = isSmallPhone ? 'w-13 h-13 rounded-xl' : 'w-16 h-16 rounded-2xl';
  const iconSize = isSmallPhone ? 22 : 26;

  const handleSelectOption = (option: TransactionCategoryOption) => {
    onClose();
    if (option.entryType) {
      router.push({
        pathname: '/quick-entry',
        params: { type: option.entryType },
      });
    } else if (option.route) {
      router.push(option.route as any);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-surface rounded-t-[32px] p-5 pb-8 max-h-[85%] shadow-xl">
              {/* Header with Close X Button */}
              <View className="flex-row items-center justify-end pb-2">
                <TouchableOpacity onPress={onClose} className="p-1.5 bg-slate-100 rounded-full" activeOpacity={0.7}>
                  <Feather name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                {ADD_TRANSACTION_SECTIONS.map((section, sIdx) => (
                  <View key={section.id} className={sIdx > 0 ? 'mt-5 pt-4 border-t border-slate-100' : ''}>
                    {/* Section Title */}
                    <Text className="text-sm font-bold text-slate-700 mb-4">{section.title}</Text>

                    {/* Options Grid */}
                    <View className="flex-row flex-wrap justify-start gap-x-2 gap-y-4">
                      {section.options.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => handleSelectOption(opt)}
                          className={`${itemWidthClass} items-center mb-1`}
                          activeOpacity={0.75}
                        >
                          <View
                            className={`${iconBoxSizeClass} bg-primary/10 border border-primary/20 items-center justify-center mb-2 shadow-xs`}
                          >
                            <MaterialCommunityIcons
                              name={opt.iconName as any}
                              size={iconSize}
                              color="#0EA5E9"
                            />
                          </View>
                          <Text
                            className="text-xs font-semibold text-slate-700 text-center leading-tight px-0.5"
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
