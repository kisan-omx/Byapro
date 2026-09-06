import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import QuickEntryHeader from '../components/quick-entry/QuickEntryHeader';
import QuickEntryTabs, { EntryType } from '../components/quick-entry/QuickEntryTabs';
import PartySelector from '../components/quick-entry/PartySelector';
import AmountDisplay from '../components/quick-entry/AmountDisplay';
import RecordButton from '../components/quick-entry/RecordButton';
import Numpad from '../components/quick-entry/Numpad';
import PartySelectionModal, {
  Party,
  preloadExpenseCategories,
  preloadContacts,
} from '../components/quick-entry/PartySelectionModal';
import SuccessModal from '../components/quick-entry/SuccessModal';
import { useQuickEntry } from '../hooks/useQuickEntry';
import { preloadParties } from '../hooks/useParties';
import { auth } from '../lib/firebase';
import { getBusinessId } from '../services/quickEntryService';
interface QuickEntryDraft {
  entryType: EntryType;
  amount: string;
  selectedParty: Party | null;
}

let activeDraft: QuickEntryDraft = {
  entryType: 'Sale',
  amount: '',
  selectedParty: null,
};

export default function QuickEntryScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: EntryType }>();

  const [entryType, setEntryTypeState] = useState<EntryType>(() => type || activeDraft.entryType);
  const [amount, setAmountState] = useState<string>(() => activeDraft.amount);
  const [selectedParty, setSelectedPartyState] = useState<Party | null>(() => activeDraft.selectedParty);
  const [isPartyModalVisible, setIsPartyModalVisible] = useState(false);

  useEffect(() => {
    if (type && type !== entryType) {
      setEntryTypeState(type);
      activeDraft.entryType = type;
    }
  }, [type]);

  // Sync state helpers to update both component state and activeDraft
  const setAmount = useCallback((updater: string | ((prev: string) => string)) => {
    setAmountState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      activeDraft.amount = next;
      return next;
    });
  }, []);

  const setSelectedParty = useCallback((party: Party | null) => {
    activeDraft.selectedParty = party;
    setSelectedPartyState(party);
  }, []);

  const setEntryType = useCallback((type: EntryType) => {
    activeDraft.entryType = type;
    setEntryTypeState(type);
  }, []);

  // Pre-warm businessId, parties, contacts, and expense categories cache in background on mount
  useEffect(() => {
    preloadExpenseCategories();
    preloadParties();
    preloadContacts();
    const user = auth.currentUser;
    if (user) {
      getBusinessId(user.uid);
    }
  }, []);

  const { saving, successInfo, validationError, handleRecord, dismissSuccess, clearValidationError } = useQuickEntry();

  // ── Numpad input validation & logic ───────────────────────────────────────
  const handlePress = useCallback((key: string) => {
    clearValidationError();
    setAmount((prev) => {
      // Prevent entering '.' if current number already has one
      if (key === '.') {
        const parts = prev.split(/[\+\-\*\/\%]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return prev;
        // If starting a number with '.', make it '0.'
        if (!lastPart) return prev + '0.';
      }

      // Operators cannot start an expression
      if (['+', '*', '/', '%'].includes(key) && prev === '') return prev;

      // Replace duplicate consecutive operators (+-, */, etc.)
      if (['+', '-', '*', '/', '%'].includes(key)) {
        const lastChar = prev.slice(-1);
        if (['+', '-', '*', '/', '%'].includes(lastChar)) {
          return prev.slice(0, -1) + key;
        }
      }

      // If key is a digit, prevent leading multiple zeros (e.g. '00' -> '0')
      if (/\d/.test(key)) {
        const parts = prev.split(/[\+\-\*\/\%]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart === '0' && key === '0') return prev;
        if (lastPart === '0' && key !== '.') {
          return prev.slice(0, -1) + key;
        }
        // Limit decimal places to 2 (cents / paise)
        if (lastPart.includes('.')) {
          const decimalPart = lastPart.split('.')[1];
          if (decimalPart && decimalPart.length >= 2) return prev;
        }
        // Limit maximum digits per number to 12 digits (reasonable limit for currency)
        if (lastPart.replace('.', '').length >= 12) return prev;
      }

      return prev + key;
    });
  }, [clearValidationError]);

  const handleBackspace = useCallback(() => {
    clearValidationError();
    setAmount((prev) => prev.slice(0, -1));
  }, [clearValidationError]);

  const handleClear = useCallback(() => {
    clearValidationError();
    setAmount('');
  }, [clearValidationError]);

  const handleCalculate = useCallback(() => {
    setAmount((currentAmount) => {
      try {
        if (!currentAmount) return currentAmount;
        let expr = currentAmount;
        while (['+', '-', '*', '/', '%'].includes(expr.slice(-1))) {
          expr = expr.slice(0, -1);
        }
        if (!expr) return currentAmount;
        const result = new Function('return ' + expr)();
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) return currentAmount;
        return Number.isInteger(result)
          ? result.toString()
          : parseFloat(result.toFixed(4)).toString();
      } catch {
        return currentAmount;
      }
    });
  }, []);

  const getLiveResult = (expr: string) => {
    if (!expr || !/[\+\-\*\/\%]/.test(expr)) return '';
    try {
      let cleanExpr = expr;
      while (['+', '-', '*', '/', '%'].includes(cleanExpr.slice(-1))) {
        cleanExpr = cleanExpr.slice(0, -1);
      }
      if (!cleanExpr || !/[\+\-\*\/\%]/.test(cleanExpr)) return '';
      const result = new Function('return ' + cleanExpr)();
      if (isNaN(result) || !isFinite(result)) return '';
      return Number.isInteger(result)
        ? result.toString()
        : parseFloat(result.toFixed(4)).toString();
    } catch {
      return '';
    }
  };

  const liveResult = getLiveResult(amount);

  const handleTabChange = useCallback((newType: EntryType) => {
    if (newType !== entryType) {
      setEntryType(newType);
      setSelectedParty(null);
      clearValidationError();
      if (newType === 'Expense') {
        preloadExpenseCategories();
      }
    }
  }, [entryType, clearValidationError]);

  const handlePartySelect = useCallback((party: Party | null) => {
    setSelectedParty(party);
    clearValidationError();
  }, [clearValidationError]);

  const lastStateRef = React.useRef<{ amount: string; party: Party | null }>({
    amount: '',
    party: null,
  });

  const onRecord = useCallback(() => {
    handleCalculate();
    lastStateRef.current = { amount, party: selectedParty };
    // Use the raw amount expression — hook resolves it
    handleRecord(entryType, amount, selectedParty, () => {
      // Rollback on error: restore entered amount and party
      setAmount(lastStateRef.current.amount);
      setSelectedParty(lastStateRef.current.party);
    });
  }, [entryType, amount, selectedParty, handleRecord, handleCalculate]);

  const handleSuccessDismiss = useCallback(() => {
    dismissSuccess();
    setAmount('');
    setSelectedParty(null);
  }, [dismissSuccess]);

  const handleViewTransactions = useCallback(() => {
    dismissSuccess();
    setAmount('');
    setSelectedParty(null);
    // Navigate to transactions when that screen exists
    // router.navigate('/(tabs)/transactions');
  }, [dismissSuccess]);

  // Derive which fields have errors
  const partyError =
    validationError?.field === 'party' || validationError?.field === 'category'
      ? validationError.message
      : null;
  const amountError =
    validationError?.field === 'amount' ? validationError.message : null;

  return (
    <View className="flex-1 bg-surface">
      <QuickEntryHeader />

      <QuickEntryTabs
        selectedTab={entryType}
        onSelectTab={handleTabChange}
      />

      <PartySelector
        partyName={
          selectedParty ? selectedParty.name :
          entryType === 'Sale' ? 'Cash Sale' :
          entryType === 'Purchase' ? 'Cash Purchase' :
          entryType === 'Expense' ? 'Select Category' : 'Select Party'
        }
        entryType={entryType}
        onPress={() => setIsPartyModalVisible(true)}
        error={partyError}
      />

      {selectedParty && selectedParty.type !== 'ExpenseCategory' && (
        <View className="px-5 pb-1">
          <Text className="text-sm font-medium text-text-secondary">
            Current Balance: <Text className="font-bold text-text">Rs. {selectedParty.balance || 0}</Text>
          </Text>
        </View>
      )}

      <AmountDisplay amount={amount} liveResult={liveResult} error={amountError} />

      <View className="bg-surface">
        <RecordButton
          entryType={entryType}
          amount={amount}
          onPress={onRecord}
          isCredit={!!selectedParty}
          loading={saving}
        />

        <Numpad
          onPress={handlePress}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onCalculate={handleCalculate}
        />
      </View>

      <PartySelectionModal
        visible={isPartyModalVisible}
        onClose={() => setIsPartyModalVisible(false)}
        onSelect={handlePartySelect}
        entryType={entryType}
        selectedParty={selectedParty}
      />

      <SuccessModal
        visible={!!successInfo}
        info={successInfo}
        onClose={handleSuccessDismiss}
        onViewTransactions={handleViewTransactions}
      />
    </View>
  );
}

