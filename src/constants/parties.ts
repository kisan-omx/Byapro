import {
  PartyCategoryFilter,
  PartyPaymentFilter,
  BalanceType,
} from "../types/party";

export const PAGE_SIZE = 20;

export interface CategoryFilterOption {
  id: PartyCategoryFilter;
  label: string;
}

export const CATEGORY_FILTER_OPTIONS: CategoryFilterOption[] = [
  { id: "customer", label: "Customer" },
  { id: "supplier", label: "Supplier" },
  { id: "both", label: "Both" },
];

export interface PaymentFilterOption {
  id: PartyPaymentFilter;
  label: string;
}

export const PAYMENT_FILTER_OPTIONS: PaymentFilterOption[] = [
  { id: "all", label: "All Payment" },
  { id: "to_receive", label: "To Receive" },
  { id: "to_give", label: "To Give" },
  { id: "settled", label: "Settled" },
];

export interface BalanceStyleConfig {
  label: BalanceType;
  textClass: string;
  amountClass: string;
}

export const BALANCE_STATUS_CONFIG: Record<BalanceType, BalanceStyleConfig> = {
  "To Give": {
    label: "To Give",
    textClass: "text-error font-semibold",
    amountClass: "text-error font-semibold",
  },
  "To Receive": {
    label: "To Receive",
    textClass: "text-success font-semibold",
    amountClass: "text-success font-semibold",
  },
  Settled: {
    label: "Settled",
    textClass: "text-text-secondary font-semibold",
    amountClass: "text-text-secondary font-semibold",
  },
};
