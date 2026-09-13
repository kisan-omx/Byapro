import React from "react";
import { View, Text } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export function DashboardGraphic() {
  const metrics = [
    {
      id: "1",
      label: "Sale",
      amount: "1,200 rs",
      change: "↑ 10.63%",
      icon: <Feather name="shopping-bag" size={13} color="#D97706" />,
      iconBg: "bg-amber-100",
      badgeBg: "bg-secondary-light",
      badgeText: "text-secondary-dark",
    },
    {
      id: "2",
      label: "You'll Get",
      amount: "1,200 rs",
      change: "↑ 10.63%",
      icon: <Feather name="arrow-down-left" size={13} color="#2563EB" />,
      iconBg: "bg-primary-light",
      badgeBg: "bg-secondary-light",
      badgeText: "text-secondary-dark",
    },
    {
      id: "3",
      label: "Stock Value",
      amount: "1,200 rs",
      change: "↑ 10.63%",
      icon: <Feather name="box" size={13} color="#D97706" />,
      iconBg: "bg-amber-100",
      badgeBg: "bg-secondary-light",
      badgeText: "text-secondary-dark",
    },
    {
      id: "4",
      label: "Expense",
      amount: "1,200 rs",
      change: "↓ 10.63%",
      icon: <Feather name="arrow-up-right" size={13} color="#DC2626" />,
      iconBg: "bg-error/10",
      badgeBg: "bg-error/10",
      badgeText: "text-error",
    },
  ];

  return (
    <View className="w-full items-center justify-center py-2 sm:py-4 px-2 sm:px-4">
      {/* Layered Reports & Profit Card Container */}
      <View className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[480px] relative h-48 sm:h-56 md:h-64 mb-3 sm:mb-4">
        {/* Right Back Card: Reports */}
        <View className="absolute right-0 top-0 w-[85%] sm:w-[88%] h-full bg-surface rounded-2xl p-3 sm:p-4 shadow-md border border-border/80 flex-col justify-between">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs sm:text-sm font-extrabold text-[#D97706]">
              Reports
            </Text>
            {/* Pie chart illustration */}
            <View className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-error/20 items-center justify-center border border-error/30">
              <View className="w-3 h-3 rounded-tr-full bg-error" />
            </View>
          </View>

          {/* Mini Table Preview */}
          <View className="w-full mt-1">
            <View className="flex-row justify-between bg-[#DC2626]/10 p-1 px-1.5 rounded mb-1">
              <Text className="text-[8px] sm:text-[9px] font-bold text-text-secondary">
                Party
              </Text>
              <Text className="text-[8px] sm:text-[9px] font-bold text-text-secondary">
                Total Amount
              </Text>
              <Text className="text-[8px] sm:text-[9px] font-bold text-text-secondary">
                Paid
              </Text>
              <Text className="text-[8px] sm:text-[9px] font-bold text-text-secondary">
                Balance
              </Text>
            </View>

            <View className="space-y-1">
              <View className="flex-row justify-between items-center py-0.5">
                <Text className="text-[8px] sm:text-[9px] font-semibold text-text">
                  Ramesh
                </Text>
                <Text className="text-[8px] sm:text-[9px] text-text-secondary">
                  ₹ 5,601
                </Text>
                <Text className="text-[8px] sm:text-[9px] text-text-secondary">
                  ₹ 300
                </Text>
                <Text className="text-[8px] sm:text-[9px] font-bold text-secondary">
                  ↑ ₹ 5,301
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-0.5 border-t border-border/40">
                <Text className="text-[8px] sm:text-[9px] font-semibold text-text">
                  Suresh
                </Text>
                <Text className="text-[8px] sm:text-[9px] text-text-secondary">
                  ₹ 11,206
                </Text>
                <Text className="text-[8px] sm:text-[9px] text-text-secondary">
                  ₹ 6,000
                </Text>
                <Text className="text-[8px] sm:text-[9px] font-bold text-secondary">
                  ↑ ₹ 5,206
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-0.5 border-t border-border/40">
                <Text className="text-[8px] sm:text-[9px] font-semibold text-text">
                  Mahesh
                </Text>
                <Text className="text-[8px] sm:text-[9px] text-text-secondary">
                  ₹ 25,212
                </Text>
                <Text className="text-[8px] sm:text-[9px] text-text-secondary">
                  ₹ 3,210
                </Text>
                <Text className="text-[8px] sm:text-[9px] font-bold text-secondary">
                  ↑ ₹ 22,002
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Orange Area Chart Graphic */}
          <View className="w-full h-5 sm:h-7 bg-amber-500/10 rounded-b-xl flex-row items-end overflow-hidden">
            <View className="w-full h-full bg-gradient-to-t from-amber-500/30 to-transparent border-t border-amber-500/40" />
          </View>
        </View>

        {/* Left Front Card: Profit */}
        <View className="absolute left-0 top-3 w-[55%] sm:w-[58%] bg-surface rounded-2xl p-3 sm:p-4 shadow-xl border border-border/90 z-10 flex-col justify-between">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs sm:text-sm font-black text-error">
              Profit
            </Text>
            <Feather name="trending-up" size={16} color="#DC2626" />
          </View>

          {/* Red Growing Bar Chart */}
          <View className="h-16 sm:h-20 w-full justify-end">
            <View className="flex-row items-end justify-between h-12 sm:h-16 px-1 mb-1">
              <View className="w-2.5 sm:w-3.5 h-3 sm:h-4 bg-error/40 rounded-t" />
              <View className="w-2.5 sm:w-3.5 h-5 sm:h-7 bg-error/60 rounded-t" />
              <View className="w-2.5 sm:w-3.5 h-7 sm:h-10 bg-error/80 rounded-t" />
              <View className="w-2.5 sm:w-3.5 h-9 sm:h-13 bg-error rounded-t" />
              <View className="w-2.5 sm:w-3.5 h-12 sm:h-16 bg-error rounded-t shadow-xs" />
            </View>
            <View className="w-full h-0.5 bg-error/50 rounded-full" />
          </View>
        </View>
      </View>

      {/* Grid of 4 Financial Metric Cards */}
      <View className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[480px] flex-row flex-wrap gap-2.5 justify-between">
        {metrics.map((m) => (
          <View
            key={m.id}
            className="w-[48%] bg-surface rounded-2xl p-2.5 sm:p-3 shadow-md shadow-black/5 border border-border/70 justify-between"
          >
            <View className="flex-row items-center justify-between mb-1">
              <View className={`p-1 sm:p-1.5 rounded-lg ${m.iconBg}`}>
                {m.icon}
              </View>
              <Text className="text-[10px] sm:text-xs font-bold text-text-secondary">
                {m.label}
              </Text>
            </View>
            <Text className="text-sm sm:text-base font-black text-text mb-1">
              {m.amount}
            </Text>
            <View
              className={`self-start px-2 py-0.5 rounded-full ${m.badgeBg}`}
            >
              <Text
                className={`text-[8px] sm:text-[9px] font-bold ${m.badgeText}`}
              >
                {m.change}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
