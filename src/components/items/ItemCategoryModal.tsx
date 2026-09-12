import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ItemCategory } from '../../types/itemCategory';
import { ITEM_CATEGORY_CONSTANTS } from '../../constants/itemCategory';

export interface ItemCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  categories: ItemCategory[];
  selectedCategory: string; // category id
  onSelectCategory: (category: ItemCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
  onOpenCreate: () => void;
}

/**
 * Bottom-sheet modal for selecting or creating an item category.
 */
export const ItemCategoryModal: React.FC<ItemCategoryModalProps> = ({
  visible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  loading,
  onOpenCreate,
}) => {
  const handleClose = () => {
    onClose();
  };

  const handleOpenCreate = () => {
    onOpenCreate();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-surface rounded-t-2xl overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-slate-300" />
            </View>

            {/* Title row */}
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-border/60">
              <Text className="text-base font-bold text-text">
                {ITEM_CATEGORY_CONSTANTS.MODAL_TITLE}
              </Text>
              <TouchableOpacity onPress={handleClose} className="p-1">
                <Feather name="x" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View className="mx-4 mt-3 mb-2 flex-row items-center bg-background border border-border rounded-xl px-3 py-2">
              <Feather name="search" size={16} color="#94A3B8" />
              <TextInput
                className="flex-1 ml-2 text-sm text-text font-medium"
                placeholder={ITEM_CATEGORY_CONSTANTS.SEARCH_PLACEHOLDER}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={onSearchChange}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange('')}>
                  <Feather name="x-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category list */}
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 240 }}
              keyboardShouldPersistTaps="handled"
            >
              {loading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color="#0EA5E9" />
                </View>
              ) : categories.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-sm text-text-secondary">
                    {ITEM_CATEGORY_CONSTANTS.EMPTY_STATE}
                  </Text>
                </View>
              ) : (
                categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => onSelectCategory(cat)}
                      activeOpacity={0.75}
                      className="flex-row items-center justify-between px-5 py-5 border-b border-border/40"
                    >
                      <Text className="text-sm font-semibold text-text">
                        {cat.name}
                      </Text>
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-border'
                        }`}
                      >
                        {isSelected && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {/* Add new category */}
            <View className="px-4 py-3 border-t border-border/60">
              <TouchableOpacity
                onPress={handleOpenCreate}
                className="bg-primary rounded-xl py-3.5 items-center"
              >
                <Text className="text-white text-sm font-bold">
                  {ITEM_CATEGORY_CONSTANTS.ADD_BUTTON}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom safe area */}
            <View className="h-6" />
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ItemCategoryModal;
