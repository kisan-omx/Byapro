import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export function BackgroundPattern() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" className="overflow-hidden">
      {/* Grid Pattern Overlay - Ultra Subtle */}
      <View className="absolute inset-0 flex-row flex-wrap justify-between opacity-[0.03]">
        {Array.from({ length: 60 }).map((_, i) => (
          <View
            key={i}
            className="w-1/4 h-28 border-r border-b border-text-secondary/50"
          />
        ))}
      </View>

      {/* Scattered Business Watermark Icons - Positioned Away From Title & Buttons */}
      <View className="absolute top-0 left-0 right-0 h-[60%] opacity-[0.04] flex-col justify-around px-6 pt-16">
        <View className="flex-row justify-between items-center px-4">
          <Ionicons name="stats-chart-outline" size={28} color="#2563EB" />
          <Feather name="pie-chart" size={24} color="#16A34A" />
          <MaterialCommunityIcons name="receipt-outline" size={30} color="#2563EB" />
        </View>

        <View className="flex-row justify-around items-center">
          <Feather name="trending-up" size={30} color="#16A34A" />
          <Ionicons name="calculator-outline" size={26} color="#F59E0B" />
          <Feather name="shopping-bag" size={26} color="#DC2626" />
        </View>

        <View className="flex-row justify-between items-center px-6">
          <MaterialCommunityIcons name="file-document-outline" size={28} color="#2563EB" />
          <Ionicons name="barcode-outline" size={32} color="#475569" />
          <Feather name="dollar-sign" size={28} color="#16A34A" />
        </View>
      </View>
    </View>
  );
}
