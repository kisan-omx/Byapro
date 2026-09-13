import { useState, useCallback } from 'react';
import { auth } from '../lib/firebase';
import { getBusinessId } from '../services/quickEntryService';
import { createItem } from '../services/itemService';
import { itemEvents } from '../services/itemEvents';
import { generateUUID } from '../utils/uuid';
import { Item } from '../types/item';
import { ADD_ITEM_CONSTANTS, ItemType, UNIT_OPTIONS } from '../constants/items';

// ─────────────────────────────────────────────────
// Form state
// ─────────────────────────────────────────────────
export interface AddItemFormState {
  name: string;
  sellingPrice: string;
  purchasePrice: string;
  unit: string;
  secondaryUnit: string;
  conversionRate: string;
  categoryId: string;
  categoryName: string;
  stockQuantity: string;
  asOfDate: string;
  atPrice: string;
  lowStockAlert: string;
  itemLocation: string;
  sku: string;
  itemType: ItemType;
}

const TODAY = new Date();
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEFAULT_AS_OF_DATE = `${TODAY.getDate()}-${SHORT_MONTHS[TODAY.getMonth()]}-${TODAY.getFullYear()}`;

const INITIAL_FORM: AddItemFormState = {
  name: '',
  sellingPrice: '',
  purchasePrice: '',
  unit: '',
  secondaryUnit: '',
  conversionRate: '',
  categoryId: '',
  categoryName: '',
  stockQuantity: '',
  asOfDate: DEFAULT_AS_OF_DATE,
  atPrice: '',
  lowStockAlert: '',
  itemLocation: '',
  sku: '',
  itemType: 'product',
};

// ─────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────
function validate(form: AddItemFormState): string | null {
  const V = ADD_ITEM_CONSTANTS.VALIDATION;
  if (!form.name.trim()) return V.NAME_REQUIRED;
  return null;
}

// ─────────────────────────────────────────────────
// useAddItem hook
// ─────────────────────────────────────────────────
export function useAddItem() {
  const [form, setForm] = useState<AddItemFormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);

  const updateField = useCallback(
    (field: keyof AddItemFormState) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errorMsg) setErrorMsg(null);
    },
    [errorMsg],
  );

  const setItemType = useCallback((type: ItemType) => {
    setForm((prev) => ({ ...prev, itemType: type }));
  }, []);

  const setUnit = useCallback((unit: string) => {
    setForm((prev) => ({ ...prev, unit }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrorMsg(null);
    setSaving(false);
  }, []);

  const openUnitModal = useCallback(() => setIsUnitModalVisible(true), []);
  const closeUnitModal = useCallback(() => setIsUnitModalVisible(false), []);

  const handleSelectUnit = useCallback(
    (unit: string, secondaryUnit: string, conversionRate?: string) => {
      setForm((prev) => ({
        ...prev,
        unit,
        secondaryUnit,
        conversionRate: conversionRate ?? prev.conversionRate,
      }));
      setIsUnitModalVisible(false);
    },
    [],
  );

  // Whether the form has minimum required data to enable Save
  const isValid = form.name.trim().length > 0;

  const save = useCallback(async (): Promise<boolean> => {
    const validationError = validate(form);
    if (validationError) {
      setErrorMsg(validationError);
      return false;
    }

    setSaving(true);
    setErrorMsg(null);

    const tempId = generateUUID();
    const qty = form.stockQuantity.trim() ? parseFloat(form.stockQuantity) : 0;
    const lowAlert = form.lowStockAlert.trim() ? parseFloat(form.lowStockAlert) : null;
    const convRate = form.conversionRate.trim() ? parseFloat(form.conversionRate) : null;

    let stockStatus: Item['stockStatus'] = 'in_stock';
    if (qty <= 0) stockStatus = 'out_of_stock';
    else if (lowAlert != null && qty <= lowAlert) stockStatus = 'low_stock';

    const sp = form.sellingPrice.trim() ? parseFloat(form.sellingPrice) : 0;

    const optimisticItem: Item = {
      id: tempId,
      businessId: '',
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      sellingPrice: sp,
      purchasePrice: form.purchasePrice.trim() ? parseFloat(form.purchasePrice) : null,
      stockQuantity: qty,
      asOfDate: form.asOfDate || null,
      atPrice: form.atPrice.trim() ? parseFloat(form.atPrice) : null,
      lowStockAlert: lowAlert,
      itemLocation: form.itemLocation.trim() || null,
      unit: form.unit.trim().toUpperCase() || null,
      secondaryUnit: form.secondaryUnit.trim().toUpperCase() || null,
      conversionRate: convRate,
      categoryId: form.categoryId || null,
      itemType: form.itemType,
      createdAt: new Date().toISOString(),
      stockStatus,
      avatarLetter: (form.name.trim()[0] ?? '?').toUpperCase(),
      syncStatus: 'saving',
    };

    itemEvents.emitCreated(optimisticItem);

    // Persist in background — non-blocking
    (async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        const businessId = await getBusinessId(user.uid);
        if (!businessId) throw new Error('No business found');

        const saved = await createItem({
          id: tempId,
          businessId,
          name: form.name.trim(),
          sellingPrice: sp,
          purchasePrice: form.purchasePrice.trim() ? parseFloat(form.purchasePrice) : undefined,
          unit: form.unit.trim() || undefined,
          secondaryUnit: form.secondaryUnit.trim() || undefined,
          conversionRate: convRate ?? undefined,
          categoryId: form.categoryId || undefined,
          stockQuantity: form.stockQuantity.trim() ? parseFloat(form.stockQuantity) : undefined,
          asOfDate: form.asOfDate || undefined,
          atPrice: form.atPrice.trim() ? parseFloat(form.atPrice) : undefined,
          lowStockAlert: form.lowStockAlert.trim() ? parseFloat(form.lowStockAlert) : undefined,
          itemLocation: form.itemLocation.trim() || undefined,
          sku: form.sku.trim() || undefined,
          itemType: form.itemType,
        });

        itemEvents.emitSaved(tempId, saved);
      } catch (err: any) {
        itemEvents.emitFailed(tempId, err?.message || 'Failed to save item');
      }
    })();

    setSaving(false);
    return true;
  }, [form]);

  return {
    form,
    updateField,
    setItemType,
    setUnit,
    saving,
    errorMsg,
    isValid,
    save,
    resetForm,
    // Unit modal
    isUnitModalVisible,
    openUnitModal,
    closeUnitModal,
    handleSelectUnit,
    unitOptions: UNIT_OPTIONS,
  };
}
