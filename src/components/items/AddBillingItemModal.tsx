import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Item } from "../../types/item";

export interface BillingItemValues {
  item: Item;
  quantity: number;
  rate: number;
  discountAmount: number;
  totalAmount: number;
}

export interface AddBillingItemModalProps {
  visible: boolean;
  item: Item | null;
  onClose: () => void;
  onSave: (billingItem: BillingItemValues) => void;
  /** "add" shows Cancel + Save Item. "edit" shows Remove + Update Item. Default: "add" */
  mode?: "add" | "edit";
  /** Pre-fill fields when editing an existing billing item */
  initialValues?: Pick<BillingItemValues, "quantity" | "rate" | "discountAmount"> | null;
  /** Called when user taps Remove in edit mode */
  onRemove?: () => void;
}

export const AddBillingItemModal: React.FC<AddBillingItemModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
  mode = "add",
  initialValues = null,
  onRemove,
}) => {
  const [quantity, setQuantity] = useState("1");
  const [rate, setRate] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");

  // Initialize / reset fields when modal opens
  useEffect(() => {
    if (visible && item) {
      if (mode === "edit" && initialValues) {
        // Pre-fill with existing values when editing
        setQuantity(initialValues.quantity.toString());
        setRate(initialValues.rate.toString());
        const discAmt = initialValues.discountAmount;
        if (discAmt > 0) {
          setDiscountAmount(discAmt.toFixed(2).replace(/\.00$/, ""));
          const sub = initialValues.quantity * initialValues.rate;
          if (sub > 0) {
            const pct = (discAmt / sub) * 100;
            setDiscountPercent(pct.toFixed(2).replace(/\.00$/, ""));
          } else {
            setDiscountPercent("");
          }
        } else {
          setDiscountAmount("");
          setDiscountPercent("");
        }
      } else {
        // Fresh add: reset to defaults
        setQuantity("1");
        setRate(item.sellingPrice ? item.sellingPrice.toString() : "");
        setDiscountPercent("");
        setDiscountAmount("");
      }
    }
  }, [visible, item, mode, initialValues]);

  // Derived values for calculation
  const qtyNum = parseFloat(quantity) || 0;
  const rateNum = parseFloat(rate) || 0;
  const subtotal = qtyNum * rateNum;

  // Handle discount percent change
  const handleDiscountPercentChange = (val: string) => {
    setDiscountPercent(val);
    const percentNum = parseFloat(val) || 0;
    if (percentNum > 0 && subtotal > 0) {
      const amt = (subtotal * percentNum) / 100;
      setDiscountAmount(amt.toFixed(2).replace(/\.00$/, ""));
    } else {
      setDiscountAmount("");
    }
  };

  // Handle discount amount change
  const handleDiscountAmountChange = (val: string) => {
    setDiscountAmount(val);
    const amtNum = parseFloat(val) || 0;
    if (amtNum > 0 && subtotal > 0) {
      const pct = (amtNum / subtotal) * 100;
      setDiscountPercent(pct.toFixed(2).replace(/\.00$/, ""));
    } else {
      setDiscountPercent("");
    }
  };

  // Re-sync discount amount when qty/rate changes
  useEffect(() => {
    if (discountPercent) {
      handleDiscountPercentChange(discountPercent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, rate]);

  const totalAmount = useMemo(() => {
    const discNum = parseFloat(discountAmount) || 0;
    return Math.max(0, subtotal - discNum);
  }, [subtotal, discountAmount]);

  const handleSave = () => {
    if (!item) return;
    onSave({
      item,
      quantity: qtyNum,
      rate: rateNum,
      discountAmount: parseFloat(discountAmount) || 0,
      totalAmount,
    });
  };

  if (!item) return null;

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Billing Item" : "Add Billing Item";
  const saveLabel = isEdit ? "Update Item" : "Save Item";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Backdrop — tap to close */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { Keyboard.dismiss(); onClose(); }}
          className="flex-1 bg-black/40 justify-center items-center px-4"
        >
          {/* Card — stop propagation so tapping inside doesn't close */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="w-full max-w-md"
          >
            <View className="bg-surface rounded-2xl p-5 shadow-lg w-full">
              <Text className="text-lg font-bold text-text mb-5">
                {title}
              </Text>

              {/* Item Name (Read-only) */}
              <View className="border border-slate-200 rounded-xl px-3 py-3 bg-surface relative mb-4 flex-row items-center justify-between">
                <View className="absolute -top-2.5 left-3 bg-surface px-1.5 z-10">
                  <Text className="text-[11px] font-semibold text-slate-500">
                    Item Name
                  </Text>
                </View>
                <Text className="text-base text-text font-medium flex-1">
                  {item.name}
                </Text>
                <Feather name="chevron-right" size={20} color="#94A3B8" />
              </View>

              {/* Quantity */}
              <View className="border border-slate-200 rounded-xl px-3 py-1 bg-surface relative mb-4">
                <View className="absolute -top-2.5 left-3 bg-surface px-1.5 z-10">
                  <Text className="text-[11px] font-semibold text-slate-500">
                    Quantity
                  </Text>
                </View>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  className="text-base text-text font-medium h-10 p-0"
                  selectTextOnFocus
                />
              </View>

              {/* Rate */}
              <View className="border border-slate-200 rounded-xl px-3 py-1 bg-surface relative mb-4">
                <View className="absolute -top-2.5 left-3 bg-surface px-1.5 z-10">
                  <Text className="text-[11px] font-semibold text-slate-500">
                    Rate
                  </Text>
                </View>
                <TextInput
                  value={rate}
                  onChangeText={setRate}
                  keyboardType="numeric"
                  placeholder="Rate"
                  placeholderTextColor="#94A3B8"
                  className="text-base text-text font-medium h-10 p-0"
                  selectTextOnFocus
                />
              </View>

              {/* Discount Row */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 border border-slate-200 rounded-xl px-3 py-1 bg-surface">
                  <TextInput
                    value={discountPercent}
                    onChangeText={handleDiscountPercentChange}
                    keyboardType="numeric"
                    placeholder="Discount %"
                    placeholderTextColor="#94A3B8"
                    className="text-sm text-text font-medium h-10 p-0"
                  />
                </View>

                <View className="px-2 items-center justify-center">
                  <Feather name="link" size={16} color="#0EA5E9" />
                </View>

                <View className="flex-1 border border-slate-200 rounded-xl px-3 py-1 bg-surface">
                  <TextInput
                    value={discountAmount}
                    onChangeText={handleDiscountAmountChange}
                    keyboardType="numeric"
                    placeholder="Discount Amount"
                    placeholderTextColor="#94A3B8"
                    className="text-sm text-text font-medium h-10 p-0"
                  />
                </View>
              </View>

              {/* Total Amount */}
              <View className="bg-slate-50 rounded-xl px-4 py-3.5 mb-6 flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-slate-600">
                  Total Amount
                </Text>
                <Text className="text-base font-bold text-text">
                  Rs.{" "}
                  {totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row items-center gap-x-3">
                {/* Cancel / Remove */}
                <TouchableOpacity
                  onPress={isEdit ? onRemove : onClose}
                  activeOpacity={0.7}
                  className={`flex-1 rounded-xl py-3.5 items-center justify-center border ${
                    isEdit
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-surface"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isEdit ? "text-red-500" : "text-slate-600"
                    }`}
                  >
                    {isEdit ? "Remove" : "Cancel"}
                  </Text>
                </TouchableOpacity>

                {/* Save / Update */}
                <TouchableOpacity
                  onPress={handleSave}
                  activeOpacity={0.7}
                  className="flex-1 bg-primary rounded-xl py-3.5 items-center justify-center"
                >
                  <Text className="text-sm font-semibold text-white">
                    {saveLabel}
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddBillingItemModal;
