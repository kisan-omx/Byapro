import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UNIT_OPTIONS } from '../../constants/items';

// ─────────────────────────────────────────────────
// Form state type
// ─────────────────────────────────────────────────
interface FormState {
  name: string;
  sellingPrice: string;
  purchasePrice: string;
  unit: string;
  stockQuantity: string;
  lowStockAlert: string;
  sku: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  sellingPrice: '',
  purchasePrice: '',
  unit: '',
  stockQuantity: '',
  lowStockAlert: '',
  sku: '',
};

// ─────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────
function validate(form: FormState): string | null {
  if (!form.name.trim()) return 'Item name is required.';
  if (!form.sellingPrice.trim()) return 'Selling price is required.';
  const sp = parseFloat(form.sellingPrice);
  if (isNaN(sp) || sp < 0) return 'Enter a valid selling price.';
  if (form.purchasePrice.trim()) {
    const pp = parseFloat(form.purchasePrice);
    if (isNaN(pp) || pp < 0) return 'Enter a valid purchase price.';
  }
  if (form.stockQuantity.trim()) {
    const qty = parseFloat(form.stockQuantity);
    if (isNaN(qty) || qty < 0) return 'Enter a valid opening stock quantity.';
  }
  if (form.lowStockAlert.trim()) {
    const alert = parseFloat(form.lowStockAlert);
    if (isNaN(alert) || alert < 0) return 'Enter a valid low stock alert value.';
  }
  return null;
}

// ─────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────
export interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (data: {
    name: string;
    sellingPrice: number;
    purchasePrice?: number;
    unit?: string;
    stockQuantity?: number;
    lowStockAlert?: number;
    sku?: string;
  }) => Promise<any>;
}

// ─────────────────────────────────────────────────
// Reusable labeled text field
// ─────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  required?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoFocus?: boolean;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}

const FormField: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  keyboardType = 'default',
  required = false,
  autoCapitalize = 'sentences',
  autoFocus = false,
  returnKeyType = 'next',
  onSubmitEditing,
  inputRef,
}) => (
  <View className="mb-4">
    <Text className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
      {label}
      {required && <Text className="text-error"> *</Text>}
    </Text>
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      autoFocus={autoFocus}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      className="bg-background border border-border/90 rounded-xl px-4 py-3.5 text-sm text-text font-medium"
    />
  </View>
);

// ─────────────────────────────────────────────────
// Unit selector row
// ─────────────────────────────────────────────────
interface UnitSelectorProps {
  selected: string;
  onSelect: (unit: string) => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({ selected, onSelect }) => (
  <View className="mb-4">
    <Text className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
      Unit
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 2 }}
    >
      {UNIT_OPTIONS.map((unit) => {
        const isSelected = selected === unit;
        return (
          <TouchableOpacity
            key={unit}
            onPress={() => onSelect(isSelected ? '' : unit)}
            activeOpacity={0.75}
            className={`px-3.5 py-2 rounded-full mr-2 border ${
              isSelected
                ? 'bg-primary border-primary'
                : 'bg-slate-100/90 border-slate-200/80'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isSelected ? 'text-white' : 'text-slate-700'
              }`}
            >
              {unit}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

// ─────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────
export const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onAddItem,
}) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Refs for sequential field focus
  const sellingPriceRef = useRef<TextInput>(null);
  const purchasePriceRef = useRef<TextInput>(null);
  const stockQtyRef = useRef<TextInput>(null);
  const lowStockRef = useRef<TextInput>(null);
  const skuRef = useRef<TextInput>(null);

  const updateField = useCallback((field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }, [error]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setError(null);
    setSaving(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSave = useCallback(async () => {
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onAddItem({
        name: form.name.trim(),
        sellingPrice: parseFloat(form.sellingPrice),
        purchasePrice: form.purchasePrice.trim() ? parseFloat(form.purchasePrice) : undefined,
        unit: form.unit.trim() || undefined,
        stockQuantity: form.stockQuantity.trim() ? parseFloat(form.stockQuantity) : undefined,
        lowStockAlert: form.lowStockAlert.trim() ? parseFloat(form.lowStockAlert) : undefined,
        sku: form.sku.trim() || undefined,
      });

      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [form, onAddItem, onClose, resetForm]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-surface rounded-t-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-slate-300" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-border/60">
              <Text className="text-lg font-bold text-text">Add New Item</Text>
              <TouchableOpacity onPress={handleClose} className="p-1">
                <Feather name="x" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
              bounces={false}
            >
              {/* Error banner */}
              {error ? (
                <View className="flex-row items-center bg-error-light border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <Feather name="alert-circle" size={16} color="#DC2626" />
                  <Text className="text-sm font-semibold text-error ml-2 flex-1">{error}</Text>
                </View>
              ) : null}

              {/* Item name — required */}
              <FormField
                label="Item Name"
                required
                value={form.name}
                onChangeText={updateField('name')}
                placeholder="e.g. Coca Cola, Rice 5kg"
                autoCapitalize="words"
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => sellingPriceRef.current?.focus()}
              />

              {/* Pricing row */}
              <View className="flex-row gap-x-3">
                <View className="flex-1">
                  <FormField
                    label="Selling Price"
                    required
                    value={form.sellingPrice}
                    onChangeText={updateField('sellingPrice')}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => purchasePriceRef.current?.focus()}
                    inputRef={sellingPriceRef}
                  />
                </View>
                <View className="flex-1">
                  <FormField
                    label="Purchase Price"
                    value={form.purchasePrice}
                    onChangeText={updateField('purchasePrice')}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => stockQtyRef.current?.focus()}
                    inputRef={purchasePriceRef}
                  />
                </View>
              </View>

              {/* Unit selector */}
              <UnitSelector
                selected={form.unit}
                onSelect={updateField('unit')}
              />

              {/* Stock row */}
              <View className="flex-row gap-x-3">
                <View className="flex-1">
                  <FormField
                    label="Opening Stock"
                    value={form.stockQuantity}
                    onChangeText={updateField('stockQuantity')}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => lowStockRef.current?.focus()}
                    inputRef={stockQtyRef}
                  />
                </View>
                <View className="flex-1">
                  <FormField
                    label="Low Stock Alert"
                    value={form.lowStockAlert}
                    onChangeText={updateField('lowStockAlert')}
                    placeholder="e.g. 5"
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => skuRef.current?.focus()}
                    inputRef={lowStockRef}
                  />
                </View>
              </View>

              {/* SKU */}
              <FormField
                label="SKU / Barcode (Optional)"
                value={form.sku}
                onChangeText={updateField('sku')}
                placeholder="e.g. SKU-001"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                inputRef={skuRef}
              />

              {/* Save button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
                className={`bg-primary rounded-full py-4 items-center justify-center mt-2 shadow-sm ${
                  saving ? 'opacity-60' : ''
                }`}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-extrabold">Save Item</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddItemModal;
