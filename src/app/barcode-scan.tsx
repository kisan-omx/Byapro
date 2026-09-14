import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useItems } from "../hooks/useItems";
import { billingItemEvents } from "../services/billingItemEvents";

import BarcodeScanHeader from "../components/items/BarcodeScanHeader";
import BarcodeScanItemRow, {
  ScannedItem,
} from "../components/items/BarcodeScanItemRow";

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BarcodeScanScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  const [itemCode, setItemCode] = useState("");

  // The accumulated cart: items with quantities
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

  // Load all items once (served from cache — no loading spinner)
  const { items: allItems } = useItems();

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSearch = useCallback(() => {
    const trimmed = itemCode.trim();
    if (!trimmed) return;

    // Filter locally by SKU — instant, no network call
    const query = trimmed.toLowerCase();
    const matched = allItems.filter(
      (item) => item.sku && item.sku.toLowerCase() === query
    );

    setItemCode(""); // clear input immediately

    if (matched.length === 0) {
      Alert.alert("Item not found", "Please add item.");
      return;
    }

    // Merge into cart (keep existing qty if already there)
    setScannedItems((prev) => {
      const existingIds = new Set(prev.map((s) => s.item.id));
      const newItems = matched
        .filter((r) => !existingIds.has(r.id))
        .map((item) => ({ item, quantity: 1 }));
      return newItems.length > 0 ? [...prev, ...newItems] : prev;
    });
  }, [itemCode, allItems]);

  const handleQuantityChange = useCallback((index: number, qty: number) => {
    setScannedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: qty };
      return updated;
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setScannedItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleProceed = useCallback(() => {
    if (scannedItems.length === 0) {
      Alert.alert("No items", "Add at least one item before proceeding.");
      return;
    }
    scannedItems.forEach(({ item, quantity }) => {
      billingItemEvents.emitAdded({
        item,
        quantity,
        rate: item.sellingPrice,
        discountAmount: 0,
        totalAmount: item.sellingPrice * quantity,
      });
    });
    router.back();
  }, [scannedItems, router]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-background">
      <View
        style={{
          flex: 1,
          maxWidth: isWide ? 768 : undefined,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <BarcodeScanHeader
          code={itemCode}
          onCodeChange={setItemCode}
          onSearch={handleSearch}
          onBack={handleBack}
        />

        {/* ── Column headings ────────────────────────────────────── */}
        <View
          className="flex-row items-center justify-between px-4 py-2.5 bg-slate-50/80"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "rgba(148,163,184,0.2)",
          }}
        >
          <Text className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
            Name
          </Text>
          <Text className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
            Quantity
          </Text>
        </View>


        {/* ── Scanned items list (stepper rows) ─────────────────── */}
        {scannedItems.length > 0 && (
          <FlatList
            data={scannedItems}
            keyExtractor={(s) => s.item.id}
            renderItem={({ item: scannedItem, index }) => (
              <BarcodeScanItemRow
                scannedItem={scannedItem}
                onQuantityChange={(qty) => handleQuantityChange(index, qty)}
                onRemove={() => handleRemove(index)}
              />
            )}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      {/* ── Footer: Cancel | Proceed ─────────────────────────────── */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-surface"
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(148,163,184,0.2)",
        }}
      >
        <View className="flex-row">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.8}
            className="flex-1 items-center justify-center py-4"
          >
            <Text className="text-[15px] font-semibold text-slate-500">
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleProceed}
            activeOpacity={0.85}
            className="flex-1 items-center justify-center py-4 bg-primary"
          >
            <Text className="text-[15px] font-bold text-white">
              {scannedItems.length > 0
                ? `Proceed (${scannedItems.length})`
                : "Proceed"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
