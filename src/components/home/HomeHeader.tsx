import { View, Text, TouchableOpacity } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export default function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-background">
      {/* Left side */}
      <View className="flex-row items-center gap-x-3">
        <View className="w-10 h-10 rounded-full border border-primary items-center justify-center">
          <MaterialIcons name="storefront" size={22} color="#0EA5E9" />
        </View>
        <Text className="text-lg font-bold text-text">Kisan Khadka</Text>
      </View>

      {/* Right side */}
      <View className="flex-row items-center gap-x-5">
        <TouchableOpacity>
          <Feather name="bell" size={22} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="settings" size={22} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
