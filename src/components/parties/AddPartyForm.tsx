import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PartyType } from '../../types/party';
import { ADD_PARTY_CONSTANTS } from '../../constants/addPartyConstants';

export interface AddPartyFormProps {
  name: string;
  onNameChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  partyType: PartyType;
  onPartyTypeChange: (type: PartyType) => void;
  activeTab: 'credit_info' | 'additional_details';
  onTabChange: (tab: 'credit_info' | 'additional_details') => void;
  openingBalance: string;
  onOpeningBalanceChange: (val: string) => void;
  asOfDate: string;
  onAsOfDateChange: (val: string) => void;
  onOpenDatePicker: () => void;
  balanceType: 'To Receive' | 'To Give';
  onBalanceTypeChange: (val: 'To Receive' | 'To Give') => void;
  email: string;
  onEmailChange: (val: string) => void;
  address: string;
  onAddressChange: (val: string) => void;
  note: string;
  onNoteChange: (val: string) => void;
  errorMsg?: string | null;
}

export const AddPartyForm: React.FC<AddPartyFormProps> = ({
  name,
  onNameChange,
  phone,
  onPhoneChange,
  partyType,
  onPartyTypeChange,
  activeTab,
  onTabChange,
  openingBalance,
  onOpeningBalanceChange,
  asOfDate,
  onAsOfDateChange,
  onOpenDatePicker,
  balanceType,
  onBalanceTypeChange,
  email,
  onEmailChange,
  address,
  onAddressChange,
  note,
  onNoteChange,
  errorMsg,
}) => {
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isBalanceFocused, setIsBalanceFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  const showProgressiveFields = name.trim().length > 0;

  const handleTabPress = useCallback(
    (tabId: 'credit_info' | 'additional_details') => {
      Keyboard.dismiss();
      setIsBalanceFocused(false);
      setIsEmailFocused(false);
      setIsAddressFocused(false);
      setIsNoteFocused(false);
      onTabChange(tabId);
    },
    [onTabChange]
  );

  return (
    <View className="px-4 py-2 space-y-4">
      {/* Error display if present */}
      {errorMsg && (
        <View className="bg-[#EF4444] rounded-2xl px-4 py-3 mb-4 flex-row items-center shadow-xs">
          <Feather name="alert-circle" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text className="text-sm font-semibold text-white flex-1">{errorMsg}</Text>
        </View>
      )}

      {/* ── 1. Party Name Field (Outlined Floating Label with clearance gap) ── */}
      <View className="relative mb-5">
        <View className="absolute -top-2.5 left-3 z-10 bg-surface px-1.5">
          <Text className={`text-xs font-bold ${isNameFocused ? 'text-primary' : 'text-text-secondary'}`}>
            {ADD_PARTY_CONSTANTS.FORM_LABELS.PARTY_NAME}
          </Text>
        </View>

        <TextInput
          value={name}
          onChangeText={onNameChange}
          onFocus={() => setIsNameFocused(true)}
          onBlur={() => setIsNameFocused(false)}
          placeholder={ADD_PARTY_CONSTANTS.FORM_LABELS.PARTY_NAME_PLACEHOLDER}
          placeholderTextColor="#94A3B8"
          className={`bg-surface border ${
            isNameFocused ? 'border-primary' : 'border-border'
          } rounded-xl px-4 pt-3 pb-3 text-base text-text font-medium`}
          autoFocus={true}
        />
      </View>

      {/* ── Conditional Progressive Disclosure (Appears when party name is entered) ── */}
      {showProgressiveFields && (
        <View className="space-y-4 pt-1">
          {/* ── 2. Phone Number Input (Outlined Floating Label) ────────── */}
          <View className="relative mb-4">
            <View className="absolute -top-2.5 left-3 z-10 bg-surface px-1.5">
              <Text className={`text-xs font-bold ${isPhoneFocused ? 'text-primary' : 'text-text-secondary'}`}>
                {ADD_PARTY_CONSTANTS.FORM_LABELS.PHONE_NUMBER}
              </Text>
            </View>

            <TextInput
              value={phone}
              onChangeText={onPhoneChange}
              onFocus={() => setIsPhoneFocused(true)}
              onBlur={() => setIsPhoneFocused(false)}
              keyboardType="phone-pad"
              placeholder={ADD_PARTY_CONSTANTS.FORM_LABELS.PHONE_NUMBER_PLACEHOLDER}
              placeholderTextColor="#94A3B8"
              className={`bg-surface border ${
                isPhoneFocused ? 'border-primary' : 'border-border'
              } rounded-xl px-4 pt-3 pb-3 text-base text-text font-medium`}
            />
          </View>

          {/* ── 3. Party Type Selector (Customer, Supplier, Both with generous gap) ── */}
          <View className="mt-1 mb-5">
            <Text className="text-xs font-bold text-text-secondary mb-2.5">
              {ADD_PARTY_CONSTANTS.FORM_LABELS.PARTY_TYPE}
            </Text>
            <View className="flex-row items-center space-x-3 gap-3 flex-wrap">
              {ADD_PARTY_CONSTANTS.PARTY_ROLES.map((role) => {
                const isSelected = partyType === role.id;
                return (
                  <TouchableOpacity
                    key={role.id}
                    activeOpacity={0.7}
                    onPress={() => onPartyTypeChange(role.id as PartyType)}
                    className={`flex-1 py-2.5 px-4 rounded-full border items-center justify-center ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}
                  >
                    <Text
                      numberOfLines={1}
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── 4. Tab Header: Credit Info | Additional Details ───────── */}
          <View className="flex-row border-b border-border mt-4 mb-1">
            {ADD_PARTY_CONSTANTS.TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.7}
                  onPress={() => handleTabPress(tab.id as 'credit_info' | 'additional_details')}
                  className={`flex-1 py-3 items-center justify-center ${
                    isSelected ? 'border-b-2 border-primary' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? 'text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── 5. Tab Body Views with Generous Spacing / Up Gap ───────── */}
          {activeTab === 'credit_info' ? (
            <View className="pt-4 space-y-4">
              {/* Row: Opening Balance & As of Date */}
              <View className="flex-row items-center mb-4 gap-2.5">
                {/* Opening Balance */}
                <View className="flex-1 relative">
                  <View className="absolute -top-2.5 left-3 z-10 bg-surface px-1.5">
                    <Text className={`text-[10px] font-bold ${isBalanceFocused ? 'text-primary' : 'text-text-secondary'}`}>
                      {ADD_PARTY_CONSTANTS.FORM_LABELS.OPENING_BALANCE}
                    </Text>
                  </View>
                  <TextInput
                    value={openingBalance}
                    onChangeText={onOpeningBalanceChange}
                    onFocus={() => setIsBalanceFocused(true)}
                    onBlur={() => setIsBalanceFocused(false)}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    className={`bg-surface border ${
                      isBalanceFocused ? 'border-primary' : 'border-border'
                    } rounded-xl px-3.5 pt-3.5 pb-3.5 text-base text-text font-medium`}
                  />
                </View>

                {/* As of Date (Opens Calendar Modal on Press) */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsBalanceFocused(false);
                    onOpenDatePicker();
                  }}
                  className="flex-1 relative"
                >
                  <View className="absolute -top-2.5 left-3 z-10 bg-surface px-1.5">
                    <Text className="text-[10px] font-bold text-text-secondary">
                      {ADD_PARTY_CONSTANTS.FORM_LABELS.AS_OF_DATE}
                    </Text>
                  </View>
                  <View className="bg-surface border border-border rounded-xl px-3.5 pt-3.5 pb-3.5 flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-text flex-1" numberOfLines={1}>
                      {asOfDate || 'Select Date'}
                    </Text>
                    <Feather name="calendar" size={16} color="#64748B" style={{ marginLeft: 4 }} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Balance Type Selector Pills */}
              <View className="mt-3 mb-2">
                <View className="flex-row items-center space-x-3 gap-3">
                  {ADD_PARTY_CONSTANTS.BALANCE_TYPES.map((bt) => {
                    const isSelected = balanceType === bt.id;
                    return (
                      <TouchableOpacity
                        key={bt.id}
                        activeOpacity={0.7}
                        onPress={() => onBalanceTypeChange(bt.id as 'To Receive' | 'To Give')}
                        className={`px-6 py-2.5 rounded-full border items-center justify-center ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'bg-background border-border'
                        }`}
                      >
                        <Text
                          numberOfLines={1}
                          className={`text-xs font-bold text-center ${
                            isSelected ? 'text-white' : 'text-text-secondary'
                          }`}
                        >
                          {bt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : (
            /* Additional Details Tab View */
            <View className="pt-4 space-y-6">
              {/* Party Email Field */}
              <View className="relative mb-6">
                <View className="absolute -top-2.5 left-3 z-10 bg-surface px-1.5">
                  <Text className={`text-xs font-bold ${isEmailFocused ? 'text-primary' : 'text-text-secondary'}`}>
                    {ADD_PARTY_CONSTANTS.FORM_LABELS.PARTY_EMAIL}
                  </Text>
                </View>
                <TextInput
                  value={email}
                  onChangeText={onEmailChange}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder={ADD_PARTY_CONSTANTS.FORM_LABELS.PARTY_EMAIL_PLACEHOLDER}
                  placeholderTextColor="#94A3B8"
                  className={`bg-surface border ${
                    isEmailFocused ? 'border-primary' : 'border-border'
                  } rounded-xl px-4 pt-3.5 pb-3.5 text-base text-text font-medium`}
                />
              </View>

              {/* Party Address Field */}
              <View className="relative mb-6">
                <View className="absolute -top-2.5 left-3 z-10 bg-surface px-1.5">
                  <Text className={`text-xs font-bold ${isAddressFocused ? 'text-primary' : 'text-text-secondary'}`}>
                    {ADD_PARTY_CONSTANTS.FORM_LABELS.PARTY_ADDRESS}
                  </Text>
                </View>
                <TextInput
                  value={address}
                  onChangeText={onAddressChange}
                  onFocus={() => setIsAddressFocused(true)}
                  onBlur={() => setIsAddressFocused(false)}
                  placeholder={ADD_PARTY_CONSTANTS.FORM_LABELS.PARTY_ADDRESS_PLACEHOLDER}
                  placeholderTextColor="#94A3B8"
                  className={`bg-surface border ${
                    isAddressFocused ? 'border-primary' : 'border-border'
                  } rounded-xl px-4 pt-3.5 pb-3.5 text-base text-text font-medium`}
                />
              </View>

              {/* Additional Notes Field */}
              <View className="relative mb-4">
                <View className="absolute -top-2.5 left-3 z-10 bg-surface px-1.5">
                  <Text className={`text-xs font-bold ${isNoteFocused ? 'text-primary' : 'text-text-secondary'}`}>
                    {ADD_PARTY_CONSTANTS.FORM_LABELS.ADDITIONAL_NOTES}
                  </Text>
                </View>
                <TextInput
                  value={note}
                  onChangeText={onNoteChange}
                  onFocus={() => setIsNoteFocused(true)}
                  onBlur={() => setIsNoteFocused(false)}
                  placeholder="Notes, PAN or remarks"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  className={`bg-surface border ${
                    isNoteFocused ? 'border-primary' : 'border-border'
                  } rounded-xl px-4 pt-3.5 pb-3.5 text-base text-text font-medium h-24 text-top`}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default AddPartyForm;
