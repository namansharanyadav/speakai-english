export type Band = "C" | "B" | "A";

export type BandMeta = {
  band: Band;
  label: string;
  hindiLabel: string;
  short: string;
  cefr: string;
  targetCefr: string;
  englishLevel: string;
  hindiRatio: number;
  dailyMinutes: number;
  description: string;
  hindiDescription: string;
  dashboardTone: string;
};

export const BANDS: Record<Band, BandMeta> = {
  C: {
    band: "C",
    label: "Average",
    hindiLabel: "सामान्य",
    short: "C · Average",
    cefr: "A2",
    targetCefr: "B1",
    englishLevel: "elementary",
    hindiRatio: 70,
    dailyMinutes: 15,
    description: "Build everyday sentences with Hindi support and gentle corrections.",
    hindiDescription: "रोज़मर्रा की अंग्रेज़ी, हिंदी सहारे के साथ।",
    dashboardTone: "Keep it simple. Speak a little every day.",
  },
  B: {
    band: "B",
    label: "Intermediate",
    hindiLabel: "मध्यम",
    short: "B · Intermediate",
    cefr: "B1",
    targetCefr: "B2",
    englishLevel: "intermediate",
    hindiRatio: 30,
    dailyMinutes: 20,
    description: "Hold real conversations. Short Hindi notes only when needed.",
    hindiDescription: "असली बातचीत। ज़रूरत पड़ने पर ही हिंदी।",
    dashboardTone: "Stretch into natural, confident English.",
  },
  A: {
    band: "A",
    label: "Professional",
    hindiLabel: "पेशेवर",
    short: "A · Professional",
    cefr: "C1",
    targetCefr: "C2",
    englishLevel: "professional",
    hindiRatio: 0,
    dailyMinutes: 25,
    description: "Workplace English, interviews, and leadership communication.",
    hindiDescription: "ऑफिस, इंटरव्यू और लीडरशिप वाली अंग्रेज़ी।",
    dashboardTone: "Lead the room. Speak like a professional.",
  },
};

export const BAND_ORDER: Band[] = ["C", "B", "A"];

export function isBand(v: unknown): v is Band {
  return v === "A" || v === "B" || v === "C";
}

export const GOALS = [
  { id: "daily_conversation", label: "Daily conversation", hindi: "रोज़ की बातचीत" },
  { id: "job_interview", label: "Job interview", hindi: "जॉब इंटरव्यू" },
  { id: "office", label: "Office communication", hindi: "ऑफिस कम्युनिकेशन" },
  { id: "data_it", label: "Data / IT professional", hindi: "डेटा / आईटी प्रोफेशनल" },
  { id: "business", label: "Business English", hindi: "बिज़नेस अंग्रेज़ी" },
  { id: "travel", label: "Travel", hindi: "यात्रा" },
  { id: "public_speaking", label: "Public speaking", hindi: "पब्लिक स्पीकिंग" },
  { id: "exams", label: "Competitive exams", hindi: "प्रतियोगी परीक्षा" },
  { id: "general_fluency", label: "General fluency", hindi: "सामान्य धाराप्रवाहता" },
] as const;

export const TOPICS = [
  "Daily life",
  "Work",
  "Technology",
  "Data & AI",
  "Travel",
  "Family",
  "News",
  "Interviews",
  "Presentations",
  "Shopping",
] as const;

export const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
