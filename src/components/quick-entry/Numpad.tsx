import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NumpadProps {
  onPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onCalculate: () => void;
}

const Numpad = React.memo(function Numpad({
  onPress,
  onBackspace,
  onClear,
  onCalculate,
}: NumpadProps) {
  const Button = ({
    label,
    onPressItem,
    flex = 1,
    isAction = false,
    isEqual = false,
    icon = null,
  }: {
    label?: string;
    onPressItem: () => void;
    flex?: number;
    isAction?: boolean;
    isEqual?: boolean;
    icon?: React.ReactNode;
  }) => {
    return (
      <TouchableOpacity
        onPress={onPressItem}
        activeOpacity={0.5}
        delayPressIn={0}
        className={`m-0.5 rounded-xl items-center justify-center ${
          isEqual
            ? "bg-primary"
            : isAction
              ? "bg-background"
              : "bg-surface shadow-sm border border-border/40"
        }`}
        style={{
          flex,
          aspectRatio: flex > 1 ? undefined : 1.6,
          height: flex > 1 ? "auto" : undefined,
        }}
      >
        {icon ? (
          icon
        ) : (
          <Text
            className={`text-2xl font-medium ${
              isEqual ? "text-white" : isAction ? "text-text" : "text-text"
            }`}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="px-3 pb-12 pt-2 bg-surface">
      {/* Row 1 */}
      <View className="flex-row">
        <Button label="AC" onPressItem={onClear} isAction />
        <Button label="%" onPressItem={() => onPress("%")} isAction />
        <Button label="÷" onPressItem={() => onPress("/")} isAction />
        <Button
          icon={<Ionicons name="backspace-outline" size={26} color="#0F172A" />}
          onPressItem={onBackspace}
          isAction
        />
      </View>

      {/* Row 2 */}
      <View className="flex-row">
        <Button label="7" onPressItem={() => onPress("7")} />
        <Button label="8" onPressItem={() => onPress("8")} />
        <Button label="9" onPressItem={() => onPress("9")} />
        <Button label="×" onPressItem={() => onPress("*")} isAction />
      </View>

      {/* Row 3 */}
      <View className="flex-row">
        <Button label="4" onPressItem={() => onPress("4")} />
        <Button label="5" onPressItem={() => onPress("5")} />
        <Button label="6" onPressItem={() => onPress("6")} />
        <Button label="-" onPressItem={() => onPress("-")} isAction />
      </View>

      {/* Row 4 */}
      <View className="flex-row">
        <Button label="1" onPressItem={() => onPress("1")} />
        <Button label="2" onPressItem={() => onPress("2")} />
        <Button label="3" onPressItem={() => onPress("3")} />
        <Button label="+" onPressItem={() => onPress("+")} isAction />
      </View>

      {/* Row 5 */}
      <View className="flex-row">
        <Button label="0" onPressItem={() => onPress("0")} flex={2.05} />
        <Button label="." onPressItem={() => onPress(".")} />
        <Button label="=" onPressItem={onCalculate} isEqual />
      </View>
    </View>
  );
});

export default Numpad;
