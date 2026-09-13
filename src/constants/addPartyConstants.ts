export const ADD_PARTY_CONSTANTS = {
  HEADER_TITLE: "Add New Party",
  IMPORT_BANNER: {
    TITLE: "Import Parties",
    SUBTITLE: "from your contact",
  },
  FORM_LABELS: {
    PARTY_NAME: "Party Name*",
    PARTY_NAME_PLACEHOLDER: "e.g. Ram Prasad",
    PHONE_NUMBER: "Phone Number",
    PHONE_NUMBER_PLACEHOLDER: "Phone Number",
    PARTY_TYPE: "Party Type",
    OPENING_BALANCE: "Opening Balance",
    AS_OF_DATE: "As of Date",
    PARTY_EMAIL: "Party Email",
    PARTY_EMAIL_PLACEHOLDER: "e.g. name@example.com",
    PARTY_ADDRESS: "Party Address",
    PARTY_ADDRESS_PLACEHOLDER: "Address / Location",
    ADDRESS: "Party Address",
    ADDITIONAL_NOTES: "Additional Notes / PAN",
  },
  PARTY_ROLES: [
    { id: "customer", label: "Customer" },
    { id: "supplier", label: "Supplier" },
    { id: "both", label: "Both" },
  ] as const,
  TABS: [
    { id: "credit_info", label: "Credit Info" },
    { id: "additional_details", label: "Additional Details" },
  ] as const,
  BALANCE_TYPES: [
    { id: "To Receive", label: "To Receive" },
    { id: "To Give", label: "To Give" },
  ] as const,
  BUTTONS: {
    SAVE_AND_NEW: "Save & New",
    SAVE_PARTY: "Save Party",
  },
  VALIDATION_ERRORS: {
    NAME_REQUIRED: "Party name is required",
  },
};
