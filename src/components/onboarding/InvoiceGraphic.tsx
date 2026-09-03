import React from "react";
import { View, Text } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export function InvoiceGraphic() {
  return (
    <View className="w-full items-center justify-center py-2 sm:py-4 relative px-2 sm:px-4">
      {/* Floating Header Card: Whatsapp Share & Success Banner */}
      <View className="w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] bg-surface rounded-2xl p-3 sm:p-4 shadow-lg shadow-black/5 border border-border/70 z-20 mb-3 sm:mb-6">
        <View className="flex-row items-center justify-between mb-2 px-1">
          <Text className="text-xs sm:text-sm font-bold text-text-secondary">
            Share in WhatsApp
          </Text>
          <View className="flex-row items-center bg-secondary-light px-2.5 py-0.5 sm:py-1 rounded-full">
            <View className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
            <Text className="text-[10px] sm:text-xs font-semibold text-secondary-dark">
              Instant
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center -space-x-2">
            <View className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 border-2 border-surface items-center justify-center">
              <Text className="text-xs sm:text-sm font-bold text-primary">AK</Text>
            </View>
            <View className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary/20 border-2 border-surface items-center justify-center">
              <Text className="text-xs sm:text-sm font-bold text-secondary">RS</Text>
            </View>
            <View className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-warning/20 border-2 border-surface items-center justify-center">
              <Text className="text-xs sm:text-sm font-bold text-warning">MG</Text>
            </View>
            <View className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-info/20 border-2 border-surface items-center justify-center">
              <Text className="text-xs sm:text-sm font-bold text-info">+5</Text>
            </View>
          </View>
          <View className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#25D366] items-center justify-center shadow-md shadow-[#25D366]/30">
            <FontAwesome5 name="whatsapp" size={20} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Stacked Invoices Visual */}
      <View className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] items-center justify-center relative h-52 sm:h-64 md:h-72">
        {/* Left Back Invoice Sheet */}
        <View 
          className="absolute w-[200px] sm:w-[250px] md:w-[280px] h-[170px] sm:h-[210px] md:h-[230px] bg-surface rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border shadow-sm top-3 sm:top-4 -left-2 sm:-left-4"
          style={{ transform: [{ rotate: "-8deg" }] }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <View className="w-12 sm:w-16 h-2 rounded bg-error/70" />
            <Text className="text-[8px] sm:text-[10px] font-bold text-text-secondary">INVOICE</Text>
          </View>
          <View className="w-full h-1 bg-error/30 rounded mb-3" />
          <View className="space-y-1.5 sm:space-y-2 mb-3">
            <View className="w-full h-1.5 sm:h-2 bg-border rounded" />
            <View className="w-3/4 h-1.5 sm:h-2 bg-border rounded" />
          </View>
          <View className="w-full h-px bg-border my-2" />
          <View className="space-y-1">
            <View className="w-full h-1 bg-border/60 rounded" />
            <View className="w-full h-1 bg-border/60 rounded" />
          </View>
        </View>

        {/* Right Back Invoice Sheet */}
        <View 
          className="absolute w-[200px] sm:w-[250px] md:w-[280px] h-[170px] sm:h-[210px] md:h-[230px] bg-surface rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border shadow-sm top-3 sm:top-4 -right-2 sm:-right-4"
          style={{ transform: [{ rotate: "8deg" }] }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <View className="w-12 sm:w-16 h-2 rounded bg-secondary/70" />
            <Text className="text-[8px] sm:text-[10px] font-bold text-text-secondary">INVOICE</Text>
          </View>
          <View className="w-full h-1 bg-secondary/30 rounded mb-3" />
          <View className="space-y-1.5 sm:space-y-2 mb-3">
            <View className="w-full h-1.5 sm:h-2 bg-border rounded" />
            <View className="w-2/3 h-1.5 sm:h-2 bg-border rounded" />
          </View>
          <View className="w-full h-px bg-border my-2" />
          <View className="space-y-1">
            <View className="w-full h-1 bg-border/60 rounded" />
            <View className="w-full h-1 bg-border/60 rounded" />
          </View>
        </View>

        {/* Main Center Invoice Sheet */}
        <View className="w-[220px] sm:w-[270px] md:w-[310px] h-[190px] sm:h-[230px] md:h-[260px] bg-surface rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border shadow-xl z-10 justify-between">
          <View>
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <View className="w-14 sm:w-20 h-2.5 sm:h-3 rounded bg-primary mb-1" />
                <Text className="text-[8px] sm:text-[10px] text-text-secondary font-medium">INV-2026-001</Text>
              </View>
              <Text className="text-[11px] sm:text-xs font-black tracking-wider text-text">INVOICE</Text>
            </View>

            {/* Top Banner accent */}
            <View className="w-full h-1.5 sm:h-2 bg-primary/20 rounded mb-3" />

            {/* Table headers simulation */}
            <View className="flex-row justify-between py-1 border-b border-border/80 mb-2">
              <Text className="text-[8px] sm:text-[10px] font-bold text-text-secondary">ITEM</Text>
              <Text className="text-[8px] sm:text-[10px] font-bold text-text-secondary">QTY</Text>
              <Text className="text-[8px] sm:text-[10px] font-bold text-text-secondary">AMOUNT</Text>
            </View>

            {/* Table rows */}
            <View className="space-y-2 mb-3">
              <View className="flex-row justify-between items-center">
                <View className="w-20 sm:w-28 h-1.5 sm:h-2 bg-text-secondary/20 rounded" />
                <View className="w-4 sm:w-6 h-1.5 sm:h-2 bg-text-secondary/20 rounded" />
                <View className="w-8 sm:w-12 h-1.5 sm:h-2 bg-text-secondary/30 rounded" />
              </View>
              <View className="flex-row justify-between items-center">
                <View className="w-16 sm:w-24 h-1.5 sm:h-2 bg-text-secondary/20 rounded" />
                <View className="w-4 sm:w-6 h-1.5 sm:h-2 bg-text-secondary/20 rounded" />
                <View className="w-8 sm:w-12 h-1.5 sm:h-2 bg-text-secondary/30 rounded" />
              </View>
            </View>
          </View>

          {/* Total & Signature */}
          <View className="flex-row justify-between items-end pt-2 border-t border-border">
            <View className="w-12 sm:w-16 h-1 sm:h-1.5 bg-border rounded" />
            <View className="items-end">
              <Ionicons name="create-outline" size={16} color="#475569" />
              <View className="w-14 sm:w-18 h-0.5 bg-text-secondary/40 mt-1" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
