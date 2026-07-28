import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SelectChips } from "@/components/profile/SelectChips";
import {
  citiesForState,
  DEFAULT_COUNTRY,
  formatLocation,
  HOME_CITY_SHORTCUTS,
  INDIA_STATE_NAMES,
  type LocationParts,
} from "@/lib/profile-location";
import { colors, spacing } from "@/theme";

type Props = {
  value: LocationParts;
  onChange: (parts: LocationParts) => void;
};

export function HomeLocationPicker({ value, onChange }: Props) {
  const cities = useMemo(
    () => (value.state ? citiesForState(value.state) : []),
    [value.state]
  );
  const preview = formatLocation(value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Where you live</Text>
      <Text style={styles.hint}>City, state & country — not the same as job preferences</Text>

      <SelectChips
        label="Quick pick"
        options={HOME_CITY_SHORTCUTS.map((x) => x.label)}
        value={
          HOME_CITY_SHORTCUTS.find(
            (x) => x.parts.city === value.city && x.parts.state === value.state
          )?.label ?? ""
        }
        onChange={(label) => {
          const hit = HOME_CITY_SHORTCUTS.find((x) => x.label === label);
          if (hit) onChange(hit.parts);
        }}
      />

      <SelectChips
        label="State"
        options={INDIA_STATE_NAMES}
        value={value.state}
        onChange={(state) => onChange({ country: DEFAULT_COUNTRY, state, city: "" })}
        allowCustom
        customPlaceholder="Your state"
      />

      <SelectChips
        label="City"
        hint={value.state ? "Pick your city" : "Select state first"}
        options={cities.length ? cities : [value.city].filter(Boolean)}
        value={value.city}
        onChange={(city) => onChange({ ...value, country: DEFAULT_COUNTRY, city })}
        allowCustom
        customPlaceholder="Your city"
      />

      <Text style={styles.country}>Country: {value.country || DEFAULT_COUNTRY}</Text>

      {preview ? <Text style={styles.preview}>Saved as: {preview}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  title: { fontSize: 14, fontWeight: "700", color: colors.brand },
  hint: { fontSize: 12, color: colors.slate500, marginBottom: spacing.sm, lineHeight: 17 },
  country: { fontSize: 12, color: colors.slate600, marginTop: 4 },
  preview: { fontSize: 12, fontWeight: "600", color: colors.success, marginTop: 6 },
});
