import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { Party } from "../quick-entry/PartySelectionModal";
import { EntryType } from "../quick-entry/QuickEntryTabs";
import PaymentTypeModal from "./PaymentTypeModal";

export interface ReusableTransactionFormProps {
  entryType: EntryType;
  paymentType?: "credit" | "cash";
  invoiceNo: string;
  onInvoiceNoChange?: (text: string) => void;
  onInvoiceNoPress?: () => void;
  date: string;
  onDatePress?: () => void;
  selectedParty: Party | null;
  partyNameText: string;
  onPartyNameChange: (text: string) => void;
  onPartyPress: () => void;
  amount: string;
  onAmountChange: (value: string) => void;
  showAddItems?: boolean;
  onAddItemsPress?: () => void;
  onBarcodeScanPress?: () => void;
  note?: string;
  onNoteChange?: (note: string) => void;
  partyError?: string | null;
  amountError?: string | null;
}

export default function ReusableTransactionForm({
  entryType,
  paymentType = "cash",
  invoiceNo,
  onInvoiceNoChange,
  onInvoiceNoPress,
  date,
  onDatePress,
  selectedParty,
  partyNameText,
  onPartyNameChange,
  onPartyPress,
  amount,
  onAmountChange,
  showAddItems = true,
  onAddItemsPress,
  onBarcodeScanPress,
  note = "",
  onNoteChange,
  partyError,
  amountError,
}: ReusableTransactionFormProps) {
  const [isAmountFocused, setIsAmountFocused] = React.useState(false);
  const [isPartyFocused, setIsPartyFocused] = React.useState(false);
  const [isReceivedFocused, setIsReceivedFocused] = React.useState(false);
  const [isNoteFocused, setIsNoteFocused] = React.useState(false);

  const [isReceivedChecked, setIsReceivedChecked] = React.useState(false);
  const [receivedAmount, setReceivedAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("Cash");
  const [isPaymentTypeModalOpen, setIsPaymentTypeModalOpen] =
    React.useState(false);

  const renderPaymentPillIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "cheque":
        return (
          <FontAwesome5
            name="money-check"
            size={14}
            color="#D97706"
            style={{ marginRight: 6 }}
          />
        );
      case "bank":
        return (
          <MaterialCommunityIcons
            name="bank"
            size={16}
            color="#0284C7"
            style={{ marginRight: 6 }}
          />
        );
      case "online":
        return (
          <Ionicons
            name="card-outline"
            size={16}
            color="#9333EA"
            style={{ marginRight: 6 }}
          />
        );
      default:
        return (
          <MaterialCommunityIcons
            name="cash-multiple"
            size={16}
            color="#16A34A"
            style={{ marginRight: 6 }}
          />
        );
    }
  };

  const amountInputRef = React.useRef<TextInput>(null);
  const receivedInputRef = React.useRef<TextInput>(null);

  const isCash = paymentType === "cash";
  const hasAmountEntered = !!amount.trim() && parseFloat(amount) > 0;
  const isDirectPaymentType =
    entryType === "Payment In" || entryType === "Payment Out";
  const isItemizedType =
    entryType === "Sale" ||
    entryType === "Purchase" ||
    entryType === "Sale Return" ||
    entryType === "Purchase Return";

  const isReceivedType =
    entryType === "Sale" ||
    entryType === "Purchase Return" ||
    entryType === "Payment In";
  const receivedLabel = isReceivedType ? "Received" : "Paid";
  const showReceivedCheckbox = entryType === "Sale" || entryType === "Purchase";

  // Calculations for Balance Due
  const totalNum = parseFloat(amount) || 0;
  const receivedNum =
    receivedAmount.trim() !== ""
      ? parseFloat(receivedAmount) || 0
      : isReceivedChecked
        ? totalNum
        : 0;
  const balanceDue = Math.max(0, totalNum - receivedNum);

  const handleToggleReceived = React.useCallback(() => {
    setIsReceivedChecked((prev) => {
      const next = !prev;
      if (next) {
        // Toggled ON: Set full total amount
        setReceivedAmount(totalNum > 0 ? totalNum.toString() : "");
      } else {
        // Toggled OFF: Clear received amount (resets to 0)
        setReceivedAmount("");
      }
      return next;
    });
  }, [totalNum]);

  // Derive labels based on transaction entry type
  const getRefLabel = () => {
    switch (entryType) {
      case "Sale":
        return "Invoice No.";
      case "Purchase":
        return "Bill No.";
      case "Payment In":
        return "Receipt No.";
      case "Payment Out":
        return "Voucher No.";
      case "Sale Return":
      case "Purchase Return":
        return "Return No.";
      case "Expense":
        return "Expense No.";
      default:
        return "Ref No.";
    }
  };

  const isPartyRequired =
    entryType === "Payment In" ||
    entryType === "Payment Out" ||
    entryType === "Expense" ||
    !isCash;

  const getPartyLabel = () => {
    switch (entryType) {
      case "Sale":
      case "Sale Return":
        return isCash ? "Billing Name (Optional)" : "Customer";
      case "Purchase":
      case "Purchase Return":
        return isCash ? "Billing Name (Optional)" : "Supplier";
      case "Payment In":
        return "Customer";
      case "Payment Out":
        return "Supplier";
      case "Expense":
        return "Category";
      default:
        return isCash ? "Billing Name (Optional)" : "Party";
    }
  };

  const partyLabel = getPartyLabel();
  const refLabel = getRefLabel();

  const isReturnEntry =
    entryType === "Sale Return" || entryType === "Purchase Return";

  return (
    <ScrollView
      className="flex-1 bg-slate-100"
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Subheader Details Row (Ref No / Date) ───────────────── */}
      <View className="flex-row bg-surface border-b border-slate-200">
        {/* Ref / Invoice Number Column (Editable TextInput, No Arrow) */}
        <View className="flex-1 px-4 py-2.5 border-r border-slate-200 justify-center">
          <Text className="text-xs text-slate-400 font-medium mb-0.5">
            {refLabel}
          </Text>
          <TextInput
            value={invoiceNo}
            onChangeText={onInvoiceNoChange}
            placeholder="1"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            style={{ paddingVertical: 0, includeFontPadding: false }}
            className="text-sm font-semibold text-text p-0 h-6"
          />
        </View>

        {/* Date Column */}
        <TouchableOpacity
          onPress={onDatePress}
          className="flex-1 px-4 py-3 justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-xs text-slate-400 font-medium mb-0.5">
            Date
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-text">{date}</Text>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Top Section Container (White BG with top gap mt-3 & bottom gap mb-4, no border) ─── */}
      <View className="bg-surface p-4 pt-6 pb-6 mt-3 mb-4">
        {/* Party / Customer / Billing Name Writable Input Field */}
        <View
          className={`rounded-lg px-3.5 py-0.5 bg-surface relative mb-5 ${
            partyError
              ? "border-2 border-red-500"
              : isPartyFocused
                ? "border-2 border-primary"
                : "border border-slate-300"
          }`}
        >
          {/* Floating/Top Tag Label */}
          <View className="absolute -top-3 left-3 bg-surface px-1.5 z-10 flex-row items-center">
            <Text
              className={`text-xs font-semibold ${
                partyError
                  ? "text-red-500"
                  : isPartyFocused
                    ? "text-primary"
                    : "text-slate-500"
              }`}
            >
              {partyLabel}{" "}
              {isPartyRequired && <Text className="text-red-500">*</Text>}
            </Text>
          </View>

          <View className="flex-row items-center justify-between min-h-[44px]">
            <TextInput
              value={partyNameText}
              onChangeText={onPartyNameChange}
              onFocus={() => setIsPartyFocused(true)}
              onBlur={() => setIsPartyFocused(false)}
              placeholder={
                isPartyRequired
                  ? `Enter ${partyLabel}`
                  : "Billing Name (Optional)"
              }
              placeholderTextColor="#94A3B8"
              className="flex-1 text-base font-medium text-text py-2 p-0"
              autoFocus={true}
            />
            <TouchableOpacity
              onPress={onPartyPress}
              className="p-1.5 ml-1 rounded-lg active:bg-slate-100"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
        {partyError && (
          <Text className="text-xs text-red-500 font-medium -mt-4 mb-4 px-1">
            {partyError}
          </Text>
        )}

        {/* Side-by-Side Original Bill/Invoice Date & Ref No. Inputs (ONLY for Sale Return & Purchase Return) */}
        {isReturnEntry && (
          <View className="flex-row gap-3 mb-5">
            {/* Bill/Invoice Date Input Box */}
            <TouchableOpacity
              onPress={onDatePress}
              activeOpacity={0.7}
              className="flex-1 rounded-lg px-3.5 bg-surface border border-slate-300 relative justify-center min-h-[44px]"
            >
              <View className="absolute -top-3 left-3 bg-surface px-1.5 z-10">
                <Text className="text-xs font-semibold text-slate-500">
                  {entryType === "Sale Return" ? "Invoice Date" : "Bill Date"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-text">{date}</Text>
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
              </View>
            </TouchableOpacity>

            {/* Bill/Invoice No. Input Box (Editable TextInput, No Arrow) */}
            <View className="flex-1 rounded-lg px-3.5 bg-surface border border-slate-300 relative justify-center min-h-[44px]">
              <View className="absolute -top-3 left-3 bg-surface px-1.5 z-10">
                <Text className="text-xs font-semibold text-slate-500">
                  {entryType === "Sale Return" ? "Invoice No." : "Bill No."}
                </Text>
              </View>
              <TextInput
                value={invoiceNo}
                onChangeText={onInvoiceNoChange}
                placeholder="1"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                style={{ paddingVertical: 0, includeFontPadding: false }}
                className="text-sm font-semibold text-text p-0 h-6"
              />
            </View>
          </View>
        )}

        {/* Current Party Balance if selected */}
        {selectedParty && selectedParty.type !== "ExpenseCategory" && (
          <View className="mb-5 px-1 flex-row items-center">
            <Text className="text-xs text-slate-500 font-medium">
              Current Balance:{" "}
              <Text className="font-bold text-slate-800">
                Rs. {selectedParty.balance || 0}
              </Text>
            </Text>
          </View>
        )}

        {/* Add Items (Optional) Button + Barcode Scanner Button */}
        {showAddItems && (
          <View className="flex-row items-stretch gap-2.5">
            {/* Add Items Main Button */}
            <TouchableOpacity
              onPress={onAddItemsPress}
              activeOpacity={0.7}
              className="flex-1 border border-slate-300 bg-surface min-h-[44px] py-2.5 rounded-lg flex-row items-center justify-center shadow-xs"
            >
              <View className="w-5 h-5 rounded-full bg-primary items-center justify-center mr-2">
                <Ionicons name="add" size={14} color="white" />
              </View>
              <Text className="text-primary font-bold text-sm mr-1">
                Add Items
              </Text>
              <Text className="text-slate-400 font-normal text-sm">
                (Optional)
              </Text>
            </TouchableOpacity>

            {/* Barcode Scanner Button (Same Height, Increased Width w-16) */}
            <TouchableOpacity
              onPress={onBarcodeScanPress}
              activeOpacity={0.7}
              className="w-16 border border-slate-300 bg-surface min-h-[44px] rounded-lg items-center justify-center shadow-xs"
            >
              <MaterialCommunityIcons
                name="barcode-scan"
                size={24}
                color="#0EA5E9"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Financial Section ────────────────────────────────────────────── */}
      <View className="px-5 py-3">
        {isDirectPaymentType ? (
          /* ── Payment In & Payment Out Financial Layout (Matches Mockup) ── */
          <View>
            {/* Row 1: Received / Paid Input Row (No Checkbox) */}
            <View className="flex-row items-center justify-between h-8">
              <Text className="text-base font-bold text-slate-800">
                {receivedLabel}
              </Text>
              <TouchableOpacity
                onPress={() => amountInputRef.current?.focus()}
                activeOpacity={1}
                className={`flex-row items-center h-8 w-[150px] justify-end border-b border-dashed ${
                  isAmountFocused ? "border-primary" : "border-slate-400"
                }`}
              >
                <Text className="text-base font-bold text-slate-800 mr-2">
                  Rs
                </Text>
                <TextInput
                  ref={amountInputRef}
                  value={amount}
                  onChangeText={onAmountChange}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  placeholder=""
                  keyboardType="numeric"
                  style={{ paddingVertical: 0, includeFontPadding: false }}
                  className="text-lg font-bold text-text text-right flex-1 p-0 h-7"
                />
              </TouchableOpacity>
            </View>
            {amountError && (
              <Text className="text-xs text-red-500 font-medium text-right mt-1">
                {amountError}
              </Text>
            )}

            {/* Row 2: Total Amount Summary Row in Green (Revealed when amount entered) */}
            {hasAmountEntered && (
              <View className="mt-3.5 flex-row items-center justify-between h-8">
                <Text className="text-base font-bold text-emerald-600">
                  Total Amount
                </Text>
                <View className="flex-row items-center h-8 w-[150px] justify-end">
                  <Text className="text-base font-bold text-emerald-600 mr-2">
                    Rs
                  </Text>
                  <Text className="text-lg font-bold text-emerald-600 text-right flex-1">
                    {(parseFloat(amount) || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* ── Sale, Purchase & Expense Financial Layout ──────────────────── */
          <View>
            {/* Total Amount Row */}
            <View className="flex-row items-center justify-between h-8">
              <Text className="text-base font-bold text-slate-800">
                Total Amount
              </Text>
              <TouchableOpacity
                onPress={() => amountInputRef.current?.focus()}
                activeOpacity={1}
                className={`flex-row items-center h-8 w-[150px] justify-end border-b border-dashed ${
                  isAmountFocused ? "border-primary" : "border-slate-400"
                }`}
              >
                <Text className="text-base font-bold text-slate-800 mr-2">
                  Rs
                </Text>
                <TextInput
                  ref={amountInputRef}
                  value={amount}
                  onChangeText={onAmountChange}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  placeholder=""
                  keyboardType="numeric"
                  style={{ paddingVertical: 0, includeFontPadding: false }}
                  className="text-lg font-bold text-text text-right flex-1 p-0 h-7"
                />
              </TouchableOpacity>
            </View>
            {amountError && (
              <Text className="text-xs text-red-500 font-medium text-right mt-1">
                {amountError}
              </Text>
            )}

            {/* Revealed breakdown for Credit Sales/Purchases when Total Amount is entered */}
            {isItemizedType && !isCash && hasAmountEntered && (
              <View className="mt-3.5 gap-3.5">
                {/* Received / Paid Row (Bold Label) */}
                <View className="flex-row items-center justify-between h-8">
                  {showReceivedCheckbox ? (
                    <TouchableOpacity
                      onPress={handleToggleReceived}
                      activeOpacity={0.7}
                      className="flex-row items-center"
                    >
                      <View
                        className={`w-5 h-5 rounded border-2 items-center justify-center ${
                          isReceivedChecked
                            ? "bg-primary border-primary"
                            : "bg-surface border-slate-400"
                        }`}
                      >
                        {isReceivedChecked && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                      <Text className="text-base font-bold text-slate-800 ml-2.5">
                        {receivedLabel}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text className="text-base font-bold text-slate-800">
                      {receivedLabel}
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() => receivedInputRef.current?.focus()}
                    activeOpacity={1}
                    className={`flex-row items-center h-8 w-[150px] justify-end border-b border-dashed ${
                      isReceivedFocused ? "border-primary" : "border-slate-400"
                    }`}
                  >
                    <Text className="text-base font-bold text-slate-800 mr-2">
                      Rs
                    </Text>
                    <TextInput
                      ref={receivedInputRef}
                      value={receivedAmount}
                      onChangeText={(val) => {
                        setReceivedAmount(val);
                        if (val.trim() === "") {
                          setIsReceivedChecked(false);
                        } else {
                          setIsReceivedChecked(true);
                        }
                      }}
                      onFocus={() => setIsReceivedFocused(true)}
                      onBlur={() => setIsReceivedFocused(false)}
                      placeholder=""
                      keyboardType="numeric"
                      style={{ paddingVertical: 0, includeFontPadding: false }}
                      className="text-lg font-bold text-text text-right flex-1 p-0 h-7"
                    />
                  </TouchableOpacity>
                </View>

                {/* Balance Due Row (Bold Label, Aligned Rs) */}
                <View className="flex-row items-center justify-between h-8">
                  <Text className="text-base font-bold text-emerald-600">
                    Balance Due
                  </Text>
                  <View className="flex-row items-center h-8 w-[150px] justify-end">
                    <Text className="text-base font-bold text-emerald-600 mr-2">
                      Rs
                    </Text>
                    <Text className="text-lg font-bold text-emerald-600 text-right flex-1">
                      {balanceDue.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Merged Payment Type & Description Container (No Outer Borders) ────── */}
      {hasAmountEntered && (
        <View className="bg-surface p-4 mt-3 mb-6">
          {/* Payment Type Section */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-slate-500 font-semibold">
              Payment Type
            </Text>
            <TouchableOpacity
              onPress={() => setIsPaymentTypeModalOpen(true)}
              activeOpacity={0.7}
              className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              {renderPaymentPillIcon(paymentMethod)}
              <Text className="text-sm font-semibold text-slate-700 mr-1.5">
                {paymentMethod}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setIsPaymentTypeModalOpen(true)}
            activeOpacity={0.7}
            className="pt-1 mb-5"
          >
            <Text className="text-primary font-semibold text-sm">
              + Add Payment Type
            </Text>
          </TouchableOpacity>

          {/* Description / Note Input */}
          <View
            className={`border rounded-lg p-3 bg-surface relative ${
              isNoteFocused ? "border-2 border-primary" : "border-slate-300"
            }`}
          >
            {/* Floating Label */}
            <View className="absolute -top-3 left-3 bg-surface px-1.5 z-10 flex-row items-center">
              <Text
                className={`text-xs font-semibold ${isNoteFocused ? "text-primary" : "text-slate-500"}`}
              >
                Description
              </Text>
            </View>

            <TextInput
              value={note}
              onChangeText={onNoteChange}
              onFocus={() => setIsNoteFocused(true)}
              onBlur={() => setIsNoteFocused(false)}
              placeholder="Add Note"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="text-sm text-text min-h-[60px] p-0"
            />
          </View>
        </View>
      )}

      {/* Payment Type Selection Modal */}
      <PaymentTypeModal
        visible={isPaymentTypeModalOpen}
        onClose={() => setIsPaymentTypeModalOpen(false)}
        selectedMethod={paymentMethod}
        onSelectMethod={(method) => setPaymentMethod(method)}
      />
    </ScrollView>
  );
}
