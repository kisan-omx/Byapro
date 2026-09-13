import React from "react";
import Header from "../common/Header";

export interface ItemHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings?: () => void;
  onOpenFilter?: () => void;
}

/**
 * Items/Inventory header — wraps the shared Header component.
 * Title: "Inventory", search placeholder: "Search Items..."
 */
export const ItemHeader: React.FC<ItemHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onOpenFilter,
}) => {
  return (
    <Header
      title="Items"
      searchPlaceholder="Search Items..."
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onOpenSettings={onOpenSettings}
      onOpenFilter={onOpenFilter}
      settingsIconColor="#475569"
    />
  );
};

export default ItemHeader;
