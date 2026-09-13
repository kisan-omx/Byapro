import React from "react";
import { PartyCategoryFilter, PartyPaymentFilter } from "../../types/party";
import { PAYMENT_FILTER_OPTIONS } from "../../constants/parties";
import FilterBar, { FilterChip } from "../common/FilterBar";

export interface PartyFilterTabsProps {
  categoryFilter: PartyCategoryFilter;
  onSelectCategory: (category: PartyCategoryFilter) => void;
  paymentFilter: PartyPaymentFilter;
  onSelectPaymentFilter: (filter: PartyPaymentFilter) => void;
  onOpenPaymentModal: () => void;
}

export const PartyFilterTabs: React.FC<PartyFilterTabsProps> = ({
  categoryFilter,
  onSelectCategory,
  paymentFilter,
  onSelectPaymentFilter,
  onOpenPaymentModal,
}) => {
  const currentPaymentLabel =
    PAYMENT_FILTER_OPTIONS.find((o) => o.id === paymentFilter)?.label ||
    "All Payment";

  // Helper when selecting a category chip: resets payment filter to 'all'
  const handleCategoryPress = (targetCategory: PartyCategoryFilter) => {
    onSelectPaymentFilter("all");
    onSelectCategory(
      categoryFilter === targetCategory ? "all" : targetCategory,
    );
  };

  const chips: FilterChip[] = [
    {
      id: "customer",
      label: "Customer",
      isSelected: categoryFilter === "customer" && paymentFilter === "all",
      onPress: () => handleCategoryPress("customer"),
    },
    {
      id: "supplier",
      label: "Supplier",
      isSelected: categoryFilter === "supplier" && paymentFilter === "all",
      onPress: () => handleCategoryPress("supplier"),
    },
    {
      id: "both",
      label: "Both",
      isSelected: categoryFilter === "both" && paymentFilter === "all",
      onPress: () => handleCategoryPress("both"),
    },
    {
      id: "payment_status",
      label: currentPaymentLabel,
      isSelected: paymentFilter !== "all",
      onPress: onOpenPaymentModal,
      iconRight: "chevron-down",
    },
  ];

  return <FilterBar chips={chips} />;
};

export default PartyFilterTabs;
