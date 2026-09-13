import React from "react";
import { View, Text } from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";

export function ItemsGraphic() {
  const items = [
    {
      id: "1",
      title: "2 Sets Of Book",
      subtitle: "2 Nos",
      icon: (
        <MaterialCommunityIcons
          name="book-multiple"
          size={26}
          color="#2563EB"
        />
      ),
      bgColor: "bg-primary-light/60",
      action: "add",
    },
    {
      id: "2",
      title: "Red T-Shirt",
      subtitle: "10 Packs",
      icon: <FontAwesome5 name="tshirt" size={22} color="#DC2626" />,
      bgColor: "bg-error/10",
      action: "check",
    },
    {
      id: "3",
      title: "Brown Bread",
      subtitle: "450gms, 20 packs",
      icon: (
        <MaterialCommunityIcons name="bread-slice" size={24} color="#D97706" />
      ),
      bgColor: "bg-amber-100",
      action: "add",
    },
  ];

  return (
    <View className="w-full items-center justify-center py-2 sm:py-4 px-2 sm:px-4">
      {/* Item Cards List */}
      <View className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[500px]">
        {items.map((item, index) => (
          <View
            key={item.id}
            className={`w-full bg-surface rounded-2xl p-3.5 sm:p-4 flex-row items-center justify-between shadow-md shadow-black/5 border border-border/70 ${
              index < items.length - 1 ? "mb-3.5 sm:mb-4 md:mb-5" : ""
            }`}
          >
            <View className="flex-row items-center flex-1 pr-3">
              {/* Product Icon Container */}
              <View
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bgColor} items-center justify-center mr-3.5 border border-border/30 shadow-sm`}
              >
                {item.icon}
              </View>

              {/* Product Details */}
              <View className="flex-1">
                <Text className="text-sm sm:text-base font-extrabold text-text mb-0.5">
                  {item.title}
                </Text>
                <Text className="text-xs text-text-secondary font-medium">
                  {item.subtitle}
                </Text>
              </View>
            </View>

            {/* Action Button: Add vs Green Checkmark */}
            {item.action === "check" ? (
              <View className="bg-primary-light/70 border border-primary/20 w-16 sm:w-20 py-2 sm:py-2.5 rounded-xl items-center justify-center">
                <Ionicons name="checkmark-sharp" size={20} color="#00C853" />
              </View>
            ) : (
              <View className="bg-primary-light/70 border border-primary/20 w-16 sm:w-20 py-2 sm:py-2.5 rounded-xl items-center justify-center">
                <Text className="text-xs sm:text-sm font-bold text-primary">
                  Add
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
