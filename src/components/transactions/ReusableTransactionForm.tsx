import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  Alert,
  Modal,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { Party } from "../quick-entry/PartySelectionModal";
import { EntryType } from "../quick-entry/QuickEntryTabs";
import PaymentTypeModal from "./PaymentTypeModal";
import { AddBillingItemModal, BillingItemValues } from "../items/AddBillingItemModal";

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
  
  billingItems?: any[];
  onRemoveBillingItem?: (index: number) => void;
  onUpdateBillingItem?: (index: number, updated: any) => void;
  transactionDiscount?: string;
  onTransactionDiscountChange?: (val: string) => void;
  transactionTax?: string;
  onTransactionTaxChange?: (val: string) => void;
  additionalChargesList?: {name: string, amount: string}[];
  onAdditionalChargesListChange?: (list: {name: string, amount: string}[]) => void;

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
  billingItems = [],
  onRemoveBillingItem,
  onUpdateBillingItem,
  transactionDiscount = "",
  onTransactionDiscountChange,
  transactionTax = "",
  onTransactionTaxChange,
  additionalChargesList = [],
  onAdditionalChargesListChange,
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

  const partyInputRef = React.useRef<TextInput>(null);
  const amountInputRef = React.useRef<TextInput>(null);
  const receivedInputRef = React.useRef<TextInput>(null);

  const [isDiscountVisible, setIsDiscountVisible] = React.useState(false);
  const [isTaxVisible, setIsTaxVisible] = React.useState(false);
  const [isBillingItemsExpanded, setIsBillingItemsExpanded] = React.useState(true);

  // Local state for adjuster UI details (names/percents)
  const [globalDiscountPercent, setGlobalDiscountPercent] = React.useState("");
  const [globalTaxName, setGlobalTaxName] = React.useState("VAT 0%");
  const [globalChargeName, setGlobalChargeName] = React.useState("");
  const [isTaxDropdownOpen, setIsTaxDropdownOpen] = React.useState(false);

  const hasBillingItems = billingItems && billingItems.length > 0;
  const billingSubtotal = hasBillingItems
    ? billingItems.reduce((acc, item) => acc + (item.totalAmount || 0), 0)
    : 0;
  const canAddAdjusters = hasBillingItems;

  const formatAdjuster = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(2);

  const prevSubtotalRef = React.useRef(billingSubtotal);
  React.useEffect(() => {
    if (prevSubtotalRef.current !== billingSubtotal) {
      prevSubtotalRef.current = billingSubtotal;
      
      // Re-calculate Tax if visible
      if (isTaxVisible) {
        const taxPct = globalTaxName === "VAT 13%" ? 13 : 0;
        if (taxPct > 0 && billingSubtotal > 0) {
          const newTaxRs = (billingSubtotal * taxPct) / 100;
          onTransactionTaxChange?.(formatAdjuster(newTaxRs));
        } else {
          onTransactionTaxChange?.("");
        }
      }

      // Re-calculate Discount if visible
      if (isDiscountVisible) {
        const discPct = parseFloat(globalDiscountPercent) || 0;
        if (discPct > 0 && billingSubtotal > 0) {
          const newDiscRs = (billingSubtotal * discPct) / 100;
          onTransactionDiscountChange?.(formatAdjuster(newDiscRs));
        } else if (billingSubtotal === 0) {
          onTransactionDiscountChange?.("");
        }
      }
    }
  }, [billingSubtotal, isTaxVisible, isDiscountVisible, globalTaxName, globalDiscountPercent, onTransactionTaxChange, onTransactionDiscountChange]);

  const handleTaxSelect = (taxName: string, percent: number) => {
    setGlobalTaxName(taxName);
    setIsTaxDropdownOpen(false);
    if (percent > 0 && billingSubtotal > 0) {
      const amt = (billingSubtotal * percent) / 100;
      onTransactionTaxChange?.(formatAdjuster(amt));
    } else {
      onTransactionTaxChange?.("");
    }
  };

  const handleGlobalDiscountPercentChange = (val: string) => {
    setGlobalDiscountPercent(val);
    const percentNum = parseFloat(val) || 0;
    if (percentNum > 0 && billingSubtotal > 0) {
      const amt = (billingSubtotal * percentNum) / 100;
      onTransactionDiscountChange?.(formatAdjuster(amt));
    } else {
      onTransactionDiscountChange?.("");
    }
  };

  const handleGlobalDiscountAmountChange = (val: string) => {
    onTransactionDiscountChange?.(val);
    const amtNum = parseFloat(val) || 0;
    if (amtNum > 0 && billingSubtotal > 0) {
      const pct = (amtNum / billingSubtotal) * 100;
      setGlobalDiscountPercent(formatAdjuster(pct));
    } else {
      setGlobalDiscountPercent("");
    }
  };

  // Edit billing item modal state
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const editingItem = editingIndex !== null ? billingItems[editingIndex] : null;

  const isCash = paymentType === "cash";
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

  // Calculations for Billing Items
  const discountNum = parseFloat(transactionDiscount || "0") || 0;
  const taxNum = parseFloat(transactionTax || "0") || 0;
  const additionalNum = additionalChargesList.reduce((acc, charge) => acc + (parseFloat(charge.amount || "0") || 0), 0);
  
  const computedTotal = Math.max(0, billingSubtotal - discountNum + taxNum + additionalNum);

  // Helper to format decimals beautifully
  const formatDecimal = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(2);

  // Calculations for Balance Due
  const totalNum = hasBillingItems ? computedTotal : (parseFloat(amount) || 0);
  const displayAmount = hasBillingItems ? formatDecimal(computedTotal) : amount;
  
  // Also override hasAmountEntered
  const hasAmountEntered = hasBillingItems ? true : (!!amount.trim() && parseFloat(amount) > 0);

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
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={Keyboard.dismiss}
      showsVerticalScrollIndicator={false}
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
              ref={partyInputRef}
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
              {!hasBillingItems && (
                <Text className="text-slate-400 font-normal text-sm">
                  (Optional)
                </Text>
              )}
            </TouchableOpacity>

            {/* Barcode Scanner Button */}
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

        {/* ── Billing Items List ────────────────────────── */}
        {hasBillingItems && (
          <View className="mt-4">
            {/* Collapsible Card */}
            <View className="bg-surface rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsBillingItemsExpanded(!isBillingItemsExpanded)}
                className={`flex-row justify-between items-center px-4 py-3 ${isBillingItemsExpanded ? 'border-b border-slate-100' : ''}`}
              >
                <Text className="text-sm font-bold text-slate-800">
                  Billing Items ({billingItems.length})
                </Text>
                <Feather name={isBillingItemsExpanded ? "minus" : "plus"} size={18} color="#64748B" />
              </TouchableOpacity>
              
              {isBillingItemsExpanded && (
                <>
                  <View className="px-4">
                    {billingItems.map((item, index) => (
                      <View key={index} className="py-3 border-b border-slate-100 flex-row justify-between">
                        <View className="flex-1 mr-2">
                          <Text className="text-sm font-bold text-text mb-1">
                            {item.item.name}
                          </Text>
                          <Text className="text-xs text-slate-500 font-medium mb-0.5">
                            {item.quantity} x Rs. {item.rate} = Rs. {(item.quantity * item.rate).toFixed(2)}
                          </Text>
                          {item.discountAmount > 0 && (
                            <Text className="text-xs text-slate-500 font-medium">
                              Discount = Rs. {item.discountAmount.toFixed(2)}
                            </Text>
                          )}
                        </View>
                        <View className="items-end justify-between">
                          <Text className="text-sm font-bold text-text">
                            Rs. {item.totalAmount.toFixed(2)}
                          </Text>
                          <View className="flex-row items-center">
                            <TouchableOpacity
                              onPress={() => setEditingIndex(index)}
                              activeOpacity={0.6}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              className="p-2"
                            >
                              <Feather name="edit-2" size={17} color="#64748B" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => onRemoveBillingItem?.(index)}
                              activeOpacity={0.6}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              className="p-2 ml-1"
                            >
                              <Feather name="trash-2" size={17} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View className="flex-row justify-between items-center px-4 py-3">
                    <Text className="text-sm font-medium text-slate-500">Subtotal</Text>
                    <Text className="text-sm font-bold text-text">
                      Rs. {formatDecimal(billingSubtotal)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Action Links & Inputs */}
            {canAddAdjusters && (
              <View className="mt-4">
                {/* Active Adjusters Container (White Card) */}
                {(isDiscountVisible || isTaxVisible || additionalChargesList.length > 0) && (
                  <View className="bg-surface rounded-xl shadow-xs p-4 mb-3 gap-y-4">
                    {/* Discount Row */}
                    {isDiscountVisible && (
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <TouchableOpacity
                            onPress={() => {
                              setIsDiscountVisible(false);
                              onTransactionDiscountChange?.("");
                              setGlobalDiscountPercent("");
                            }}
                            className="mr-3"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Feather name="trash-2" size={18} color="#EF4444" />
                          </TouchableOpacity>
                          <Text className="text-sm font-medium text-slate-500">Discount</Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <View className="flex-row items-center border-b border-slate-300 w-16 justify-end pb-0.5">
                            <TextInput
                              value={globalDiscountPercent}
                              onChangeText={handleGlobalDiscountPercentChange}
                              placeholder="0"
                              placeholderTextColor="#94A3B8"
                              className="text-right text-sm text-text font-semibold p-0 h-6 flex-1"
                              keyboardType="numeric"
                            />
                            <Text className="text-sm font-medium text-slate-600 ml-1">%</Text>
                          </View>
                          
                          <Feather name="link" size={16} color="#10B981" className="mx-3" />
                          
                          <View className="flex-row items-center border-b border-slate-300 w-24 justify-end pb-0.5">
                            <Text className="text-sm font-medium text-slate-600 mr-1">Rs.</Text>
                            <TextInput
                              value={transactionDiscount}
                              onChangeText={handleGlobalDiscountAmountChange}
                              placeholder="0"
                              placeholderTextColor="#94A3B8"
                              className="text-right text-sm text-text font-semibold p-0 h-6 flex-1"
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Tax Row */}
                    {isTaxVisible && (
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <TouchableOpacity
                            onPress={() => {
                              setIsTaxVisible(false);
                              onTransactionTaxChange?.("");
                            }}
                            className="mr-3"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Feather name="trash-2" size={18} color="#EF4444" />
                          </TouchableOpacity>
                          <Text className="text-sm font-medium text-slate-500">Tax</Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <TouchableOpacity 
                            onPress={() => setIsTaxDropdownOpen(true)}
                            activeOpacity={0.7}
                            className="flex-row items-center border-b border-slate-300 w-24 justify-between pb-0.5 mr-4 h-6 relative"
                          >
                            <Text className="text-sm text-text font-medium flex-1">
                              {globalTaxName || "VAT 0%"}
                            </Text>
                            <Feather name="chevron-down" size={14} color="#64748B" />
                          </TouchableOpacity>
                          
                          <View className="flex-row items-center border-b border-slate-300 w-24 justify-end pb-0.5">
                            <Text className="text-sm font-medium text-slate-600 mr-1">Rs.</Text>
                            <TextInput
                              value={transactionTax}
                              onChangeText={onTransactionTaxChange}
                              placeholder="0"
                              placeholderTextColor="#94A3B8"
                              className="text-right text-sm text-text font-semibold p-0 h-6 flex-1"
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Additional Charges Rows */}
                    {additionalChargesList.map((charge, index) => (
                      <View key={`charge-${index}`} className="flex-row items-center justify-between mt-2">
                        <View className="flex-row items-center flex-1">
                          <TouchableOpacity
                            onPress={() => {
                              const newList = [...additionalChargesList];
                              newList.splice(index, 1);
                              onAdditionalChargesListChange?.(newList);
                            }}
                            className="mr-3"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Feather name="trash-2" size={18} color="#EF4444" />
                          </TouchableOpacity>
                          <View className="flex-1 border-b border-slate-300 pb-0.5 mr-4">
                            <TextInput
                              value={charge.name}
                              onChangeText={(text) => {
                                const newList = [...additionalChargesList];
                                newList[index].name = text;
                                onAdditionalChargesListChange?.(newList);
                              }}
                              placeholder="Enter Charge Name"
                              placeholderTextColor="#94A3B8"
                              className="text-sm text-text font-medium p-0 h-6"
                            />
                          </View>
                        </View>
                        
                        <View className="flex-row items-center border-b border-slate-300 w-24 justify-end pb-0.5">
                          <Text className="text-sm font-medium text-slate-600 mr-1">Rs.</Text>
                          <TextInput
                            value={charge.amount}
                            onChangeText={(text) => {
                              const newList = [...additionalChargesList];
                              newList[index].amount = text;
                              onAdditionalChargesListChange?.(newList);
                            }}
                            placeholder="0"
                            placeholderTextColor="#94A3B8"
                            className="text-right text-sm text-text font-semibold p-0 h-6 flex-1"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Links (Right aligned) */}
                <View className="items-end gap-y-2.5 px-1">
                  {!isDiscountVisible && transactionDiscount === "" && (
                    <TouchableOpacity onPress={() => setIsDiscountVisible(true)}>
                      <Text className="text-emerald-500 font-medium text-sm">+ Add Discount</Text>
                    </TouchableOpacity>
                  )}
                  {!isTaxVisible && transactionTax === "" && (
                    <TouchableOpacity onPress={() => setIsTaxVisible(true)}>
                      <Text className="text-emerald-500 font-medium text-sm">+ Add TAX</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={() => {
                      onAdditionalChargesListChange?.([...additionalChargesList, { name: "", amount: "" }]);
                    }}
                  >
                    <Text className="text-emerald-500 font-medium text-sm">+ Add Additional Charges</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
                onPress={() => !hasBillingItems && amountInputRef.current?.focus()}
                activeOpacity={hasBillingItems ? 1 : 0.7}
                className={`flex-row items-center h-8 w-[150px] justify-end border-b border-dashed ${
                  isAmountFocused ? "border-primary" : "border-slate-400"
                } ${hasBillingItems ? "opacity-70" : ""}`}
              >
                <Text className="text-base font-bold text-slate-800 mr-2">
                  Rs
                </Text>
                <TextInput
                  ref={amountInputRef}
                  value={displayAmount}
                  onChangeText={onAmountChange}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  editable={!hasBillingItems}
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
                    {totalNum.toFixed(2)}
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
                onPress={() => !hasBillingItems && amountInputRef.current?.focus()}
                activeOpacity={hasBillingItems ? 1 : 0.7}
                className={`flex-row items-center h-8 w-[150px] justify-end border-b border-dashed ${
                  isAmountFocused ? "border-primary" : "border-slate-400"
                } ${hasBillingItems ? "opacity-70 border-transparent" : ""}`}
              >
                <Text className="text-base font-bold text-slate-800 mr-2">
                  Rs
                </Text>
                <TextInput
                  ref={amountInputRef}
                  value={displayAmount}
                  onChangeText={onAmountChange}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  editable={!hasBillingItems}
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

            {/* Revealed breakdown for Credit Sales/Purchases when Total Amount > 0 */}
            {isItemizedType && !isCash && hasAmountEntered && totalNum > 0 && (
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

      {/* Edit Billing Item Modal (inline, no navigation needed) */}
      <AddBillingItemModal
        visible={editingIndex !== null}
        item={editingItem ? editingItem.item : null}
        mode="edit"
        initialValues={
          editingItem
            ? {
                quantity: editingItem.quantity,
                rate: editingItem.rate,
                discountAmount: editingItem.discountAmount,
              }
            : null
        }
        onClose={() => setEditingIndex(null)}
        onSave={(updated: BillingItemValues) => {
          if (editingIndex === null) return;
          onUpdateBillingItem?.(editingIndex, updated);
          setEditingIndex(null);
        }}
        onRemove={() => {
          if (editingIndex === null) return;
          onRemoveBillingItem?.(editingIndex);
          setEditingIndex(null);
        }}
      />

      {/* Tax Dropdown Modal */}
      <Modal
        visible={isTaxDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTaxDropdownOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsTaxDropdownOpen(false)}
          className="flex-1 bg-black/20 justify-center items-center"
        >
          <View className="bg-surface rounded-xl shadow-lg w-48 overflow-hidden">
            <TouchableOpacity
              onPress={() => handleTaxSelect("VAT 0%", 0)}
              className="px-5 py-4 border-b border-slate-100"
            >
              <Text className="text-base font-medium text-slate-800">VAT 0%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTaxSelect("VAT 13%", 13)}
              className="px-5 py-4"
            >
              <Text className="text-base font-medium text-slate-800">VAT 13%</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}
