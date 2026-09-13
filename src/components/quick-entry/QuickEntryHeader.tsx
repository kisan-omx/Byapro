import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuickEntryHeader() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className="bg-surface">
      <View className="flex-row items-center justify-between px-4 py-3 bg-surface">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-xl font-medium text-text ml-3">
            Quick Entry
          </Text>
        </View>
        <View className="flex-row items-center space-x-1" />
      </View>
    </SafeAreaView>
  );
}
