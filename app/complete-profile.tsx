import { Ionicons } from "@expo/vector-icons";
import { appAlert } from "@/components/ui/AppAlert";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { ProfileSection } from "@/components/profile/ProfileSection";
import { HomeLocationPicker } from "@/components/profile/HomeLocationPicker";
import {
  MultiSelectChips,
  NumberChips,
  SelectChips,
  YearChips,
} from "@/components/profile/SelectChips";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { StackPageShell } from "@/components/navigation/StackPageShell";
import {
  DEGREE_OPTIONS,
  EXPERIENCE_OPTIONS,
  graduationYears,
  HEADLINE_OPTIONS,
  INSTITUTION_OPTIONS,
  SKILL_OPTIONS,
} from "@/constants/profile-options";
import {
  EMPTY_JOB_PREFERENCES,
  normalizeJobPreferences,
  PREFERRED_CITY_OPTIONS,
  SALARY_CHIPS,
  type JobPreferencesState,
} from "@/constants/job-preferences-options";
import { MIN_APPLY_PERCENT } from "@/constants/profile";
import {
  formatLocation,
  parseLocation,
  type LocationParts,
} from "@/lib/profile-location";
import { colors, radius, shadow, spacing } from "@/theme";

export default function CompleteProfileScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [meta, setMeta] = useState<ProfileMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showJobPrefs, setShowJobPrefs] = useState(false);

  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [locationParts, setLocationParts] = useState<LocationParts>({
    country: "India",
    state: "",
    city: "",
  });
  const [addressLine, setAddressLine] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number | null>(null);
  const [experienceSummary, setExperienceSummary] = useState("");
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [eduYear, setEduYear] = useState<number | null>(null);
  const [jobPrefs, setJobPrefs] = useState<JobPreferencesState>({ ...EMPTY_JOB_PREFERENCES });

  const load = useCallback(async () => {
    try {
      const data = await fetchSeekerProfile();
      setMeta(data);
      setHeadline(data.profile.headline ?? "");
      setPhone(data.profile.phone ?? "");
      setLocationParts(parseLocation(data.profile.location));
      setAddressLine(data.profile.addressLine ?? "");
      setSkills(data.profile.skills ?? []);
      setExperienceYears(
        data.profile.experienceYears != null ? data.profile.experienceYears : null
      );
      setExperienceSummary(data.profile.experienceSummary ?? "");
      const edu = data.profile.education?.[0];
      setDegree(edu?.degree ?? "");
      setInstitution(edu?.institution ?? "");
      setEduYear(edu?.year ?? null);
      const prefs = normalizeJobPreferences(data.profile.jobPreferences);
      setJobPrefs(prefs);
      setShowJobPrefs(
        prefs.preferredLocations.length > 0 ||
          prefs.expectedSalaryMin != null ||
          prefs.expectedSalaryMax != null
      );
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function navigateAfterReady() {
    if (typeof returnTo === "string" && returnTo.startsWith("/")) {
      router.replace(returnTo as `/job/${string}`);
    }
  }

  async function onSave() {
    if (!headline.trim()) {
      appAlert("Select your role", "Tap what best describes you — or choose Other.");
      return;
    }
    const location = formatLocation(locationParts);
    if (!location.trim()) {
      appAlert("Select location", "Pick your state and city — where you currently live.");
      return;
    }
    if (skills.length === 0) {
      appAlert("Add skills", "Tap at least one skill you have.");
      return;
    }
    if (experienceYears === null) {
      appAlert("Select experience", "How many years have you worked?");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
      appAlert("Invalid phone", "Enter a valid 10-digit mobile number or leave blank to use your registered number.");
      return;
    }
    const hasDegree = !!degree.trim();
    const hasInst = !!institution.trim();
    if (hasDegree !== hasInst) {
      appAlert("Education incomplete", "Add both degree and college, or leave both empty.");
      return;
    }

    setSaving(true);
    try {
      const education =
        hasDegree && hasInst
          ? [
              {
                degree: degree.trim(),
                institution: institution.trim(),
                year: eduYear ?? undefined,
              },
            ]
          : [];
      const data = await updateSeekerProfile({
        headline: headline.trim(),
        phone: phone.trim(),
        location,
        addressLine: addressLine.trim(),
        skills,
        experienceYears,
        experienceSummary: experienceSummary.trim(),
        education,
        jobPreferences: jobPrefs,
      });
      setMeta(data);
      if (data.canApply.allowed) {
        if (typeof returnTo === "string" && returnTo.startsWith("/")) {
          navigateAfterReady();
          return;
        }
        appAlert("Profile ready", "You can apply to jobs now.");
      } else {
        appAlert(
          "Saved",
          `Profile is ${data.canApply.percent}%. Complete remaining items (need ${MIN_APPLY_PERCENT}%).`
        );
      }
    } catch (e) {
      appAlert("Save failed", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function onPickResume() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setUploading(true);
      await uploadResume(asset.uri, asset.name ?? "resume.pdf", asset.mimeType ?? "application/pdf");
      appAlert("Uploaded", "Resume uploaded successfully.");
      void load();
    } catch (e) {
      appAlert("Upload failed", getApiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  function handleBack() {
    if (typeof returnTo === "string" && returnTo.startsWith("/")) {
      router.replace(returnTo as `/job/${string}`);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  }

  if (loading) {
    return (
      <StackPageShell title="Edit profile" onBack={handleBack}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandLight} />
        </View>
      </StackPageShell>
    );
  }

  const percent = meta?.canApply.percent ?? 0;

  return (
    <StackPageShell title="Edit profile" onBack={handleBack}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.hero}>
          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.sub}>{percent >= MIN_APPLY_PERCENT ? "Ready to apply" : `${percent}% complete`}</Text>
        </LinearGradient>

        <ProfileSection icon="person-outline" title="About you" subtitle="Tap to fill">
          <SelectChips
            label="I am a…"
            options={HEADLINE_OPTIONS}
            value={headline}
            onChange={setHeadline}
            allowCustom
          />
          <HomeLocationPicker value={locationParts} onChange={setLocationParts} />
          <AppInput
            label="Mobile"
            icon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit number"
          />
          <MultiSelectChips
            label="Skills"
            options={SKILL_OPTIONS}
            selected={skills}
            onChange={setSkills}
            max={8}
          />
          <NumberChips
            label="Experience"
            options={EXPERIENCE_OPTIONS}
            value={experienceYears}
            onChange={setExperienceYears}
          />
          <SelectChips label="Degree" options={DEGREE_OPTIONS} value={degree} onChange={setDegree} allowCustom />
          <SelectChips
            label="College"
            options={INSTITUTION_OPTIONS}
            value={institution}
            onChange={setInstitution}
            allowCustom
          />
          <YearChips label="Year (optional)" years={graduationYears(8)} value={eduYear} onChange={setEduYear} />
        </ProfileSection>

        {!showJobPrefs &&
        jobPrefs.preferredLocations.length === 0 &&
        jobPrefs.expectedSalaryMin == null ? (
          <Pressable
            style={styles.optionalCard}
            onPress={() => setShowJobPrefs(true)}
          >
            <Text style={styles.optionalCardText}>+ Job preferences (optional)</Text>
          </Pressable>
        ) : (
          <ProfileSection icon="options-outline" title="Job preferences" subtitle="Optional">
            <MultiSelectChips
              label="Job cities (where you want work)"
              options={PREFERRED_CITY_OPTIONS}
              selected={jobPrefs.preferredLocations}
              onChange={(preferredLocations) => setJobPrefs((p) => ({ ...p, preferredLocations }))}
              max={8}
            />
            <Text style={styles.salaryLabel}>Salary</Text>
            <View style={styles.chipsRow}>
              {SALARY_CHIPS.slice(0, 5).map((chip) => {
                const active =
                  jobPrefs.expectedSalaryMin === chip.min && jobPrefs.expectedSalaryMax === chip.max;
                return (
                  <Pressable
                    key={chip.label}
                    style={[styles.salaryChip, active && styles.salaryChipOn]}
                    onPress={() =>
                      setJobPrefs((p) => ({
                        ...p,
                        expectedSalaryMin: active ? null : chip.min,
                        expectedSalaryMax: active ? null : chip.max,
                      }))
                    }
                  >
                    <Text style={[styles.salaryChipText, active && styles.salaryChipTextOn]}>
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ProfileSection>
        )}

        <ProfileSection icon="document-attach-outline" title="Resume">
          <View style={styles.resumeRow}>
            <View style={styles.resumeIcon}>
              <Ionicons
                name={meta?.profile.resumeUrl ? "checkmark-circle" : "cloud-upload-outline"}
                size={28}
                color={meta?.profile.resumeUrl ? colors.success : colors.brandLight}
              />
            </View>
            <View style={styles.resumeBody}>
              <Text style={styles.resumeTitle}>
                {meta?.profile.resumeUrl
                  ? meta.profile.resumeFilename ?? "Resume uploaded"
                  : "No resume yet"}
              </Text>
              <Text style={styles.resumeSub}>
                {meta?.profile.resumeUrl ? "Tap below to replace" : "Recruiters prefer a resume"}
              </Text>
            </View>
          </View>
          <AppButton
            label={uploading ? "Uploading…" : meta?.profile.resumeUrl ? "Replace resume" : "Choose file"}
            onPress={() => void onPickResume()}
            loading={uploading}
            variant="outline"
          />
          {meta?.profile.resumeUrl ? (
            <Pressable onPress={() => void Linking.openURL(meta.profile.resumeUrl!)}>
              <Text style={styles.viewResume}>View uploaded file →</Text>
            </Pressable>
          ) : null}
        </ProfileSection>

        <View style={styles.saveWrap}>
          <AppButton label="Save profile" onPress={() => void onSave()} loading={saving} />
        </View>
      </ScrollView>
    </StackPageShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: spacing.xl },
  hero: { alignItems: "center", padding: spacing.lg, gap: 6 },
  title: { fontSize: 22, fontWeight: "800", color: colors.white },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.75)" },
  progressPill: {
    marginTop: 8,
    backgroundColor: "rgba(255,140,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  progressPillText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  missingCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: "#fff8ee",
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffddb3",
  },
  missingHint: { flex: 1, fontSize: 12, color: colors.slate600, lineHeight: 18 },
  salaryLabel: { fontSize: 14, fontWeight: "700", color: colors.slate800, marginBottom: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  salaryChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  salaryChipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  salaryChipText: { fontSize: 12, fontWeight: "600", color: colors.slate600 },
  salaryChipTextOn: { color: colors.white },
  relocateRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  relocateText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.slate700 },
  optionalLink: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  optionalText: { fontSize: 14, fontWeight: "600", color: colors.brand },
  optionalCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.slate200,
    padding: 14,
    alignItems: "center",
  },
  optionalCardText: { fontSize: 14, fontWeight: "600", color: colors.slate600 },
  resumeRow: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "center" },
  resumeIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
  resumeBody: { flex: 1 },
  resumeTitle: { fontSize: 14, fontWeight: "700", color: colors.brand },
  resumeSub: { fontSize: 12, color: colors.slate500, marginTop: 2 },
  viewResume: { fontSize: 13, fontWeight: "700", color: colors.brandLight, marginTop: 10, textAlign: "center" },
  saveWrap: { paddingHorizontal: spacing.md, marginTop: spacing.sm },
});
