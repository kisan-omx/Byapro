import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { PartyType } from "../../types/party";
import PrimaryButton from "../common/PrimaryButton";
import { auth } from "../../lib/firebase";
import { getBusinessId } from "../../services/quickEntryService";
import { checkPartyExistsByName } from "../../services/partyService";

export interface AddPartyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddParty: (params: {
    name: string;
    phone?: string;
    type?: PartyType;
  }) => Promise<void>;
}

export const AddPartyModal: React.FC<AddPartyModalProps> = ({
  visible,
  onClose,
  onAddParty,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partyType, setPartyType] = useState<PartyType>("both");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg("Party name is required");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      const businessId = user ? await getBusinessId(user.uid) : null;
      if (businessId) {
        const exists = await checkPartyExistsByName(businessId, name.trim());
        if (exists) {
          const errorText = "Party name already exists";
          setErrorMsg(errorText);
          setLoading(false);
          return;
        }
      }

      await onAddParty({
        name: name.trim(),
        phone: phone.trim() || undefined,
        type: partyType,
      });
      setName("");
      setPhone("");
      setPartyType("both");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to add party");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="bg-surface rounded-t-3xl p-5 pb-8 border-t border-border">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between pb-4 border-b border-border/40 mb-4">
                <Text className="text-lg font-bold text-text">
                  Add New Party
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  className="p-1"
                >
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {errorMsg && (
                <View className="bg-[#EF4444] rounded-2xl px-4 py-3 mb-4 flex-row items-center shadow-xs">
                  <Feather
                    name="alert-circle"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-sm font-semibold text-white flex-1">
                    {errorMsg}
                  </Text>
                </View>
              )}

              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-xs font-semibold text-text-secondary mb-1">
                  Party Name *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="e.g. John Doe / Acme Traders"
                  placeholderTextColor="#94A3B8"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-text font-medium"
                />
              </View>

              {/* Phone Input */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-text-secondary mb-1">
                  Phone Number (Optional)
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="e.g. 9801234567"
                  placeholderTextColor="#94A3B8"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-text font-medium"
                />
              </View>

              {/* Type Selection */}
              <View className="mb-6">
                <Text className="text-xs font-semibold text-text-secondary mb-2">
                  Party Role
                </Text>
                <View className="flex-row space-x-2">
                  {[
                    { id: "customer", label: "Customer" },
                    { id: "supplier", label: "Supplier" },
                    { id: "both", label: "Both" },
                  ].map((t) => {
                    const isSelected = partyType === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        activeOpacity={0.7}
                        onPress={() => setPartyType(t.id as PartyType)}
                        className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-background border-border"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? "text-primary" : "text-text-secondary"
                          }`}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Save Button using Reusable PrimaryButton */}
              <PrimaryButton
                title="Save Party"
                loading={loading}
                onPress={handleSave}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddPartyModal;
