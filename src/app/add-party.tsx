import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAddParty } from '../hooks/useAddParty';
import {
  AddPartyHeader,
  ImportContactsBanner,
  AddPartyForm,
  AddPartyFooter,
  ContactsPickerModal,
} from '../components/parties';
import { DatePickerModal } from '../components/common';

export default function AddPartyScreen() {
  const router = useRouter();

  const {
    name,
    setName,
    phone,
    setPhone,
    partyType,
    setPartyType,
    activeTab,
    setActiveTab,
    openingBalance,
    setOpeningBalance,
    asOfDate,
    setAsOfDate,
    balanceType,
    setBalanceType,
    email,
    setEmail,
    address,
    setAddress,
    note,
    setNote,
    saving,
    errorMsg,
    saveParty,
    saveAndNew,
    selectContact,
    isContactsModalVisible,
    openContactsModal,
    closeContactsModal,
    isDatePickerVisible,
    openDatePickerModal,
    closeDatePickerModal,
  } = useAddParty();

  const handleSave = useCallback(async () => {
    const created = await saveParty();
    if (created) {
      router.back();
    }
  }, [saveParty, router]);

  const handleSaveAndNew = useCallback(async () => {
    await saveAndNew();
  }, [saveAndNew]);

  const handleSelectContact = useCallback(
    (contactName: string, contactPhone?: string) => {
      selectContact(contactName, contactPhone);
    },
    [selectContact]
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* ── Header (No settings icon, Back Arrow + Title) ─────────────── */}
      <AddPartyHeader onBack={() => router.back()} />

      {/* ── Keyboard Avoiding View (Buttons rest just on top of keyboard) ─ */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <ScrollView
              className="flex-1"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
            >
              {/* ── Import Parties from contact banner card ────────────── */}
              <ImportContactsBanner onPress={openContactsModal} />

              {/* ── Add Party Form with Progressive Disclosure ──────────── */}
              <AddPartyForm
                name={name}
                onNameChange={setName}
                phone={phone}
                onPhoneChange={setPhone}
                partyType={partyType}
                onPartyTypeChange={setPartyType}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                openingBalance={openingBalance}
                onOpeningBalanceChange={setOpeningBalance}
                asOfDate={asOfDate}
                onAsOfDateChange={setAsOfDate}
                onOpenDatePicker={openDatePickerModal}
                balanceType={balanceType}
                onBalanceTypeChange={setBalanceType}
                email={email}
                onEmailChange={setEmail}
                address={address}
                onAddressChange={setAddress}
                note={note}
                onNoteChange={setNote}
                errorMsg={errorMsg}
              />
            </ScrollView>

            {/* ── Fixed Bottom Footer (Rests directly above keyboard) ───── */}
            <AddPartyFooter
              onSave={handleSave}
              onSaveAndNew={handleSaveAndNew}
              loading={saving}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ── Device Contacts Selection Modal ───────────────────────────── */}
      <ContactsPickerModal
        visible={isContactsModalVisible}
        onClose={closeContactsModal}
        onSelectContact={handleSelectContact}
      />

      {/* ── Interactive Calendar Date Picker Modal ────────────────────── */}
      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={closeDatePickerModal}
        onSelectDate={setAsOfDate}
      />
    </SafeAreaView>
  );
}
