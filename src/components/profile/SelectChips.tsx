import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

function isPresetValue(value: string, options: readonly string[]) {
  return !!value && options.includes(value);
}

export function SelectChips({
  label,
  hint,
  options,
  value,
  onChange,
  allowCustom,
  customPlaceholder = "Type your own…",
}: {
  label: string;
  hint?: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
}) {
  const [otherMode, setOtherMode] = useState(() => isPresetValue(value, options) === false && !!value);

  useEffect(() => {
    if (value && !isPresetValue(value, options)) setOtherMode(true);
  }, [value, options]);

  const presetSelected = isPresetValue(value, options);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.chips}>
        {options.map((opt) => {
          const on = value === opt;
          return (
            <Pressable
              key={opt}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => {
                setOtherMode(false);
                onChange(opt);
              }}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{opt}</Text>
            </Pressable>
          );
        })}
        {allowCustom ? (
          <Pressable
            style={[styles.chip, otherMode && styles.chipOn]}
            onPress={() => {
              setOtherMode(true);
              if (presetSelected) onChange("");
            }}
          >
            <Text style={[styles.chipText, otherMode && styles.chipTextOn]}>Other</Text>
          </Pressable>
        ) : null}
      </View>
      {allowCustom && otherMode ? (
        <TextInput
          style={styles.customInput}
          value={presetSelected ? "" : value}
          onChangeText={onChange}
          placeholder={customPlaceholder}
          placeholderTextColor={colors.slate400}
        />
      ) : null}
    </View>
  );
}

export function MultiSelectChips({
  label,
  hint,
  options,
  selected,
  onChange,
  max = 10,
}: {
  label: string;
  hint?: string;
  options: readonly string[];
  selected: string[];
  onChange: (skills: string[]) => void;
  max?: number;
}) {
  function toggle(skill: string) {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else if (selected.length < max) {
      onChange([...selected, skill]);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{selected.length}/{max}</Text>
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {selected.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll}>
          {selected.map((s) => (
            <Pressable key={s} style={styles.selectedPill} onPress={() => toggle(s)}>
              <Text style={styles.selectedText}>{s}</Text>
              <Ionicons name="close-circle" size={16} color={colors.brand} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.chips}>
        {options.map((opt) => {
          const on = selected.includes(opt);
          const disabled = !on && selected.length >= max;
          return (
            <Pressable
              key={opt}
              style={[styles.chip, on && styles.chipOn, disabled && styles.chipDisabled]}
              onPress={() => !disabled && toggle(opt)}
            >
              {on ? <Ionicons name="checkmark" size={14} color={colors.white} style={styles.check} /> : null}
              <Text style={[styles.chipText, on && styles.chipTextOn, disabled && styles.chipTextDisabled]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function NumberChips({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: readonly { label: string; value: number }[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.numRow}>
        {options.map((opt) => {
          const on = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.numChip, on && styles.chipOn]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[styles.numText, on && styles.chipTextOn]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function YearChips({
  label,
  years,
  value,
  onChange,
}: {
  label: string;
  years: number[];
  value: number | null;
  onChange: (y: number) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.numRow}>
        {years.map((y) => {
          const on = value === y;
          return (
            <Pressable key={y} style={[styles.numChip, on && styles.chipOn]} onPress={() => onChange(y)}>
              <Text style={[styles.numText, on && styles.chipTextOn]}>{y}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 14, fontWeight: "700", color: colors.brand, marginBottom: 4 },
  count: { fontSize: 12, fontWeight: "600", color: colors.slate400 },
  hint: { fontSize: 12, color: colors.slate500, marginBottom: 10, lineHeight: 17 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.brand100,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipDisabled: { opacity: 0.45 },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.slate600 },
  chipTextOn: { color: colors.white },
  chipTextDisabled: { color: colors.slate400 },
  check: { marginRight: 4 },
  customInput: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: colors.brand100,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.slate900,
    backgroundColor: colors.white,
  },
  selectedScroll: { marginBottom: 10 },
  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brand50,
    borderRadius: radius.full,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  selectedText: { fontSize: 12, fontWeight: "700", color: colors.brand },
  numRow: { gap: 8, paddingVertical: 2 },
  numChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.brand100,
    minWidth: 56,
    alignItems: "center",
  },
  numText: { fontSize: 14, fontWeight: "700", color: colors.slate600 },
});
