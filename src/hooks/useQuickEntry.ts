import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { auth } from '../lib/firebase';
import {
  getBusinessId,
  generateInvoiceNumber,
  recordSale,
  recordPurchase,
  recordPaymentIn,
  recordPaymentOut,
  recordExpense,
  getOrCreateParty,
  getOrCreateExpenseCategory,
} from '../services/quickEntryService';
import { Party } from '../components/quick-entry/PartySelectionModal';
import { EntryType } from '../components/quick-entry/QuickEntryTabs';

import { transactionEvents } from '../services/transactionEvents';
import { TransactionItem, TransactionType } from '../types/transaction';

export interface SuccessInfo {
  title: string;
  message: string;
}

export type ValidationError =
  | { field: 'amount'; message: string }
  | { field: 'party'; message: string }
  | { field: 'category'; message: string }
  | null;

export function useQuickEntry() {
  const [saving, setSaving] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [validationError, setValidationError] = useState<ValidationError>(null);
  // Guard against double-tap
  const isSaving = useRef(false);

  /**
   * Evaluates the amount expression (e.g. "100+50") and returns the numeric value.
   * Returns null if invalid or <= 0.
   */
  const resolveAmount = useCallback((amountExpr: string): number | null => {
    try {
      let expr = amountExpr.trim();
      if (!expr) return null;
      // Strip trailing operators
      while (['+', '-', '*', '/', '%'].includes(expr.slice(-1))) {
        expr = expr.slice(0, -1);
      }
      if (!expr) return null;
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expr)();
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) return null;
      return result;
    } catch {
      return null;
    }
  }, []);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const handleRecord = useCallback(
    async (
      entryType: EntryType,
      amountExpr: string,
      selectedParty: Party | null,
      onRollback?: () => void,
    ) => {
      if (isSaving.current) return;

      if (entryType === 'Payment In') {
        if (!selectedParty) {
          setValidationError({ field: 'party', message: 'Customer is required' });
          return;
        }
      }
      if (entryType === 'Payment Out') {
        if (!selectedParty) {
          setValidationError({ field: 'party', message: 'Supplier is required' });
          return;
        }
      }
      if (entryType === 'Expense') {
        if (!selectedParty || selectedParty.type !== 'ExpenseCategory') {
          setValidationError({ field: 'category', message: 'Category is required' });
          return;
        }
      }

      // ── Resolve & validate amount ──────────────────────────────────────
      const amount = resolveAmount(amountExpr);
      if (!amount || amount <= 0) {
        setValidationError({ field: 'amount', message: 'Please enter an amount greater than 0.' });
        return;
      }

      // Clear any previous validation error
      setValidationError(null);

      const amountNum = parseFloat(amount.toFixed(2));

      // ── 1. Optimistic Success Display & Event Emission ──────────────────
      let optimisticInfo: SuccessInfo;
      switch (entryType) {
        case 'Sale': {
          const isCash = !selectedParty;
          optimisticInfo = {
            title: 'Sales Recorded',
            message: `Rs. ${amountNum.toLocaleString()} has been successfully added as ${
              isCash ? 'Cash Sales' : `Credit Sale (${selectedParty!.name})`
            }`,
          };
          break;
        }

        case 'Purchase': {
          const isCash = !selectedParty;
          optimisticInfo = {
            title: 'Purchase Recorded',
            message: `Rs. ${amountNum.toLocaleString()} has been successfully added as ${
              isCash ? 'Cash Purchase' : `Credit Purchase (${selectedParty!.name})`
            }`,
          };
          break;
        }

        case 'Payment In': {
          optimisticInfo = {
            title: 'Payment In Recorded',
            message: `Rs. ${amountNum.toLocaleString()} received from ${selectedParty!.name}`,
          };
          break;
        }

        case 'Payment Out': {
          optimisticInfo = {
            title: 'Payment Out Recorded',
            message: `Rs. ${amountNum.toLocaleString()} paid to ${selectedParty!.name}`,
          };
          break;
        }

        case 'Expense': {
          optimisticInfo = {
            title: 'Expense Recorded',
            message: `Rs. ${amountNum.toLocaleString()} recorded under ${selectedParty!.name}`,
          };
          break;
        }

        case 'Sale Return': {
          const isCash = !selectedParty;
          optimisticInfo = {
            title: 'Sale Return Recorded',
            message: `Rs. ${amountNum.toLocaleString()} recorded as ${
              isCash ? 'Cash Sale Return' : `Sale Return (${selectedParty!.name})`
            }`,
          };
          break;
        }

        case 'Purchase Return': {
          const isCash = !selectedParty;
          optimisticInfo = {
            title: 'Purchase Return Recorded',
            message: `Rs. ${amountNum.toLocaleString()} recorded as ${
              isCash ? 'Cash Purchase Return' : `Purchase Return (${selectedParty!.name})`
            }`,
          };
          break;
        }
      }

      // Instantly show recorded success component in Quick Entry
      setSuccessInfo(optimisticInfo);

      // Create optimistic TransactionItem for instant UI update on Transactions screen
      const tempId = `temp-${Date.now()}`;
      const nowIso = new Date().toISOString();

      let optimisticType: TransactionType = 'Sale';
      let partyName = 'Cash Sale';
      let secondaryLabel = 'Balance';
      let secondaryAmount = 0;

      if (entryType === 'Sale') {
        optimisticType = 'Sale';
        partyName = selectedParty ? selectedParty.name : 'Cash Sale';
        secondaryLabel = 'Balance';
        secondaryAmount = selectedParty ? amountNum : 0;
      } else if (entryType === 'Purchase') {
        optimisticType = 'Purchase';
        partyName = selectedParty ? selectedParty.name : 'Cash Purchase';
        secondaryLabel = 'Balance';
        secondaryAmount = selectedParty ? amountNum : 0;
      } else if (entryType === 'Payment In') {
        optimisticType = 'PaymentIn';
        partyName = selectedParty ? selectedParty.name : 'Cash';
        secondaryLabel = 'Unused';
        secondaryAmount = amountNum;
      } else if (entryType === 'Payment Out') {
        optimisticType = 'PaymentOut';
        partyName = selectedParty ? selectedParty.name : 'Cash';
        secondaryLabel = 'Unused';
        secondaryAmount = amountNum;
      } else if (entryType === 'Expense') {
        optimisticType = 'Expense';
        partyName = selectedParty ? selectedParty.name : 'General Expense';
        secondaryLabel = 'Unused';
        secondaryAmount = amountNum;
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const nowDate = new Date();
      const formattedDateStr = `${months[nowDate.getMonth()]} ${nowDate.getDate()}, ${nowDate.getFullYear().toString().slice(-2)}`;

      const optimisticItem: TransactionItem = {
        id: tempId,
        type: optimisticType,
        indexNo: '#1',
        partyName,
        totalAmount: amountNum,
        secondaryAmount,
        secondaryLabel,
        status: 'Paid',
        date: formattedDateStr,
        rawDate: nowIso,
        syncStatus: 'saving',
        payload: {
          entryType,
          amountNum,
          selectedParty,
        },
      };

      // Emit optimistic created event (starts in 'saving' state)
      transactionEvents.emitCreated(optimisticItem);

      // ── 2. Save in background to Supabase database ─────────────────────
      isSaving.current = true;
      setSaving(true);

      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error('Please log in to record transactions.');
          }
          const businessId = await getBusinessId(user.uid);
          if (!businessId) {
            throw new Error('Could not find your business. Please complete setup.');
          }

          switch (entryType) {
            case 'Sale': {
              const isCash = !selectedParty;
              const paymentType = isCash ? 'cash' : 'credit';
              const partyId = selectedParty
                ? await getOrCreateParty(businessId, selectedParty)
                : null;
              await recordSale({
                businessId,
                partyId,
                invoiceNumber: generateInvoiceNumber(),
                totalAmount: amountNum,
                receivedAmount: isCash ? amountNum : 0,
                paymentType,
              });
              break;
            }

            case 'Purchase': {
              const isCash = !selectedParty;
              const paymentType = isCash ? 'cash' : 'credit';
              const partyId = selectedParty
                ? await getOrCreateParty(businessId, selectedParty)
                : null;
              await recordPurchase({
                businessId,
                partyId,
                totalAmount: amountNum,
                paidAmount: isCash ? amountNum : 0,
                paymentType,
              });
              break;
            }

            case 'Payment In': {
              const partyId = await getOrCreateParty(businessId, selectedParty!);
              await recordPaymentIn({
                businessId,
                partyId,
                amount: amountNum,
                paymentMethod: 'cash',
              });
              break;
            }

            case 'Payment Out': {
              const partyId = await getOrCreateParty(businessId, selectedParty!);
              await recordPaymentOut({
                businessId,
                partyId,
                amount: amountNum,
                paymentMethod: 'cash',
              });
              break;
            }

            case 'Expense': {
              const categoryId = await getOrCreateExpenseCategory(businessId, selectedParty!.name);
              await recordExpense({
                businessId,
                categoryId,
                amount: amountNum,
                paymentMethod: 'cash',
              });
              break;
            }

            case 'Sale Return': {
              const isCash = !selectedParty;
              const paymentType = isCash ? 'cash' : 'credit';
              const partyId = selectedParty
                ? await getOrCreateParty(businessId, selectedParty)
                : null;
              await recordSale({
                businessId,
                partyId,
                invoiceNumber: generateInvoiceNumber(),
                totalAmount: amountNum,
                receivedAmount: isCash ? amountNum : 0,
                paymentType,
                note: '[Sale Return]',
              });
              break;
            }

            case 'Purchase Return': {
              const isCash = !selectedParty;
              const paymentType = isCash ? 'cash' : 'credit';
              const partyId = selectedParty
                ? await getOrCreateParty(businessId, selectedParty)
                : null;
              await recordPurchase({
                businessId,
                partyId,
                totalAmount: amountNum,
                paidAmount: isCash ? amountNum : 0,
                paymentType,
                note: '[Purchase Return]',
              });
              break;
            }
          }

          // Emit saved event -> transitions card from 'saving' to 'saved'
          transactionEvents.emitSaved(tempId);
        } catch (err: any) {
          console.error('Quick entry background save error:', err);
          // Transition card to 'failed' state with retry option
          transactionEvents.emitFailed(tempId, err?.message);
          setSuccessInfo(null);
          if (onRollback) {
            onRollback();
          }
          Alert.alert(
            'Save Failed',
            err?.message || 'Something went wrong while saving. Tap card to retry.',
          );
        } finally {
          setSaving(false);
          isSaving.current = false;
        }
      })();
    },
    [resolveAmount],
  );

  const dismissSuccess = useCallback(() => {
    setSuccessInfo(null);
  }, []);

  return { saving, successInfo, validationError, handleRecord, dismissSuccess, clearValidationError };
}
