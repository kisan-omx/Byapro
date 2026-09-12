import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useAddItem } from '../hooks/useAddItem';
import { useItemCategory } from '../hooks/useItemCategory';
import {
  AddItemPageHeader,
  AddItemTypeToggle,
  AddItemNameField,
  AddItemUnitModal,
  AddItemPageFooter,
  AddItemCodeCategory,
  AddItemTabs,
  AddItemPricingTab,
  AddItemStockTab,
  ItemCategoryModal,
  CreateItemCategoryModal,
} from '../components/items';
import type { AddItemTab } from '../components/items';
import DatePickerModal from '../components/common/DatePickerModal';

export default function AddItemScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AddItemTab>('pricing');
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  // Form state
  const {
    form,
    updateField,
    setItemType,
    saving,
    errorMsg,
    isValid,
    save,
    resetForm,
    isUnitModalVisible,
    openUnitModal,
    closeUnitModal,
    handleSelectUnit,
    unitOptions,
  } = useAddItem();

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const {
    isVisible: isCategoryModalVisible,
    openModal: openCategoryModal,
    closeModal: closeCategoryModal,
    isCreateVisible,
    openCreateModal,
    closeCreateModal,
    categories,
    searchQuery: categorySearch,
    setSearchQuery: setCategorySearch,
    loading: categoriesLoading,
    adding: categoryAdding,
    addCategory,
  } = useItemCategory();

  const handleSave = useCallback(async () => {
    const success = await save();
    if (success) {
      resetForm();
      router.back();
    }
  }, [save, resetForm, router]);

  const handleCancel = useCallback(() => {
    resetForm();
    router.back();
  }, [resetForm, router]);

  const isNameEntered = form.name.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View style={{ flex: 1, maxWidth: 768, width: '100%', alignSelf: 'center' }}>
      {/* ── Header: Back arrow · Title · Camera icon ── */}
      <AddItemPageHeader
        onBack={handleCancel}
        onCamera={() => {
          // Future: image picker
        }}
      />

      {/* ── Product / Services Toggle ─────────────── */}
      <AddItemTypeToggle value={form.itemType} onChange={setItemType} />

      {/* ── Keyboard Avoiding View ────────────────── */}
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
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            >
              {/* ── Error banner ───────────────────── */}
              {errorMsg ? (
                <View className="mx-4 mt-4 flex-row items-center bg-error-light border border-red-200 rounded-xl px-4 py-3">
                  <Feather name="alert-circle" size={16} color="#DC2626" />
                  <Text className="text-sm font-semibold text-error ml-2 flex-1">{errorMsg}</Text>
                </View>
              ) : null}

              {/* ── Item Name + Select Unit ─────────── */}
              <AddItemNameField
                value={form.name}
                onChangeText={updateField('name')}
                unit={form.unit}
                onSelectUnit={openUnitModal}
                autoFocus
              />

              {/* ── Progressive Disclosure ──────────── */}
              {isNameEntered && (
                <>
                  <AddItemCodeCategory
                    sku={form.sku}
                    onChangeSku={updateField('sku')}
                    onAssignCode={() => {
                      const code = Array.from({ length: 11 }, () =>
                        Math.floor(Math.random() * 10)
                      ).join('');
                      updateField('sku')(code);
                    }}
                    category={form.categoryName}
                    onSelectCategory={openCategoryModal}
                  />

                  {form.itemType === 'product' && (
                    <AddItemTabs activeTab={activeTab} onChangeTab={setActiveTab} />
                  )}

                  {(activeTab === 'pricing' || form.itemType === 'service') ? (
                    <AddItemPricingTab
                      sellingPrice={form.sellingPrice}
                      onSellingPriceChange={updateField('sellingPrice')}
                      purchasePrice={form.purchasePrice}
                      onPurchasePriceChange={updateField('purchasePrice')}
                      isService={form.itemType === 'service'}
                    />
                  ) : (
                    form.itemType === 'product' && (
                      <AddItemStockTab
                        stockQuantity={form.stockQuantity}
                        onStockQuantityChange={updateField('stockQuantity')}
                        asOfDate={form.asOfDate}
                        onAsOfDateChange={updateField('asOfDate')}
                        onAsOfDatePress={() => setIsDatePickerVisible(true)}
                        atPrice={form.atPrice}
                        onAtPriceChange={updateField('atPrice')}
                        lowStockAlert={form.lowStockAlert}
                        onLowStockAlertChange={updateField('lowStockAlert')}
                        itemLocation={form.itemLocation}
                        onItemLocationChange={updateField('itemLocation')}
                      />
                    )
                  )}
                </>
              )}
            </ScrollView>

            {/* ── Fixed Bottom Footer ───────────────── */}
            <AddItemPageFooter
              onCancel={handleCancel}
              onSave={handleSave}
              loading={saving}
              disabled={!isValid}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ── Unit Picker Modal ─────────────────────── */}
      <AddItemUnitModal
        visible={isUnitModalVisible}
        selectedUnit={form.unit}
        units={unitOptions}
        onSelect={handleSelectUnit}
        onClose={closeUnitModal}
      />

      {/* ── Item Category Modal ───────────────────── */}
      <ItemCategoryModal
        visible={isCategoryModalVisible}
        onClose={closeCategoryModal}
        categories={categories}
        selectedCategory={form.categoryId}
        onSelectCategory={(cat) => {
          updateField('categoryId')(cat.id);
          updateField('categoryName')(cat.name);
          closeCategoryModal();
        }}
        searchQuery={categorySearch}
        onSearchChange={setCategorySearch}
        loading={categoriesLoading}
        onOpenCreate={openCreateModal}
      />

      {/* ── Create Item Category Modal ────────────── */}
      <CreateItemCategoryModal
        visible={isCreateVisible}
        onClose={closeCreateModal}
        loading={categoryAdding}
        onSave={async (name) => {
          const created = await addCategory(name);
          if (created) {
            updateField('categoryId')(created.id);
            updateField('categoryName')(created.name);
            closeCreateModal();
            closeCategoryModal();
          }
        }}
      />

      {/* ── Date Picker Modal ─────────────────────── */}
      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        onSelectDate={updateField('asOfDate')}
      />
      </View>
    </SafeAreaView>
  );
}
