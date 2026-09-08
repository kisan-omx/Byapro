import React from 'react';
import { DateFilterType } from '../../types/transaction';
import { DATE_FILTER_OPTIONS } from '../../constants/transactionConstants';
import FilterBar from '../common/FilterBar';

export interface TransactionDateFilterProps {
  dateFilter: DateFilterType;
  onOpenDateFilter: () => void;
}

export default function TransactionDateFilter({
  dateFilter,
  onOpenDateFilter,
}: TransactionDateFilterProps) {
  const selectedDateLabel =
    DATE_FILTER_OPTIONS.find((opt) => opt.id === dateFilter)?.label || 'All Time';

  return (
    <FilterBar
      label={selectedDateLabel}
      iconName="calendar"
      actionText="CHANGE"
      onActionPress={onOpenDateFilter}
    />
  );
}
