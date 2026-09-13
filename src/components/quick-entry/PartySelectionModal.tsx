import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts/legacy';
import { supabase } from '../../lib/supabase';
import { useParties } from '../../hooks/useParties';

export type Party = {
  id: string;
  name: string;
  subtitle?: string;
  type: 'Cash' | 'Contact' | 'Party' | 'ExpenseCategory';
  balance?: number;
  balanceType?: 'To Receive' | 'To Give' | 'Settled';
};

interface PartySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (party: Party | null) => void;
  entryType: string;
  selectedParty?: Party | null;
}

const EXPENSE_CATEGORIES: Party[] = [
  { id: 'exp_1', name: 'Rent', type: 'ExpenseCategory' },
  { id: 'exp_2', name: 'Salaries', type: 'ExpenseCategory' },
  { id: 'exp_3', name: 'Bank Fees', type: 'ExpenseCategory' },
  { id: 'exp_4', name: 'Marketing', type: 'ExpenseCategory' },
  { id: 'exp_5', name: 'Utilities', type: 'ExpenseCategory' },
  { id: 'exp_6', name: 'Repair & Maintenance', type: 'ExpenseCategory' },
  { id: 'exp_7', name: 'Travel & Transportation', type: 'ExpenseCategory' },
  { id: 'exp_8', name: 'Miscellaneous', type: 'ExpenseCategory' },
];

let cachedCategories: Party[] | null = null;

export async function preloadExpenseCategories() {
  if (cachedCategories) return;
  try {
    const { data } = await supabase
      .from('expense_categories')
      .select('id, name')
      .order('name');
    if (data && data.length > 0) {
      const formattedCats: Party[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        type: 'ExpenseCategory' as const,
      }));
      const existingNames = new Set(formattedCats.map((c) => c.name.toLowerCase()));
      const defaults = EXPENSE_CATEGORIES.filter(
        (c) => !existingNames.has(c.name.toLowerCase()),
      );
      cachedCategories = [...formattedCats, ...defaults];
    } else {
      cachedCategories = EXPENSE_CATEGORIES;
    }
  } catch {
    cachedCategories = EXPENSE_CATEGORIES;
  }
}

let cachedContacts: Party[] | null = null;
let isPreloadingContacts = false;
let hasPermissionChecked = false;

export async function preloadContacts() {
  if (cachedContacts && cachedContacts.length > 0) return;
  if (isPreloadingContacts) return;
  isPreloadingContacts = true;
  try {
    const { status } = await Contacts.getPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });
      if (data && data.length > 0) {
        cachedContacts = data
          .filter((c: any) => c.name)
          .map((c: any) => ({
            id: c.id || Math.random().toString(),
            name: c.name,
            subtitle: c.phoneNumbers?.[0]?.number || 'No phone number',
            type: 'Contact',
          }));
      }
    }
  } catch (error) {
    // Non-blocking background preheat
  } finally {
    isPreloadingContacts = false;
  }
}

