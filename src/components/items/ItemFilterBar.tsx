import React from 'react';
import { StockFilterType, TypeFilterType } from '../../types/item';
import { STOCK_FILTER_OPTIONS } from '../../constants/items';
import FilterBar, { FilterChip } from '../common/FilterBar';

export interface ItemFilterBarProps {
  stockFilter: StockFilterType;
  typeFilter: TypeFilterType;
  onOpenCategoryModal: () => void;
  onOpenStockModal: () => void;
  onOpenTypeModal: () => void;
}

/**
 * Filter chip bar for the Items screen.
 * Three chips: Category → Stock → Type
 * Uses the shared FilterBar (chips mode).
 */
export const ItemFilterBar: React.FC<ItemFilterBarProps> = ({
  stockFilter,
  typeFilter,
  onOpenCategoryModal,
  onOpenStockModal,
  onOpenTypeModal,
}) => {
  const stockLabel =
    stockFilter !== 'all'
      ? (STOCK_FILTER_OPTIONS.find((o) => o.id === stockFilter)?.label ?? 'Stock')
      : 'Stock';
  const typeLabel = typeFilter !== 'all' ? typeFilter : 'Type';

  const chips: FilterChip[] = [
    {
      id: 'category',
      label: 'Category',
      isSelected: false, // no DB category column yet
      onPress: onOpenCategoryModal,
      iconRight: 'chevron-down',
    },
    {
      id: 'stock',
      label: stockLabel,
      isSelected: stockFilter !== 'all',
      onPress: onOpenStockModal,
      iconRight: 'chevron-down',
    },
    {
      id: 'type',
      label: typeLabel,
      isSelected: typeFilter !== 'all',
      onPress: onOpenTypeModal,
      iconRight: 'chevron-down',
    },
  ];

  return <FilterBar chips={chips} />;
};

export default ItemFilterBar;
