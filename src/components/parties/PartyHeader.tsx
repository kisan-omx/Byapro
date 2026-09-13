import React from "react";
import Header from "../common/Header";

export interface PartyHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings?: () => void;
  onOpenFilter?: () => void;
}

export const PartyHeader: React.FC<PartyHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onOpenFilter,
}) => {
  return (
    <Header
      title="Parties"
      searchPlaceholder="Search parties..."
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onOpenSettings={onOpenSettings}
      onOpenFilter={onOpenFilter}
      settingsIconColor="#475569"
    />
  );
};

export default PartyHeader;
