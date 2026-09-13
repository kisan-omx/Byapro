import { useState, useCallback, useRef, useMemo } from "react";
import { Alert } from "react-native";
import { auth } from "../lib/firebase";
import { getBusinessId } from "../services/quickEntryService";
import {
  createNewParty,
  checkPartyExistsByName,
} from "../services/partyService";
import { Party, PartyType } from "../types/party";
import { ADD_PARTY_CONSTANTS } from "../constants/addPartyConstants";
import { generateUUID } from "../utils/uuid";
import { partyEvents } from "../services/partyEvents";

export function useAddParty() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partyType, setPartyTypeState] = useState<PartyType>("customer");
  const [activeTab, setActiveTab] = useState<
    "credit_info" | "additional_details"
  >("credit_info");
  const [openingBalance, setOpeningBalance] = useState("");
  const [balanceType, setBalanceType] = useState<"To Receive" | "To Give">(
    "To Receive",
  );

  // Real current date string formatted as e.g. "8-Sep-2026"
  const defaultAsOfDate = useMemo(() => {
    const today = new Date();
    const day = today.getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthStr = months[today.getMonth()];
    const year = today.getFullYear();
    return `${day}-${monthStr}-${year}`;
  }, []);

  const [asOfDate, setAsOfDate] = useState(defaultAsOfDate);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isContactsModalVisible, setIsContactsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const isSubmittingRef = useRef(false);

  // Dynamic balance type defaulting whenever party role changes:
  // - Supplier -> To Give
  // - Customer / Both -> To Receive
  const setPartyType = useCallback((newType: PartyType) => {
    setPartyTypeState(newType);
    if (newType === "supplier") {
      setBalanceType("To Give");
    } else {
      setBalanceType("To Receive");
    }
  }, []);

  const validate = useCallback(() => {
    if (!name.trim()) {
      setErrorMsg(ADD_PARTY_CONSTANTS.VALIDATION_ERRORS.NAME_REQUIRED);
      return false;
    }
    setErrorMsg(null);
    return true;
  }, [name]);

  const resetForm = useCallback(() => {
    setName("");
    setPhone("");
    setPartyTypeState("customer");
    setActiveTab("credit_info");
    setOpeningBalance("");
    setAsOfDate(defaultAsOfDate);
    setBalanceType("To Receive");
    setEmail("");
    setAddress("");
    setNote("");
    setErrorMsg(null);
  }, [defaultAsOfDate]);

  const saveParty = useCallback(
    async (
      onSuccess?: (createdParty: Party) => void,
    ): Promise<Party | null> => {
      if (!validate()) return null;
      if (isSubmittingRef.current) return null;

      isSubmittingRef.current = true;
      setSaving(true);
      setErrorMsg(null);

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const businessId = await getBusinessId(user.uid);
        if (!businessId) throw new Error("No business found");

        // Check duplicate party name (case-insensitive)
        const exists = await checkPartyExistsByName(businessId, name.trim());
        if (exists) {
          const errorText = "Party name already exists";
          setErrorMsg(errorText);
          setSaving(false);
          isSubmittingRef.current = false;
          return null;
        }

        const tempId = generateUUID();
        const parsedBalance =
          parseFloat(openingBalance.replace(/[^0-9.]/g, "")) || 0;
        const calcBalanceType: "To Receive" | "To Give" | "Settled" =
          parsedBalance > 0 ? balanceType : "Settled";
        const cleanPhone = phone.trim() || undefined;
        const cleanEmail = email.trim() || undefined;
        const cleanAddress = address.trim() || undefined;

        const optimisticParty: Party = {
          id: tempId,
          name: name.trim(),
          phone: cleanPhone || null,
          email: cleanEmail || null,
          address: cleanAddress || null,
          subtitle: cleanPhone || asOfDate,
          type: "Party",
          balance: Math.abs(parsedBalance),
          balanceType: calcBalanceType,
          createdAt: new Date().toISOString(),
          syncStatus: "saving",
        };

        // ── Step 1: Instantly emit optimistic event for UI ──────────────────
        partyEvents.emitCreated(optimisticParty);

        if (onSuccess) {
          onSuccess(optimisticParty);
        }

        // Reset loading state for form so UI responds immediately
        setSaving(false);
        isSubmittingRef.current = false;

        // ── Step 2: Trigger background Supabase save asynchronously ────────
        (async () => {
          try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");
            const businessId = await getBusinessId(user.uid);
            if (!businessId) throw new Error("No business found");

            const rawPayload = {
              businessId,
              name: name.trim(),
              phone: cleanPhone,
              email: cleanEmail,
              address: cleanAddress,
              type: partyType,
              openingBalance: parsedBalance,
              balanceType: calcBalanceType,
            };

            const realParty = await createNewParty({
              id: tempId,
              ...rawPayload,
            });

            realParty.rawPayload = rawPayload;
            partyEvents.emitSaved(tempId, realParty);
          } catch (err: any) {
            console.error("Background party save error:", err);
            partyEvents.emitFailed(
              tempId,
              err?.message || "Failed to save party",
            );
          }
        })();

        return optimisticParty;
      } catch (err: any) {
        console.error("Error in saveParty:", err);
        const msg = err?.message || "Failed to save party";
        setErrorMsg(msg);
        return null;
      } finally {
        setSaving(false);
        isSubmittingRef.current = false;
      }
    },
    [
      name,
      phone,
      email,
      address,
      partyType,
      openingBalance,
      balanceType,
      asOfDate,
      validate,
    ],
  );

  const saveAndNew = useCallback(
    async (onSuccess?: (createdParty: Party) => void): Promise<boolean> => {
      const created = await saveParty(onSuccess);
      if (created) {
        resetForm();
        return true;
      }
      return false;
    },
    [saveParty, resetForm],
  );

  const selectContact = useCallback(
    (contactName: string, contactPhone?: string) => {
      setName(contactName);
      if (contactPhone) {
        setPhone(contactPhone);
      }
      setErrorMsg(null);
    },
    [],
  );

  return {
    name,
    setName: (val: string) => {
      setName(val);
      if (errorMsg) setErrorMsg(null);
    },
    phone,
    setPhone,
    partyType,
    setPartyType,
    activeTab,
    setActiveTab,
    openingBalance,
    setOpeningBalance,
    asOfDate,
    setAsOfDate,
    balanceType,
    setBalanceType,
    email,
    setEmail,
    address,
    setAddress,
    note,
    setNote,
    saving,
    errorMsg,
    setErrorMsg,
    saveParty,
    saveAndNew,
    resetForm,
    selectContact,
    isContactsModalVisible,
    openContactsModal: () => setIsContactsModalVisible(true),
    closeContactsModal: () => setIsContactsModalVisible(false),
    isDatePickerVisible,
    openDatePickerModal: () => setIsDatePickerVisible(true),
    closeDatePickerModal: () => setIsDatePickerVisible(false),
  };
}
