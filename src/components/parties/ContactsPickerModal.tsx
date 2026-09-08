import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts/legacy';

export interface ContactItem {
  id: string;
  name: string;
  phone?: string;
}

export interface ContactsPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectContact: (name: string, phone?: string) => void;
  onSelectMultipleContacts?: (contacts: Array<{ name: string; phone?: string }>) => void;
}

let cachedDeviceContacts: ContactItem[] | null = null;

export const ContactsPickerModal: React.FC<ContactsPickerModalProps> = ({
  visible,
  onClose,
  onSelectContact,
  onSelectMultipleContacts,
}) => {
  const [contacts, setContacts] = useState<ContactItem[]>(() => cachedDeviceContacts || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchContacts = useCallback(async () => {
    if (cachedDeviceContacts && cachedDeviceContacts.length > 0) {
      setContacts(cachedDeviceContacts);
      return;
    }

    setLoading(true);
    setPermissionDenied(false);

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          sort: Contacts.SortTypes.FirstName,
        });

        if (data && data.length > 0) {
          const list: ContactItem[] = data
            .filter((c: any) => c.name && c.name.trim())
            .map((c: any) => {
              const rawPhone = c.phoneNumbers?.[0]?.number || '';
              const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
              return {
                id: c.id || Math.random().toString(),
                name: c.name.trim(),
                phone: cleanPhone || undefined,
              };
            });

          cachedDeviceContacts = list;
          setContacts(list);
        } else {
          setContacts([]);
        }
      } else {
        setPermissionDenied(true);
      }
    } catch (error) {
      console.warn('Error fetching device contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchContacts();
    } else {
      setSearchQuery('');
      setSelectedIds(new Set());
    }
  }, [visible, fetchContacts]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [contacts, searchQuery]);

  const toggleSelectContact = useCallback((contact: ContactItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contact.id)) {
        next.delete(contact.id);
      } else {
        next.add(contact.id);
      }
      return next;
    });
  }, []);

  const handleRowPress = useCallback((contact: ContactItem) => {
    onSelectContact(contact.name, contact.phone);
    onClose();
  }, [onSelectContact, onClose]);

  const handleBatchImport = useCallback(() => {
    const selectedList = contacts.filter((c) => selectedIds.has(c.id));
    if (selectedList.length === 0) return;

    if (onSelectMultipleContacts) {
      onSelectMultipleContacts(
        selectedList.map((c) => ({ name: c.name, phone: c.phone }))
      );
    } else if (selectedList.length === 1) {
      onSelectContact(selectedList[0].name, selectedList[0].phone);
    }
    onClose();
  }, [contacts, selectedIds, onSelectMultipleContacts, onSelectContact, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header Bar with Status Bar Clearance */}
            <View
              className="flex-row items-center px-4 pb-3.5 border-b border-border/40"
              style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 16 }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                className="p-1.5 -ml-1 mr-3"
              >
                <Feather name="arrow-left" size={24} color="#0F172A" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-text">
                Import Parties from Contacts
              </Text>
            </View>

            {/* Search Bar Input Container */}
            <View className="px-4 py-3">
              <View className="flex-row items-center bg-slate-100/90 rounded-2xl px-4 py-3 border border-slate-200/60">
                <Feather name="search" size={20} color="#0EA5E9" />
                <TextInput
                  className="flex-1 ml-3 text-base font-medium text-text p-0"
                  placeholder="Search Contact"
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                    <Feather name="x-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section Subheader */}
            <View className="px-4 py-2.5 bg-background border-y border-border/30">
              <Text className="text-xs font-bold text-text-secondary/70 tracking-wider uppercase">
                LISTED CONTACT
              </Text>
            </View>

            {/* Contacts List */}
            {loading ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color="#0EA5E9" />
                <Text className="text-xs text-text-secondary font-medium mt-3">
                  Loading contacts...
                </Text>
              </View>
            ) : permissionDenied ? (
              <View className="flex-1 items-center justify-center p-6">
                <Feather name="shield-off" size={40} color="#94A3B8" />
                <Text className="text-base font-bold text-text mt-3 text-center">
                  Contacts Permission Required
                </Text>
                <Text className="text-xs text-text-secondary text-center mt-1 px-4">
                  Please allow contacts permission in device settings to import contacts.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                renderItem={({ item }) => {
                  const isChecked = selectedIds.has(item.id);
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        toggleSelectContact(item);
                        handleRowPress(item);
                      }}
                      className="flex-row items-center px-4 py-3.5 border-b border-border/30 active:bg-background"
                    >
                      {/* Checkbox Icon */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleSelectContact(item)}
                        className={`w-5 h-5 rounded border items-center justify-center mr-4 ${
                          isChecked
                            ? 'bg-primary border-primary'
                            : 'border-slate-300 bg-surface'
                        }`}
                      >
                        {isChecked && <Feather name="check" size={14} color="#FFFFFF" />}
                      </TouchableOpacity>

                      {/* Contact Details */}
                      <View className="flex-1 justify-center">
                        <Text className="text-base font-bold text-text leading-tight">
                          {item.name}
                        </Text>
                        {item.phone ? (
                          <Text className="text-xs text-text-secondary font-medium mt-0.5">
                            {item.phone}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View className="py-12 items-center justify-center">
                    <Text className="text-sm font-medium text-text-secondary">
                      No contacts found
                    </Text>
                  </View>
                }
              />
            )}

            {/* Bottom Batch Import Bar (Shown when contacts are checked) */}
            {selectedIds.size > 0 && (
              <View className="p-4 border-t border-border/40 bg-surface shadow-lg">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleBatchImport}
                  className="bg-primary py-3.5 rounded-2xl items-center justify-center"
                >
                  <Text className="text-base font-bold text-white">
                    Import {selectedIds.size} Contact{selectedIds.size > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

export default ContactsPickerModal;
