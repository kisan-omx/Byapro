import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import ReusableTransactionHeader from "../components/transactions/ReusableTransactionHeader";
import ReusableTransactionFooter from "../components/transactions/ReusableTransactionFooter";
import ReusableTransactionForm from "../components/transactions/ReusableTransactionForm";
import PartySelectionModal, {
  Party,
} from "../components/quick-entry/PartySelectionModal";
import SuccessModal from "../components/quick-entry/SuccessModal";
import { EntryType } from "../components/quick-entry/QuickEntryTabs";
import { useQuickEntry } from "../hooks/useQuickEntry";

export default function TransactionFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();

  // Map route params cleanly to EntryType
  const entryType: EntryType = useMemo(() => {
    const rawType = (params.type || "Sale").toLowerCase().replace("-", " ");
    if (rawType.includes("sale return") || rawType === "sale_return")
      return "Sale Return";
    if (rawType.includes("purchase return") || rawType === "purchase_return")
      return "Purchase Return";
    if (rawType.includes("payment in") || rawType === "payment_in")
      return "Payment In";
    if (rawType.includes("payment out") || rawType === "payment_out")
      return "Payment Out";
    if (rawType.includes("purchase")) return "Purchase";
    if (rawType.includes("expense")) return "Expense";
    return "Sale";
  }, [params.type]);

  const [paymentType, setPaymentType] = useState<"credit" | "cash">("cash");
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  const [invoiceNoText, setInvoiceNoText] = useState<string>("1");
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partyNameText, setPartyNameText] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isPartyModalVisible, setIsPartyModalVisible] = useState(false);
  const [isSaveAndNewMode, setIsSaveAndNewMode] = useState(false);

  // Billing Items State
  const [billingItems, setBillingItems] = useState<any[]>([]);
  const [transactionDiscount, setTransactionDiscount] = useState<string>("");
  const [transactionTax, setTransactionTax] = useState<string>("");
  const [additionalChargesList, setAdditionalChargesList] = useState<{name: string, amount: string}[]>([]);

  React.useEffect(() => {
    // Dynamically require to avoid breaking if file doesn't exist yet
    const { billingItemEvents } = require("../services/billingItemEvents");
    const unsubscribe = billingItemEvents.onAdded((newItem: any) => {
      setBillingItems((prev) => [...prev, newItem]);
    });
    return unsubscribe;
  }, []);

  // Formatted date string (e.g. 20-Bhadra-2083 or current date)
  const dateStr = useMemo(() => {
    const today = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${today.getDate()}-${months[today.getMonth()]}-${today.getFullYear()}`;
  }, []);

  const {
    saving,
    successInfo,
    validationError,
    handleRecord,
    dismissSuccess,
    clearValidationError,
  } = useQuickEntry();

  const showPaymentToggle =
    entryType === "Sale" ||
    entryType === "Purchase" ||
    entryType === "Sale Return" ||
    entryType === "Purchase Return";
  const showAddItems =
    entryType === "Sale" ||
    entryType === "Purchase" ||
    entryType === "Sale Return" ||
    entryType === "Purchase Return";

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePartySelect = useCallback(
    (party: Party | null) => {
      setSelectedParty(party);
      setPartyNameText(party ? party.name : "");
      clearValidationError();
    },
    [clearValidationError],
  );

  const handlePartyNameChange = useCallback(
    (text: string) => {
      clearValidationError();
      setPartyNameText(text);
      if (text.trim()) {
        setSelectedParty({
          id: selectedParty?.id || `custom-${Date.now()}`,
          name: text.trim(),
          subtitle: selectedParty?.subtitle,
          balance: selectedParty?.balance || 0,
          type: "Party",
        });
      } else {
        setSelectedParty(null);
      }
    },
    [clearValidationError, selectedParty],
  );

  const handleAddItems = useCallback(() => {
    router.navigate({
      pathname: "/select-item",
      params: { type: entryType },
    });
  }, [router, entryType]);

  const handleBarcodeScan = useCallback(() => {
    router.navigate({
      pathname: "/barcode-scan",
      params: { type: entryType },
    });
  }, [router, entryType]);

  const executeRecord = useCallback(
    (isSaveAndNew: boolean) => {
      setIsSaveAndNewMode(isSaveAndNew);

      // Compute final amount if we have billing items
      let finalAmount = amount;
      if (billingItems && billingItems.length > 0) {
        const subtotal = billingItems.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
        const discNum = parseFloat(transactionDiscount || "0") || 0;
        const taxNum = parseFloat(transactionTax || "0") || 0;
        const addNum = additionalChargesList.reduce((acc, charge) => acc + (parseFloat(charge.amount || "0") || 0), 0);
        const computed = Math.max(0, subtotal - discNum + taxNum + addNum);
        finalAmount = computed.toString();
      }

      handleRecord(entryType, finalAmount, selectedParty, () => {
        // Rollback state if background save fails completely
      });
    },
    [handleRecord, entryType, amount, selectedParty, billingItems, transactionDiscount, transactionTax, additionalChargesList],
  );

  const handleSave = useCallback(() => {
    executeRecord(false);
  }, [executeRecord]);

  const handleSaveAndNew = useCallback(() => {
    executeRecord(true);
  }, [executeRecord]);

  const handleSuccessClose = useCallback(() => {
    dismissSuccess();
    if (isSaveAndNewMode) {
      // Reset form for next entry
      setAmount("");
      setBillingItems([]);
      setTransactionDiscount("");
      setTransactionTax("");
      setAdditionalChargesList([]);
      setSelectedParty(null);
      setPartyNameText("");
      setNote("");
      const nextNum = invoiceCounter + 1;
      setInvoiceCounter(nextNum);
      setInvoiceNoText(nextNum.toString());
    } else {
      // Return back to previous screen
      router.back();
    }
  }, [dismissSuccess, isSaveAndNewMode, invoiceCounter, router]);

  const partyError =
    validationError?.field === "party" || validationError?.field === "category"
      ? validationError.message
      : null;
  const amountError =
    validationError?.field === "amount" ? validationError.message : null;

  return (
    <View className="flex-1 bg-surface">
      {/* ── Reusable Header (No Settings Icon) ────────────────────────── */}
      <ReusableTransactionHeader
        title={entryType}
        paymentType={paymentType}
        onPaymentTypeChange={(type) => {
          clearValidationError();
          setPaymentType(type);
        }}
        showPaymentToggle={showPaymentToggle}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={0}
        className="flex-1"
      >
        <View className="flex-1">
            {/* ── Reusable Form Body ─────────────────────────────────────────── */}
            <ReusableTransactionForm
                entryType={entryType}
                paymentType={paymentType}
                invoiceNo={invoiceNoText}
                onInvoiceNoChange={setInvoiceNoText}
                date={dateStr}
                selectedParty={selectedParty}
                partyNameText={partyNameText}
                onPartyNameChange={handlePartyNameChange}
                onPartyPress={() => setIsPartyModalVisible(true)}
                amount={amount}
                onAmountChange={(val) => {
                  clearValidationError();
                  setAmount(val);
                }}
                showAddItems={showAddItems}
                onAddItemsPress={handleAddItems}
                onBarcodeScanPress={handleBarcodeScan}
                billingItems={billingItems}
                onRemoveBillingItem={(index) => {
                  setBillingItems((prev) => prev.filter((_, i) => i !== index));
                }}
                onUpdateBillingItem={(index, updated) => {
                  setBillingItems((prev) =>
                    prev.map((item, i) => (i === index ? updated : item))
                  );
                }}
                transactionDiscount={transactionDiscount}
                onTransactionDiscountChange={setTransactionDiscount}
                transactionTax={transactionTax}
                onTransactionTaxChange={setTransactionTax}
                additionalChargesList={additionalChargesList}
                onAdditionalChargesListChange={setAdditionalChargesList}
                note={note}
                onNoteChange={setNote}
                partyError={partyError}
                amountError={amountError}
              />

            {/* ── Reusable Footer (Save & New + Save, No Three Dot) ────────── */}
            <ReusableTransactionFooter
              onSave={handleSave}
              onSaveAndNew={handleSaveAndNew}
              loading={saving}
            />
          </View>
      </KeyboardAvoidingView>

      {/* ── Party / Category Selection Modal ─────────────────────────── */}
      <PartySelectionModal
        visible={isPartyModalVisible}
        onClose={() => setIsPartyModalVisible(false)}
        onSelect={handlePartySelect}
        entryType={entryType}
        selectedParty={selectedParty}
      />

      {/* ── Success Confirmation Modal ───────────────────────────────── */}
      <SuccessModal
        visible={!!successInfo}
        info={successInfo}
        onClose={handleSuccessClose}
        onViewTransactions={() => {
          dismissSuccess();
          router.navigate("/(tabs)/transactions");
        }}
      />
    </View>
  );
}
