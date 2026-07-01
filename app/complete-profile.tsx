import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  fetchSeekerProfile,
  updateSeekerProfile,
  uploadResume,
  type ProfileMeta,
} from "@/api/profile";
import { getApiErrorMessage } from "@/api/client";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, shadow, spacing } from "@/theme";

const MIN_PERCENT = 60;

export default function CompleteProfileScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [meta, setMeta] = useState<ProfileMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [eduYear, setEduYear] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchSeekerProfile();
      setMeta(data);
      setHeadline(data.profile.headline ?? "");
      setPhone(data.profile.phone ?? "");
      setLocation(data.profile.location ?? "");
      setSkills((data.profile.skills ?? []).join(", "));
      setExperienceYears(
        data.profile.experienceYears != null ? String(data.profile.experienceYears) : ""
      );
      setExperienceSummary(data.profile.experienceSummary ?? "");
      const edu = data.profile.education?.[0];
      setDegree(edu?.degree ?? "");
      setInstitution(edu?.institution ?? "");
      setEduYear(edu?.year != null ? String(edu.year) : "");
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave() {
    setSaving(true);
    try {
      const education =
        degree.trim() || institution.trim()
          ? [
              {
                degree: degree.trim(),
                institution: institution.trim(),
                year: Number(eduYear) || undefined,
              },
            ]
          : [];
      const data = await updateSeekerProfile({
        headline: headline.trim(),
        phone: phone.trim(),
        location: location.trim(),
        skills,
        experienceYears: Number(experienceYears) || 0,
        experienceSummary: experienceSummary.trim(),
        education,
      });
      setMeta(data);
      if (data.canApply.allowed) {
        Alert.alert("Profile ready", "You can apply to jobs now.", [
          {
            text: "Continue",
            onPress: () => {
              if (typeof returnTo === "string" && returnTo.startsWith("/")) {
                router.replace(returnTo as `/job/${string}`);
              }
            },
          },
          { text: "OK" },
        ]);
      } else {
        Alert.alert(
          "Saved",
          `Profile is ${data.canApply.percent}%. Complete remaining items (need ${MIN_PERCENT}%).`
        );
      }
    } catch (e) {
      Alert.alert("Save failed", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function onPickResume() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setUploading(true);
      const profile = await uploadResume(
        asset.uri,
        asset.name ?? "resume.pdf",
        asset.mimeType ?? "application/pdf"
      );
      setMeta((prev) =>
        prev ? { ...prev, profile: { ...prev.profile, ...profile } } : prev
      );
      Alert.alert("Uploaded", "Resume uploaded successfully.");
      void load();
    } catch (e) {
      Alert.alert("Upload failed", getApiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </Screen>
    );
  }

  const percent = meta?.canApply.percent ?? 0;
  const missing = meta?.canApply.missing ?? [];

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.hero}>
          <Ionicons name="person-circle-outline" size={36} color={colors.brandLight} />
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.sub}>Reach {MIN_PERCENT}% to apply to jobs</Text>
        </LinearGradient>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Profile completeness</Text>
            <Text style={styles.progressValue}>{percent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          {missing.map((item) => (
            <Text key={item} style={styles.missingText}>• {item}</Text>
          ))}
        </View>

        <View style={styles.form}>
          <AppInput label="Professional headline" icon="briefcase-outline" value={headline} onChangeText={setHeadline} placeholder="e.g. React developer · 2 yrs" />
          <AppInput label="Phone" icon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="10-digit mobile" />
          <AppInput label="Location" icon="location-outline" value={location} onChangeText={setLocation} placeholder="City, state" />
          <AppInput label="Skills" icon="code-slash-outline" value={skills} onChangeText={setSkills} placeholder="React, Node.js" />
          <AppInput label="Years of experience" icon="time-outline" keyboardType="number-pad" value={experienceYears} onChangeText={setExperienceYears} placeholder="0" />
          <AppInput label="Experience summary" icon="reader-outline" value={experienceSummary} onChangeText={setExperienceSummary} placeholder="Brief work history" multiline />

          <Text style={styles.sectionLabel}>Education</Text>
          <AppInput label="Degree" icon="school-outline" value={degree} onChangeText={setDegree} placeholder="B.Tech, MBA" />
          <AppInput label="Institution" icon="business-outline" value={institution} onChangeText={setInstitution} placeholder="University name" />
          <AppInput label="Year" icon="calendar-outline" keyboardType="number-pad" value={eduYear} onChangeText={setEduYear} placeholder="2020" />

          <View style={styles.resumeBox}>
            <Text style={styles.resumeTitle}>Resume</Text>
            <Text style={styles.resumeSub}>
              {meta?.profile.resumeUrl
                ? `Uploaded: ${meta.profile.resumeFilename ?? "resume"}`
                : "Upload PDF or Word document"}
            </Text>
            <AppButton
              label={uploading ? "Uploading…" : "Upload resume"}
              onPress={() => void onPickResume()}
              loading={uploading}
              variant="outline"
            />
            {meta?.profile.resumeUrl ? (
              <Pressable onPress={() => void Linking.openURL(meta.profile.resumeUrl!)}>
                <Text style={styles.viewResume}>View resume →</Text>
              </Pressable>
            ) : null}
          </View>

          <AppButton label="Save profile" onPress={() => void onSave()} loading={saving} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: spacing.xl },
  hero: { alignItems: "center", padding: spacing.lg, gap: 6 },
  title: { fontSize: 22, fontWeight: "800", color: colors.white },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.75)" },
  progressCard: {
    margin: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.brand100,
    ...shadow.card,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: "600", color: colors.brand },
  progressValue: { fontSize: 15, fontWeight: "800", color: colors.brandLight },
  progressTrack: { height: 8, backgroundColor: colors.brand50, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.brandLight, borderRadius: 4 },
  missingText: { fontSize: 12, color: colors.slate500, marginTop: 6 },
  form: { paddingHorizontal: spacing.md },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: colors.brand, marginTop: spacing.sm, marginBottom: 4 },
  resumeBox: {
    backgroundColor: colors.brand50,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.brand100,
    gap: 8,
  },
  resumeTitle: { fontSize: 14, fontWeight: "700", color: colors.brand },
  resumeSub: { fontSize: 12, color: colors.slate500 },
  viewResume: { fontSize: 13, fontWeight: "700", color: colors.brandLight, marginTop: 4 },
});
