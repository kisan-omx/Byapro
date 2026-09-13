import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ExploreCardProps {
  title: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  isNew?: boolean;
  route?: string;
}

const ExploreCard = ({ title, iconName, isNew, route }: ExploreCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-surface p-4 rounded-xl border border-border shadow-sm items-center w-[85px] mr-3"
      onPress={() => (route ? router.push(route as any) : undefined)}
    >
      <View className="relative w-full items-center mb-2">
        <MaterialIcons name={iconName} size={24} color="#0EA5E9" />
        {isNew && (
          <View className="absolute -top-2 -right-2 bg-error px-1.5 py-0.5 rounded-full">
            <Text className="text-[9px] font-bold text-white">New</Text>
          </View>
        )}
      </View>
      <Text className="text-xs font-semibold text-text text-center leading-tight">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default function ExploreApp() {
  return (
    <View className="mt-2 mb-4">
      <Text className="text-lg font-bold text-text px-4 mb-3">Explore App</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <ExploreCard
          title="Quick Entry"
          iconName="calculate"
          route="/quick-entry"
        />
        <ExploreCard title="Quick POS" iconName="point-of-sale" />
        <ExploreCard title="View Reports" iconName="insert-chart" />
        <ExploreCard title="Credit Reminder" iconName="message" isNew />
      </ScrollView>
    </View>
  );
}
