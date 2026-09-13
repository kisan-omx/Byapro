import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  LayoutAnimation,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { convertToBS } from "../../utils/dateUtils";

export interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (formattedDate: string) => void;
  initialDate?: Date;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const FULL_BS_MONTHS = [
  "Baisakh",
  "Jestha",
  "Asadh",
  "Shrawan",
  "Bhadau",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_OF_WEEK_HEADER = ["S", "M", "T", "W", "T", "F", "S"];

function parseManualDate(text: string): Date | null {
  const parts = text.split(/[/.-]/).map((p) => p.trim());
  if (parts.length === 3) {
    const [p1, p2, p3] = parts.map((num) => parseInt(num, 10));
    if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3)) {
      if (p3 >= 1900 && p3 <= 2100) {
        const m = p1 - 1;
        const d = p2;
        if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
          const dt = new Date(p3, m, d);
          if (!isNaN(dt.getTime())) return dt;
        }
      }
      if (p1 >= 1900 && p1 <= 2100) {
        const m = p2 - 1;
        const d = p3;
        if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
          const dt = new Date(p1, m, d);
          if (!isNaN(dt.getTime())) return dt;
        }
      }
    }
  }
  return null;
}

function DatePickerModalComponent({
  visible,
  onClose,
  onSelectDate,
  initialDate,
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => initialDate || new Date(),
  );
  const [viewYear, setViewYear] = useState<number>(() =>
    (initialDate || new Date()).getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    (initialDate || new Date()).getMonth(),
  );
  const [isBSMode, setIsBSMode] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [isManualInputMode, setIsManualInputMode] = useState(false);
  const [manualTextInput, setManualTextInput] = useState("");

  const animateTransition = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // Sync view state when opened
  React.useEffect(() => {
    if (visible) {
      const d = initialDate || new Date();
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setIsYearPickerOpen(false);
      setIsManualInputMode(false);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const y = d.getFullYear();
      setManualTextInput(`${m}/${day}/${y}`);
    }
  }, [visible, initialDate]);

  // Calendar grid calculations
  const { daysInMonth, startDayIndex } = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startDayIndex: firstDay.getDay(),
    };
  }, [viewYear, viewMonth]);

  const handlePrevMonth = useCallback(() => {
    animateTransition();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth, animateTransition]);

  const handleNextMonth = useCallback(() => {
    animateTransition();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth, animateTransition]);

  const bsInfo = useMemo(() => {
    return convertToBS(selectedDate);
  }, [selectedDate]);

  const toggleBSMode = useCallback(() => {
    animateTransition();
    setIsBSMode((prev) => !prev);
  }, [animateTransition]);

  const toggleManualInput = useCallback(() => {
    animateTransition();
    setIsManualInputMode((prev) => {
      const next = !prev;
      if (next) {
        const m = selectedDate.getMonth() + 1;
        const d = selectedDate.getDate();
        const y = selectedDate.getFullYear();
        setManualTextInput(`${m}/${d}/${y}`);
      }
      return next;
    });
  }, [selectedDate, animateTransition]);

  const toggleYearPicker = useCallback(() => {
    animateTransition();
    setIsYearPickerOpen((prev) => !prev);
  }, [animateTransition]);

  const handleManualTextChange = useCallback((text: string) => {
    setManualTextInput(text);
    const parsed = parseManualDate(text);
    if (parsed) {
      setSelectedDate(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, []);

  const handleConfirm = useCallback(() => {
    let dateToUse = selectedDate;
    if (isManualInputMode && manualTextInput) {
      const parsed = parseManualDate(manualTextInput);
      if (parsed) {
        dateToUse = parsed;
      }
    }

    if (isBSMode) {
      const bs = convertToBS(dateToUse);
      const formatted = `${bs.bsDay}-${FULL_BS_MONTHS[bs.bsMonthIndex]}-${bs.bsYear}`;
      onSelectDate(formatted);
    } else {
      const day = dateToUse.getDate();
      const monthStr = SHORT_MONTHS[dateToUse.getMonth()];
      const year = dateToUse.getFullYear();
      const formatted = `${day}-${monthStr}-${year}`;
      onSelectDate(formatted);
    }
    onClose();
  }, [
    selectedDate,
    isManualInputMode,
    manualTextInput,
    isBSMode,
    onSelectDate,
    onClose,
  ]);

  // Selected date header text (e.g. "Tue, Sep 8" or "Tue, Bhadau 23")
  const selectedHeaderStr = useMemo(() => {
    const dayOfWeek = DAY_NAMES_SHORT[selectedDate.getDay()];
    if (isBSMode) {
      const monthStr = FULL_BS_MONTHS[bsInfo.bsMonthIndex] || "Bhadau";
      return `${dayOfWeek}, ${monthStr} ${bsInfo.bsDay}`;
    }
    const monthStr = SHORT_MONTHS[selectedDate.getMonth()];
    const day = selectedDate.getDate();
    return `${dayOfWeek}, ${monthStr} ${day}`;
  }, [selectedDate, isBSMode, bsInfo]);

  // Dynamic month title (e.g., "September 2026" or "Bhadau 2083")
  const currentMonthYearTitle = useMemo(() => {
    if (isBSMode) {
      const currentBs = convertToBS(new Date(viewYear, viewMonth, 15));
      const monthStr = FULL_BS_MONTHS[currentBs.bsMonthIndex] || "Bhadau";
      return `${monthStr} ${currentBs.bsYear}`;
    }
    return `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  }, [viewYear, viewMonth, isBSMode]);

  // Year Grid numbers array
  const yearList = useMemo(() => {
    if (isBSMode) {
      const currentBs = convertToBS(new Date(viewYear, viewMonth, 15));
      const activeBsYear = currentBs.bsYear;
      const years: number[] = [];
      for (let y = 2075; y <= 2095; y++) {
        years.push(y);
      }
      return { years, activeYear: activeBsYear };
    } else {
      const years: number[] = [];
      for (let y = 2018; y <= 2038; y++) {
        years.push(y);
      }
      return { years, activeYear: viewYear };
    }
  }, [viewYear, viewMonth, isBSMode]);

  const handleSelectYear = useCallback(
    (y: number) => {
      animateTransition();
      if (isBSMode) {
        const adYear = y - 57;
        setViewYear(adYear);
      } else {
        setViewYear(y);
      }
      setIsYearPickerOpen(false);
    },
    [isBSMode, animateTransition],
  );

  // Pre-calculate empty cells and day cells for instant 60fps rendering
  const gridCells = useMemo(() => {
    const emptyCells = Array.from({ length: startDayIndex });
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { emptyCells, dayNumbers };
  }, [startDayIndex, daysInMonth]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="w-full max-w-sm bg-surface rounded-3xl p-5 shadow-2xl">
              {/* Header Bar */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-semibold text-text-secondary">
                  Select date
                </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={toggleBSMode}>
                  <Text className="text-xs font-bold text-primary">
                    {isBSMode ? "Switch to AD" : "Switch to BS"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Big Selected Date Display */}
              <View className="flex-row items-center justify-between border-b border-border/40 pb-4 mb-4">
                <Text className="text-2xl font-bold text-text">
                  {selectedHeaderStr}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={toggleManualInput}
                  className="p-1"
                >
                  {isManualInputMode ? (
                    <Feather name="calendar" size={20} color="#1E293B" />
                  ) : (
                    <Feather name="edit-2" size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>

              {isManualInputMode ? (
                /* Manual Text Input View */
                <View className="my-4 pt-2 pb-6">
                  <View className="border-2 border-primary rounded-2xl px-4 py-2.5 relative">
                    <View className="absolute -top-3 left-3 bg-surface px-1 z-10">
                      <Text className="text-xs font-semibold text-primary">
                        Enter Date
                      </Text>
                    </View>
                    <TextInput
                      value={manualTextInput}
                      onChangeText={handleManualTextChange}
                      keyboardType="numeric"
                      placeholder="M/D/YYYY"
                      placeholderTextColor="#94A3B8"
                      className="text-xl font-bold text-text py-1"
                      autoFocus
                    />
                  </View>
                </View>
              ) : (
                <>
                  {/* Month Navigator */}
                  <View className="flex-row items-center justify-between mb-3 px-1">
                    <TouchableOpacity
                      className="flex-row items-center py-1"
                      activeOpacity={0.7}
                      onPress={toggleYearPicker}
                    >
                      <Text className="text-sm font-bold text-text mr-1">
                        {currentMonthYearTitle}
                      </Text>
                      <Feather
                        name={isYearPickerOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#64748B"
                      />
                    </TouchableOpacity>

                    {!isYearPickerOpen && (
                      <View className="flex-row items-center space-x-3 gap-3">
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handlePrevMonth}
                          className="p-1"
                        >
                          <Feather
                            name="chevron-left"
                            size={20}
                            color="#475569"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleNextMonth}
                          className="p-1"
                        >
                          <Feather
                            name="chevron-right"
                            size={20}
                            color="#475569"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Year Grid View or Days Calendar View */}
                  {isYearPickerOpen ? (
                    <ScrollView
                      className="max-h-60"
                      showsVerticalScrollIndicator={false}
                    >
                      <View className="flex-row flex-wrap items-center">
                        {yearList.years.map((y) => {
                          const isSelected = y === yearList.activeYear;
                          return (
                            <TouchableOpacity
                              key={`year-${y}`}
                              activeOpacity={0.7}
                              onPress={() => handleSelectYear(y)}
                              className="w-[33.33%] py-2.5 items-center justify-center"
                            >
                              <View
                                className={`px-4 py-1.5 rounded-full items-center justify-center ${
                                  isSelected ? "bg-primary" : ""
                                }`}
                              >
                                <Text
                                  className={`text-sm font-bold ${
                                    isSelected ? "text-white" : "text-text"
                                  }`}
                                >
                                  {y}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  ) : (
                    <>
                      {/* Days of Week Header */}
                      <View className="flex-row items-center justify-around mb-2">
                        {DAYS_OF_WEEK_HEADER.map((d, index) => (
                          <View
                            key={index}
                            className="w-9 items-center justify-center"
                          >
                            <Text className="text-xs font-bold text-text-secondary">
                              {d}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Calendar Days Grid */}
                      <View className="flex-row flex-wrap items-center">
                        {/* Empty cells before start of month */}
                        {gridCells.emptyCells.map((_, index) => (
                          <View
                            key={`empty-${index}`}
                            className="w-[14.28%] h-9"
                          />
                        ))}

                        {/* Days of month */}
                        {gridCells.dayNumbers.map((dayNum) => {
                          const isSelected =
                            selectedDate.getDate() === dayNum &&
                            selectedDate.getMonth() === viewMonth &&
                            selectedDate.getFullYear() === viewYear;

                          return (
                            <TouchableOpacity
                              key={`day-${dayNum}`}
                              activeOpacity={0.7}
                              onPress={() => {
                                setSelectedDate(
                                  new Date(viewYear, viewMonth, dayNum),
                                );
                              }}
                              className="w-[14.28%] h-9 items-center justify-center"
                            >
                              <View
                                className={`w-8 h-8 rounded-full items-center justify-center ${
                                  isSelected ? "bg-primary" : ""
                                }`}
                              >
                                <Text
                                  className={`text-xs font-bold ${
                                    isSelected ? "text-white" : "text-text"
                                  }`}
                                >
                                  {dayNum}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}
                </>
              )}

              {/* Footer Actions (Cancel & OK) */}
              <View className="flex-row items-center justify-end space-x-4 gap-4 mt-5 pt-2">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  className="px-3 py-1.5"
                >
                  <Text className="text-sm font-bold text-primary">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleConfirm}
                  className="px-3 py-1.5"
                >
                  <Text className="text-sm font-bold text-primary">OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export const DatePickerModal = React.memo(DatePickerModalComponent);
export default DatePickerModal;
