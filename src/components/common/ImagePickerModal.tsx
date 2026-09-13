import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onSelectGallery,
  onSelectCamera,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center items-center"
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-xl w-4/5 overflow-hidden shadow-lg"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Gallery Option */}
            <TouchableOpacity
              className="px-6 py-5 border-b border-gray-100 flex-row items-center"
              onPress={() => {
                onClose();
                onSelectGallery();
              }}
            >
              <Feather name="image" size={20} color="#475569" />
              <Text className="text-base text-slate-800 font-medium ml-3">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            {/* Camera Option */}
            <TouchableOpacity
              className="px-6 py-5 flex-row items-center"
              onPress={() => {
                onClose();
                onSelectCamera();
              }}
            >
              <Feather name="camera" size={20} color="#475569" />
              <Text className="text-base text-slate-800 font-medium ml-3">
                Take Photo
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ImagePickerModal;
