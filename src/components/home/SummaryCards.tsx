import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SummaryCardProps {
  title: string;
  subtitle: string;
  type: "receive" | "give" | "default";
  icon?: string;
}

const SummaryCard = ({ title, subtitle, type }: SummaryCardProps) => {
  const isReceive = type === "receive";
  const isGive = type === "give";

  let containerClass = "bg-surface shadow-sm border border-border/50";
  let titleColor = "text-text";
  let subtitleColor = "text-text-secondary";
  let arrowColor = "#475569"; // text-secondary

  if (isReceive) {
    containerClass = "bg-primary-light border border-primary/60 shadow-sm";
    titleColor = "text-primary"; // Primary (blue) amount
    subtitleColor = "text-text-secondary"; // Gray subtitle
  } else if (isGive) {
    containerClass = "bg-error-light border border-error/60 shadow-sm";
    titleColor = "text-error";
    subtitleColor = "text-error";
  }

  return (
    <TouchableOpacity
      className={`w-[48%] p-4 rounded-xl mb-3 flex-row justify-between items-center ${containerClass}`}
    >
      <View>
        <Text className={`text-base font-bold mb-1 ${titleColor}`}>
          {title}
        </Text>
        <Text className={`text-xs font-medium ${subtitleColor}`}>
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={arrowColor} />
    </TouchableOpacity>
  );
};

export default function SummaryCards() {
  return (
    <View className="px-4 flex-row flex-wrap justify-between">
      <SummaryCard title="Rs. 11,586" subtitle="To Receive ↓" type="receive" />
      <SummaryCard title="Rs. 11,256" subtitle="To Give ↑" type="give" />
      <SummaryCard title="Rs. 7,287" subtitle="Sales (Bhadau)" type="default" />
      <SummaryCard title="Rs. 0" subtitle="Purchase (Bhadau)" type="default" />
      <SummaryCard title="Rs. 69" subtitle="Expense (Bhadau)" type="default" />
      <SummaryCard
        title="Total Balance"
        subtitle="Cash & Bank"
        type="default"
      />
    </View>
  );
}
