import { router, useLocalSearchParams } from "expo-router";
import { appAlert } from "@/components/ui/AppAlert";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  createRecruiterJob,
  fetchRecruiterCompany,
  fetchRecruiterJob,
  updateRecruiterJob,
} from "@/api/recruiter";
import { fetchCategories } from "@/api/seeker";
import { getApiErrorMessage } from "@/api/client";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { StackPageShell } from "@/components/navigation/StackPageShell";
import { colors, radius, spacing } from "@/theme";

const JOB_TYPES = [
  { key: "full_time", label: "Full-time" },
  { key: "part_time", label: "Part-time" },
  { key: "contract", label: "Contract" },
  { key: "internship", label: "Internship" },
  { key: "remote", label: "Remote" },
] as const;

export default function PostJobScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("0");
  const [jobType, setJobType] = useState<string>("full_time");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [hasCompany, setHasCompany] = useState(true);

  const load = useCallback(async () => {
    try {
      const [cats, company] = await Promise.all([
        fetchCategories(),
        fetchRecruiterCompany().catch(() => null),
      ]);
      setCategories(cats);
      setHasCompany(!!company?.name?.trim());
      if (id) {
        const job = await fetchRecruiterJob(id);
        setTitle(job.title);
        setDescription(job.descriptionHtml?.replace(/<[^>]+>/g, " ") ?? "");
        setLocation(job.location);
        setSalaryMin(String(job.salaryMin ?? 0));
        setSalaryMax(String(job.salaryMax ?? 0));
        setSkills((job.requiredSkills ?? []).join(", "));
        setExperience(String(job.experienceMinYears ?? 0));
        setJobType(job.jobType ?? "full_time");
        setCategoryId(typeof job.categoryId === "string" ? job.categoryId : null);
      }
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(asDraft: boolean) {
    if (!hasCompany) {
      appAlert("Company profile required", "Create your company profile before posting jobs.", [
        { text: "Cancel", style: "cancel" },
        { text: "Create company", onPress: () => router.push("/recruiter/company") },
      ]);
      return;
    }
    if (!title.trim() || !description.trim() || !location.trim()) {
      appAlert("Required fields", "Title, description and location are required.");
      return;
    }
    const min = Number(salaryMin) || 0;
    const max = Number(salaryMax) || min;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        descriptionHtml: `<p>${description.trim().replace(/\n/g, "</p><p>")}</p>`,
        location: location.trim(),
        salaryMin: min,
        salaryMax: max,
        requiredSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        experienceMinYears: Number(experience) || 0,
        jobType,
        categoryId,
        status: asDraft ? ("draft" as const) : ("pending_review" as const),
      };
      if (isEdit && id) {
        await updateRecruiterJob(id, payload);
        appAlert("Updated", "Job saved successfully.", [{ text: "OK", onPress: () => router.back() }]);
      } else {
        await createRecruiterJob(payload);
        appAlert("Submitted", asDraft ? "Draft saved." : "Job submitted for review.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <StackPageShell title={isEdit ? "Edit job" : "Post a job"}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandLight} />
        </View>
      </StackPageShell>
    );
  }

  return (
    <StackPageShell title={isEdit ? "Edit job" : "Post a job"}>
        {!hasCompany ? (
          <Pressable style={styles.companyBanner} onPress={() => router.push("/recruiter/company")}>
            <Text style={styles.companyBannerText}>
              Create your company profile before posting jobs →
            </Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.scroll}>
          <AppInput label="Job title *" icon="briefcase-outline" value={title} onChangeText={setTitle} placeholder="e.g. Software Engineer" />
          <AppInput label="Location *" icon="location-outline" value={location} onChangeText={setLocation} placeholder="City, state" />
          <AppInput label="Min salary (₹/year)" icon="cash-outline" keyboardType="number-pad" value={salaryMin} onChangeText={setSalaryMin} placeholder="300000" />
          <AppInput label="Max salary (₹/year)" icon="cash-outline" keyboardType="number-pad" value={salaryMax} onChangeText={setSalaryMax} placeholder="800000" />
          <AppInput label="Required skills" icon="code-slash-outline" value={skills} onChangeText={setSkills} placeholder="React, Node.js" />
          <AppInput label="Min experience (years)" icon="time-outline" keyboardType="number-pad" value={experience} onChangeText={setExperience} placeholder="0" />
          <AppInput label="Job description *" icon="document-text-outline" value={description} onChangeText={setDescription} placeholder="Role responsibilities…" multiline />

          <Text style={styles.label}>Job type</Text>
          <View style={styles.chips}>
            {JOB_TYPES.map((t) => (
              <Pressable
                key={t.key}
                style={[styles.chip, jobType === t.key && styles.chipOn]}
                onPress={() => setJobType(t.key)}
              >
                <Text style={[styles.chipText, jobType === t.key && styles.chipTextOn]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {categories.length > 0 ? (
            <>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                <Pressable style={[styles.chip, !categoryId && styles.chipOn]} onPress={() => setCategoryId(null)}>
                  <Text style={[styles.chipText, !categoryId && styles.chipTextOn]}>None</Text>
                </Pressable>
                {categories.map((c) => (
                  <Pressable
                    key={c._id}
                    style={[styles.chip, categoryId === c._id && styles.chipOn]}
                    onPress={() => setCategoryId(c._id)}
                  >
                    <Text style={[styles.chipText, categoryId === c._id && styles.chipTextOn]}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}

          <View style={styles.btns}>
            <AppButton label={isEdit ? "Save changes" : "Submit for review"} onPress={() => void onSubmit(false)} loading={saving} />
            <AppButton label="Save as draft" variant="outline" onPress={() => void onSubmit(true)} disabled={saving} />
          </View>
        </ScrollView>
    </StackPageShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  companyBanner: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: "#fff8ee",
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffddb3",
  },
  companyBannerText: { fontSize: 13, fontWeight: "700", color: colors.brand },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: "600", color: colors.brand, marginBottom: 8, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.brand100 },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.slate500 },
  chipTextOn: { color: colors.white },
  catScroll: { marginBottom: spacing.md },
  btns: { gap: 10, marginTop: spacing.md },
});
