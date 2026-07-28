import { router } from "expo-router";
import { appAlert } from "@/components/ui/AppAlert";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchRecruiterCompany, saveRecruiterCompany } from "@/api/recruiter";
import { getApiErrorMessage } from "@/api/client";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { StackPageShell } from "@/components/navigation/StackPageShell";
import { colors, radius, shadow, spacing } from "@/theme";

export default function RecruiterCompanyScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");

  const load = useCallback(async () => {
    try {
      const company = await fetchRecruiterCompany();
      if (company) {
        setName(company.name ?? "");
        setDescription(company.description ?? "");
        setWebsite(company.website ?? "");
        setIndustry(company.industry ?? "");
        setCompanySize(company.companySize ?? "");
      }
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave() {
    if (!name.trim()) {
      appAlert("Required", "Company name is required.");
      return;
    }
    setSaving(true);
    try {
      await saveRecruiterCompany({
        name: name.trim(),
        description: description.trim(),
        website: website.trim(),
        industry: industry.trim(),
        companySize: companySize.trim(),
      });
      appAlert("Saved", "Company profile updated.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <StackPageShell title="Company profile">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandLight} />
        </View>
      </StackPageShell>
    );
  }

  return (
    <StackPageShell title="Company profile">
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.info}>
            <Text style={styles.infoText}>
              Set up your company before posting jobs. This appears on all your job listings.
            </Text>
          </View>
          <View style={styles.form}>
            <AppInput label="Company name *" icon="business-outline" value={name} onChangeText={setName} placeholder="Your company" />
            <AppInput label="Industry" icon="grid-outline" value={industry} onChangeText={setIndustry} placeholder="e.g. IT Services" />
            <AppInput label="Company size" icon="people-outline" value={companySize} onChangeText={setCompanySize} placeholder="e.g. 50-200" />
            <AppInput label="Website" icon="globe-outline" value={website} onChangeText={setWebsite} placeholder="https://..." autoCapitalize="none" />
            <AppInput label="Description" icon="document-text-outline" value={description} onChangeText={setDescription} placeholder="About your company" multiline />
            <AppButton label="Save company" onPress={() => void onSave()} loading={saving} />
          </View>
        </ScrollView>
    </StackPageShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: spacing.xl },
  info: {
    margin: spacing.md,
    backgroundColor: colors.brand50,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  infoText: { fontSize: 13, color: colors.slate600, lineHeight: 20 },
  form: { paddingHorizontal: spacing.md },
});
