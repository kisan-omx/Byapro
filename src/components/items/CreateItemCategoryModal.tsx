import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ITEM_CATEGORY_CONSTANTS } from "../../constants/itemCategory";

export interface CreateItemCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  loading: boolean;
}

export const CreateItemCategoryModal: React.FC<
  CreateItemCategoryModalProps
> = ({ visible, onClose, onSave, loading }) => {
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || loading) return;
    await onSave(name.trim());
    setName("");
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  const isValid = name.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-surface rounded-t-3xl overflow-hidden px-5 pb-8 pt-6"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <Text className="text-lg font-bold text-text mb-6">
              {ITEM_CATEGORY_CONSTANTS.CREATE_MODAL_TITLE}
            </Text>

            {/* Outlined Input */}
            <View className="mb-6 relative pt-2">
              <View
                className={`border rounded-xl px-4 py-3 ${
                  isFocused ? "border-primary" : "border-border"
                }`}
              >
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                  className="text-base text-text p-0 m-0"
                  style={{ height: 24 }}
                  onSubmitEditing={handleSave}
                  returnKeyType="done"
                />
              </View>
              {/* Floating Label (on border) */}
              <View className="absolute left-3 top-0 bg-surface px-1">
                <Text
                  className={`text-xs font-medium ${
                    isFocused ? "text-primary" : "text-text-secondary"
                  }`}
                >
                  {ITEM_CATEGORY_CONSTANTS.CREATE_INPUT_LABEL}
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!isValid || loading}
              className={`rounded-xl py-4 items-center ${
                isValid ? "bg-primary" : "bg-slate-100"
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  className={`text-base font-bold ${
                    isValid ? "text-white" : "text-slate-400"
                  }`}
                >
                  {ITEM_CATEGORY_CONSTANTS.SAVE_BUTTON}
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateItemCategoryModal;