const PartyItemRow = React.memo(
  ({
    item,
    isSelected,
    onSelect,
    onClose,
  }: {
    item: Party;
    isSelected: boolean;
    onSelect: (party: Party) => void;
    onClose: () => void;
  }) => {
    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-border"
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-4">
          <Text className="text-lg font-medium text-text">
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-text">{item.name}</Text>
          <Text className="text-sm text-text-secondary">{item.subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

const CategoryItemRow = React.memo(
  ({
    item,
    isSelected,
    onSelect,
    onClose,
  }: {
    item: Party;
    isSelected: boolean;
    onSelect: (party: Party) => void;
    onClose: () => void;
  }) => {
    return (
      <TouchableOpacity
        className="flex-row items-center justify-between p-4 border-b border-border/50"
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <Text
          className={`text-base ${
            isSelected ? 'font-semibold text-text' : 'font-medium text-text-secondary'
          }`}
        >
          {item.name}
        </Text>
        {isSelected ? (
          <Ionicons name="radio-button-on" size={24} color="#0EA5E9" />
        ) : (
          <Ionicons name="radio-button-off" size={24} color="#CBD5E1" />
        )}
      </TouchableOpacity>
    );
  },
);

export default function PartySelectionModal({ visible, onClose, onSelect, entryType, selectedParty }: PartySelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Party[]>(() => cachedContacts || []);
  const [dbCategories, setDbCategories] = useState<Party[]>(() => cachedCategories || EXPENSE_CATEGORIES);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const isExpense = entryType === 'Expense';
  const searchInputRef = useRef<TextInput>(null);

  const handleAddNew = () => {
    const name = searchQuery.trim();
    if (name) {
      onSelect({
        id: 'custom_' + Date.now(),
        name,
        type: isExpense ? 'ExpenseCategory' : 'Party',
      });
      handleClose();
    } else {
      searchInputRef.current?.focus();
    }
  };

  // ── Paginated Parties Hook (20 per page, infinite scroll, stable ordering) ──
  const {
    parties: dbParties,
    loading: dbLoading,
    loadingMore,
    refreshing,
    loadMore,
    refresh,
  } = useParties({
    searchQuery,
    enabled: visible && !isExpense,
  });

  const loadDbCategories = async () => {
    try {
      const { data } = await supabase
        .from('expense_categories')
        .select('id, name')
        .order('name');
      if (data && data.length > 0) {
        const formattedCats: Party[] = data.map((c) => ({
          id: c.id,
          name: c.name,
          type: 'ExpenseCategory',
        }));
        const existingNames = new Set(formattedCats.map((c) => c.name.toLowerCase()));
        const defaults = EXPENSE_CATEGORIES.filter(
          (c) => !existingNames.has(c.name.toLowerCase()),
        );
        const combined = [...formattedCats, ...defaults];
        cachedCategories = combined;
        setDbCategories(combined);
      }
    } catch (error) {
      console.warn('Error fetching DB categories', error);
    }
  };

  const loadContacts = async () => {
    if (cachedContacts && cachedContacts.length > 0) {
      return;
    }
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      hasPermissionChecked = true;
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          sort: Contacts.SortTypes.FirstName,
        });

        if (data && data.length > 0) {
          const formattedContacts: Party[] = data
            .filter((c: any) => c.name)
            .map((c: any) => ({
              id: c.id || Math.random().toString(),
              name: c.name,
              subtitle: c.phoneNumbers?.[0]?.number || 'No phone number',
              type: 'Contact',
            }));
          cachedContacts = formattedContacts;
          setContacts(formattedContacts);
        }
      } else {
        setPermissionDenied(true);
      }
    } catch (error) {
      console.warn('Error fetching contacts', error);
    }
  };

  useEffect(() => {
    if (visible) {
      // Immediately pick up any preloaded contacts or categories if available
      if (cachedContacts && cachedContacts.length > 0 && contacts.length === 0) {
        setContacts(cachedContacts);
      }
      if (cachedCategories && cachedCategories.length > 0) {
        setDbCategories(cachedCategories);
      }

      if (isExpense) {
        // Run category fetch without blocking initial render
        const timer = setTimeout(() => {
          loadDbCategories();
        }, 100);
        return () => clearTimeout(timer);
      } else if (!cachedContacts) {
        // Load contacts asynchronously after modal transition
        const timer = setTimeout(() => {
          loadContacts();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, isExpense]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const displayData = useMemo(() => {
    if (isExpense) {
      return dbCategories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (contacts.length === 0) {
      return dbParties;
    }

    const seenNames = new Set(dbParties.map((p) => p.name.toLowerCase()));
    const query = searchQuery.trim().toLowerCase();

    // When searching, find matching contacts up to 20 to prevent huge lists from stuttering the UI
    // When not searching, only show 20 contacts under the database parties (Rule 8: 20 records per batch)
    const MAX_CONTACTS_TO_SHOW = 20;
    const matchingContacts: Party[] = [];

    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i];
      if (seenNames.has(c.name.toLowerCase())) continue;

      if (!query) {
        matchingContacts.push(c);
        if (matchingContacts.length >= MAX_CONTACTS_TO_SHOW) break;
      } else {
        const matches =
          c.name.toLowerCase().includes(query) ||
          (c.subtitle && c.subtitle.includes(query));
        if (matches) {
          matchingContacts.push(c);
          if (matchingContacts.length >= MAX_CONTACTS_TO_SHOW) break;
        }
      }
    }

    return [...dbParties, ...matchingContacts];
  }, [isExpense, dbCategories, dbParties, contacts, searchQuery]);

  const handleSelectCash = () => {
    onSelect(null);
    handleClose();
  };

  const renderItem = useCallback(
    ({ item }: { item: Party }) => {
      const isSelected = selectedParty?.id === item.id;
      if (isExpense) {
        return (
          <CategoryItemRow
            item={item}
            isSelected={isSelected}
            onSelect={onSelect}
            onClose={handleClose}
          />
        );
      }
      return (
        <PartyItemRow
          item={item}
          isSelected={isSelected}
          onSelect={onSelect}
          onClose={handleClose}
        />
      );
    },
    [selectedParty?.id, isExpense, onSelect],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="absolute inset-0 bg-black/50" />
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="bg-surface rounded-t-3xl h-[85%]">
            <View className="p-4 border-b border-border">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-text">
                  {isExpense ? 'Select Category for Expense' : 'Select Party for Quick Entry'}
                </Text>
                <TouchableOpacity onPress={handleClose} className="p-1">
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center bg-background rounded-xl px-3 py-2 border border-border">
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  ref={searchInputRef}
                  className="flex-1 ml-2 text-base text-text"
                  placeholder={isExpense ? 'Search Category...' : 'Enter party name...'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#94A3B8"
                  maxLength={60}
                  autoCorrect={false}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                    <Ionicons name="close" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <FlatList
              data={displayData}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={14}
              maxToRenderPerBatch={10}
              windowSize={7}
              removeClippedSubviews={true}
              onEndReached={!isExpense ? loadMore : undefined}
              onEndReachedThreshold={0.5}
              refreshing={!isExpense ? refreshing : false}
              onRefresh={!isExpense ? refresh : undefined}
              ListHeaderComponent={
                !searchQuery && (entryType === 'Sale' || entryType === 'Purchase') ? (
                  <TouchableOpacity
                    className="flex-row items-center p-4 border-b border-border"
                    onPress={handleSelectCash}
                  >
                    <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-4">
                      <MaterialCommunityIcons name="cash" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-text">
                        {entryType === 'Purchase' ? 'Cash Purchase' : 'Cash Sale'}
                      </Text>
                      <Text className="text-sm text-text-secondary">Default</Text>
                    </View>
                  </TouchableOpacity>
                ) : null
              }
              renderItem={renderItem}
              ListFooterComponent={
                !isExpense && loadingMore ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#0EA5E9" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                (!isExpense && dbLoading) ? (
                  <View className="p-8 items-center">
                    <ActivityIndicator size="large" color="#0EA5E9" />
                  </View>
                ) : searchQuery ? (
                  <TouchableOpacity
                    className="flex-row items-center p-4"
                    onPress={() => {
                      if (!searchQuery.trim()) return;
                      onSelect({
                        id: 'custom_' + Date.now(),
                        name: searchQuery.trim(),
                        type: isExpense ? 'ExpenseCategory' : 'Party',
                      });
                      handleClose();
                    }}
                  >
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-4">
                      <Ionicons name={isExpense ? "add" : "person-add"} size={20} color="#0EA5E9" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-text">
                        Add &quot;{searchQuery}&quot; to {isExpense ? 'categories' : 'parties'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : permissionDenied && !isExpense ? (
                  <View className="p-8 items-center">
                    <Text className="text-text-secondary text-center">Contacts permission denied. Allow access in settings to view contacts.</Text>
                  </View>
                ) : (
                  <View className="p-8 items-center">
                    <Text className="text-text-secondary">No {isExpense ? 'categories' : 'parties'} found</Text>
                  </View>
                )
              }
            />

            <View className="p-4 border-t border-border bg-surface pb-8">
              {isExpense ? (
                <TouchableOpacity
                  className="py-3 rounded-xl flex-row justify-center items-center border border-border"
                  onPress={handleAddNew}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#64748B" />
                  <Text className="text-text-secondary text-base font-medium ml-2">
                    {searchQuery.trim() ? `Add "${searchQuery.trim()}"` : 'Add New Category'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-primary py-3 rounded-xl flex-row justify-center items-center"
                  onPress={handleAddNew}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-add" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">
                    {searchQuery.trim() ? `Add "${searchQuery.trim()}"` : 'Add New Party'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}
