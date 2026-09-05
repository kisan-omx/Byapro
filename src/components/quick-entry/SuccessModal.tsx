import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SuccessInfo } from '../../hooks/useQuickEntry';

interface SuccessModalProps {
  visible: boolean;
  info: SuccessInfo | null;
  onClose: () => void;
  onViewTransactions: () => void;
}

export default function SuccessModal({
  visible,
  info,
  onClose,
  onViewTransactions,
}: SuccessModalProps) {
  // Auto-close after 3 seconds
  useEffect(() => {
    if (visible && info) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, info, onClose]);

  if (!info) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <TouchableWithoutFeedback>
            <View className="bg-surface rounded-3xl w-full p-8 items-center">
              {/* Checkmark circle — uses primary color */}
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-5">
                <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
                  <Ionicons name="checkmark" size={34} color="white" />
                </View>
              </View>

              <Text className="text-xl font-bold text-text mb-2 text-center">
                {info.title}
              </Text>
              <Text className="text-base text-text-secondary text-center mb-7">
                {info.message}
              </Text>

              {/* View All Transactions */}
              <TouchableOpacity
                className="bg-primary w-full py-4 rounded-xl items-center mb-4"
                onPress={onViewTransactions}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-semibold">
                  View All Transactions
                </Text>
              </TouchableOpacity>

              {/* Edit Transaction */}
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text className="text-text font-semibold text-base">
                  Edit Transaction
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

