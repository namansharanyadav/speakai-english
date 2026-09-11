import type { Band } from "@/lib/bands";

export type VocabWord = {
  word: string;
  hindi: string;
  meaning: string;
  pronunciation: string;
  example: string;
  hindiExample: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  usage: string;
};

export const VOCAB_CATEGORIES = [
  "Daily English",
  "Travel",
  "Office",
  "Technology",
  "Data Science",
  "AI",
  "Business",
  "Finance",
  "Communication",
  "Interview",
  "Academic English",
  "Advanced vocabulary",
  "Idioms",
  "Phrasal verbs",
  "Collocations",
] as const;

export const VOCABULARY: VocabWord[] = [
  { word: "Reliable", hindi: "विश्वसनीय", meaning: "Someone you can trust to do what they say.", pronunciation: "ri-LYE-uh-bul", example: "He is a reliable employee.", hindiExample: "वह भरोसेमंद कर्मचारी है।", synonyms: ["dependable", "trustworthy"], antonyms: ["unreliable"], difficulty: "beginner", category: "Office", usage: "Use for people and systems that do not fail." },
  { word: "Grateful", hindi: "आभारी", meaning: "Feeling thankful.", pronunciation: "GRAYT-ful", example: "I am grateful for your help.", hindiExample: "मैं आपकी मदद के लिए आभारी हूँ।", synonyms: ["thankful"], antonyms: ["ungrateful"], difficulty: "beginner", category: "Daily English", usage: "Polite after someone helps you." },
  { word: "Commute", hindi: "आना-जाना", meaning: "The daily journey to work.", pronunciation: "kuh-MYOOT", example: "My commute takes forty minutes.", hindiExample: "मेरा आना-जाना चालीस मिनट का है।", synonyms: ["travel"], antonyms: [], difficulty: "beginner", category: "Daily English", usage: "Common in Indian metro cities." },
  { word: "Appointment", hindi: "मुलाकात / अपॉइंटमेंट", meaning: "A planned meeting at a set time.", pronunciation: "uh-POYNT-ment", example: "I have a doctor’s appointment at 5.", hindiExample: "मेरा डॉक्टर से पाँच बजे अपॉइंटमेंट है।", synonyms: ["booking"], antonyms: [], difficulty: "beginner", category: "Daily English", usage: "Doctors, interviews, salons." },
  { word: "Itinerary", hindi: "यात्रा कार्यक्रम", meaning: "A plan of places to visit.", pronunciation: "eye-TIN-uh-rer-ee", example: "Please share the travel itinerary.", hindiExample: "कृपया यात्रा कार्यक्रम भेजें।", synonyms: ["schedule"], antonyms: [], difficulty: "intermediate", category: "Travel", usage: "Hotels and offices use this word." },
  { word: "Deadline", hindi: "अंतिम तिथि", meaning: "The time by which work must be finished.", pronunciation: "DED-line", example: "The deadline is Friday evening.", hindiExample: "अंतिम तिथि शुक्रवार शाम है।", synonyms: ["due date"], antonyms: [], difficulty: "beginner", category: "Office", usage: "Always pair with a date." },
  { word: "Stakeholder", hindi: "हितधारक", meaning: "A person who is affected by a project.", pronunciation: "STAYK-hol-der", example: "We updated the stakeholders after the meeting.", hindiExample: "मीटिंग के बाद हमने हितधारकों को अपडेट दिया।", synonyms: ["interested party"], antonyms: [], difficulty: "intermediate", category: "Office", usage: "Corporate English staple." },
  { word: "Bandwidth", hindi: "समय / क्षमता", meaning: "Available time or capacity to do more work.", pronunciation: "BAND-width", example: "I don’t have bandwidth this week.", hindiExample: "इस हफ्ते मेरे पास समय नहीं है।", synonyms: ["capacity"], antonyms: [], difficulty: "intermediate", category: "Office", usage: "Informal office English." },
  { word: "Pipeline", hindi: "कार्य-सूची / पाइपलाइन", meaning: "Work that is planned but not finished.", pronunciation: "PIPE-line", example: "We have three deals in the pipeline.", hindiExample: "पाइपलाइन में तीन डील हैं।", synonyms: ["queue"], antonyms: [], difficulty: "intermediate", category: "Business", usage: "Sales and product teams." },
  { word: "Dashboard", hindi: "डैशबोर्ड", meaning: "A screen of key numbers.", pronunciation: "DASH-bord", example: "The dashboard shows weekly sales.", hindiExample: "डैशबोर्ड साप्ताहिक सेल्स दिखाता है।", synonyms: ["overview"], antonyms: [], difficulty: "beginner", category: "Data Science", usage: "Analytics and BI." },
  { word: "Insight", hindi: "अंतर्दृष्टि / समझ", meaning: "A useful finding from data.", pronunciation: "IN-site", example: "The report gave us a clear insight.", hindiExample: "रिपोर्ट से साफ़ समझ मिली।", synonyms: ["finding"], antonyms: [], difficulty: "intermediate", category: "Data Science", usage: "Prefer this over ‘information’ in presentations." },
  { word: "Prompt", hindi: "प्रॉम्प्ट / निर्देश", meaning: "The instruction you give an AI model.", pronunciation: "prompt", example: "Write a clearer prompt for the model.", hindiExample: "मॉडल के लिए साफ़ प्रॉम्प्ट लिखें।", synonyms: ["instruction"], antonyms: [], difficulty: "beginner", category: "AI", usage: "AI/ML conversations." },
  { word: "Hallucination", hindi: "गलत जानकारी बनाना", meaning: "When an AI invents facts.", pronunciation: "huh-loo-sih-NAY-shun", example: "Check the answer for hallucination.", hindiExample: "जवाब में ग़लत तथ्य तो नहीं।", synonyms: ["fabrication"], antonyms: [], difficulty: "advanced", category: "AI", usage: "Technical AI English." },
  { word: "Negotiate", hindi: "मोलभाव / बातचीत करना", meaning: "To discuss until both sides agree.", pronunciation: "ni-GOH-shee-ayt", example: "We negotiated a better rate.", hindiExample: "हमने बेहतर रेट पर सहमति बनाई।", synonyms: ["bargain"], antonyms: [], difficulty: "intermediate", category: "Business", usage: "Salary, vendors, clients." },
  { word: "Invoice", hindi: "बिल / चालान", meaning: "A bill for work done.", pronunciation: "IN-voys", example: "Please raise an invoice for March.", hindiExample: "मार्च का चालान बनाइए।", synonyms: ["bill"], antonyms: [], difficulty: "beginner", category: "Finance", usage: "Freelance and office." },
  { word: "Revenue", hindi: "आय / रेवेन्यू", meaning: "Money a company earns.", pronunciation: "REV-uh-nyoo", example: "Revenue grew 12% this quarter.", hindiExample: "इस तिमाही आय 12% बढ़ी।", synonyms: ["income"], antonyms: ["loss"], difficulty: "intermediate", category: "Finance", usage: "Business reviews." },
  { word: "Articulate", hindi: "स्पष्ट बोलना", meaning: "To express ideas clearly.", pronunciation: "ar-TIK-yuh-layt", example: "She articulated the problem well.", hindiExample: "उसने समस्या साफ़ समझाई।", synonyms: ["express"], antonyms: ["mumble"], difficulty: "advanced", category: "Communication", usage: "Interviews and leadership." },
  { word: "Concise", hindi: "संक्षिप्त", meaning: "Short and clear.", pronunciation: "kun-SICE", example: "Keep the email concise.", hindiExample: "ईमेल छोटा और साफ़ रखें।", synonyms: ["brief"], antonyms: ["wordy"], difficulty: "intermediate", category: "Communication", usage: "Emails and slides." },
  { word: "Strength", hindi: "मज़बूती / गुण", meaning: "Something you are good at.", pronunciation: "strength", example: "My strength is staying calm under pressure.", hindiExample: "दबाव में शांत रहना मेरी ताक़त है।", synonyms: ["forte"], antonyms: ["weakness"], difficulty: "beginner", category: "Interview", usage: "Classic interview answer." },
  { word: "Hypothesis", hindi: "परिकल्पना", meaning: "An idea you test with data.", pronunciation: "hy-POTH-uh-sis", example: "Our hypothesis is that churn is price-driven.", hindiExample: "हमारी परिकल्पना है कि churn कीमत से जुड़ा है।", synonyms: ["theory"], antonyms: [], difficulty: "advanced", category: "Academic English", usage: "Research and data science." },
  { word: "Nevertheless", hindi: "फिर भी", meaning: "In spite of that.", pronunciation: "nev-er-thuh-LESS", example: "The task was hard. Nevertheless, we finished.", hindiExample: "काम कठिन था। फिर भी हमने पूरा किया।", synonyms: ["however"], antonyms: [], difficulty: "advanced", category: "Advanced vocabulary", usage: "Formal writing and speaking." },
  { word: "Break the ice", hindi: "बातचीत शुरू करना", meaning: "To start a conversation comfortably.", pronunciation: "break thee ice", example: "A small joke can break the ice.", hindiExample: "एक छोटी बात से बातचीत शुरू हो जाती है।", synonyms: ["warm up"], antonyms: [], difficulty: "intermediate", category: "Idioms", usage: "Meetings and networking." },
  { word: "Figure out", hindi: "समझ निकलना", meaning: "To find the answer.", pronunciation: "FIG-yer out", example: "Let’s figure out a simpler plan.", hindiExample: "आइए एक सरल योजना निकालें।", synonyms: ["solve"], antonyms: [], difficulty: "beginner", category: "Phrasal verbs", usage: "Everyday and office." },
  { word: "Follow up", hindi: "बाद में संपर्क करना", meaning: "To check again later.", pronunciation: "FOL-oh up", example: "I will follow up tomorrow.", hindiExample: "मैं कल फिर संपर्क करूँगा।", synonyms: ["check in"], antonyms: [], difficulty: "beginner", category: "Phrasal verbs", usage: "Emails: ‘Just following up’." },
  { word: "Make a decision", hindi: "फैसला करना", meaning: "To choose.", pronunciation: "make uh di-SIZH-un", example: "We need to make a decision today.", hindiExample: "आज फैसला करना है।", synonyms: ["decide"], antonyms: [], difficulty: "beginner", category: "Collocations", usage: "Natural collocation — not ‘do a decision’." },
  { word: "Query", hindi: "सवाल / क्वेरी", meaning: "A question, or a database request.", pronunciation: "KWEER-ee", example: "Run this SQL query on the orders table.", hindiExample: "orders टेबल पर यह SQL क्वेरी चलाएँ।", synonyms: ["question"], antonyms: [], difficulty: "intermediate", category: "Technology", usage: "IT and data roles." },
  { word: "Latency", hindi: "देरी / लेटेंसी", meaning: "Delay in a system.", pronunciation: "LAY-ten-see", example: "We reduced API latency by 40%.", hindiExample: "API की देरी 40% घटाई।", synonyms: ["delay"], antonyms: [], difficulty: "advanced", category: "Technology", usage: "Engineering reviews." },
  { word: "Regression", hindi: "रिग्रेशन", meaning: "A model that predicts a number, or a bug that returns.", pronunciation: "ri-GRESH-un", example: "We used linear regression on sales data.", hindiExample: "सेल्स डेटा पर लीनियर रिग्रेशन लगाया।", synonyms: [], antonyms: [], difficulty: "advanced", category: "Data Science", usage: "Data science interviews." },
  { word: "Ownership", hindi: "ज़िम्मेदारी लेना", meaning: "Treating a task as yours until it is done.", pronunciation: "OH-ner-ship", example: "She took ownership of the launch.", hindiExample: "उसने लॉन्च की पूरी ज़िम्मेदारी ली।", synonyms: ["responsibility"], antonyms: [], difficulty: "intermediate", category: "Interview", usage: "Highly valued in Indian IT interviews." },
  { word: "Escalate", hindi: "ऊपर तक पहुंचाना", meaning: "To take a problem to a more senior person.", pronunciation: "ES-kuh-layt", example: "If the client is blocked, escalate immediately.", hindiExample: "क्लाइंट अटका हो तो तुरंत ऊपर तक बताएँ।", synonyms: ["raise"], antonyms: [], difficulty: "intermediate", category: "Office", usage: "Support and delivery teams." },
];

export type GrammarTopic = {
  slug: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  explanation: string;
  hindi: string;
  examples: string[];
  mistakes: { bad: string; good: string; why: string }[];
  practice: { prompt: string; answer: string }[];
  speaking: string;
};

export const GRAMMAR: GrammarTopic[] = [
  {
    slug: "nouns",
    title: "Nouns",
    level: "beginner",
    explanation: "A noun names a person, place, thing, or idea. Countable nouns take a/an and plurals; uncountable nouns do not.",
    hindi: "संज्ञा किसी व्यक्ति, जगह, चीज़ या विचार का नाम है। गिनती वाली संज्ञा के साथ a/an और बहुवचन लगता है।",
    examples: ["I bought two notebooks.", "She needs some information. (not informations)"],
    mistakes: [{ bad: "I need informations.", good: "I need information.", why: "Information is uncountable." }],
    practice: [{ prompt: "Correct: She gave me many advices.", answer: "She gave me a lot of advice." }],
    speaking: "Name five things on your desk using a or some.",
  },
  {
    slug: "pronouns",
    title: "Pronouns",
    level: "beginner",
    explanation: "Pronouns replace nouns: I, you, he, she, it, we, they, me, him, her, us, them.",
    hindi: "सर्वनाम संज्ञा की जगह आते हैं।",
    examples: ["Ravi is late. He is in traffic.", "Please send it to me."],
    mistakes: [{ bad: "Me went to market.", good: "I went to the market.", why: "Subject uses I, not me." }],
    practice: [{ prompt: "Replace the name: Priya called Priya’s manager.", answer: "Priya called her manager." }],
    speaking: "Talk about your family using he, she, and they.",
  },
  {
    slug: "verbs",
    title: "Verbs",
    level: "beginner",
    explanation: "Verbs show action or state. English verbs change with tense and with he/she/it in the present.",
    hindi: "क्रिया काम या स्थिति दिखाती है। he/she/it के साथ present में -s लगता है।",
    examples: ["She works in Gurgaon.", "They work from home."],
    mistakes: [{ bad: "He go to office.", good: "He goes to office.", why: "Third person singular takes -s." }],
    practice: [{ prompt: "Correct: She do her work.", answer: "She does her work." }],
    speaking: "Describe three things you do every morning.",
  },
  {
    slug: "tenses",
    title: "Tenses",
    level: "beginner",
    explanation: "Tense places an action in time. Past simple for finished time (yesterday). Present perfect for life experience or unfinished time (already, yet, since, for).",
    hindi: "Tense समय बताता है। Yesterday = past simple. Since/for = present perfect.",
    examples: ["I went to the market yesterday.", "I have worked here for two years."],
    mistakes: [{ bad: "I am go to market yesterday.", good: "I went to the market yesterday.", why: "Yesterday needs past simple." }],
    practice: [{ prompt: "Correct: I am working here since two years.", answer: "I have been working here for two years." }],
    speaking: "Tell me what you did yesterday and what you have done this week.",
  },
  {
    slug: "articles",
    title: "Articles",
    level: "beginner",
    explanation: "A/an for one non-specific thing. The for something specific or already known. No article with general uncountable ideas.",
    hindi: "A/an = कोई एक। The = खास वाला।",
    examples: ["I need a laptop.", "The laptop on my desk is new."],
    mistakes: [{ bad: "I went to market.", good: "I went to the market.", why: "The market is a known place." }],
    practice: [{ prompt: "Fill: She is ___ engineer.", answer: "an" }],
    speaking: "Describe your room using a, an, and the.",
  },
  {
    slug: "prepositions",
    title: "Prepositions",
    level: "beginner",
    explanation: "In, on, at for time and place. For = duration. Since = starting point.",
    hindi: "For अवधि के लिए, since शुरू होने के समय के लिए।",
    examples: ["at 6 AM, on Monday, in March", "for two years / since 2024"],
    mistakes: [{ bad: "I am working here since two years.", good: "I have been working here for two years.", why: "Duration uses for." }],
    practice: [{ prompt: "in / on / at: ___ Friday evening", answer: "on" }],
    speaking: "Say when and where you work using in, on, and at.",
  },
  {
    slug: "modals",
    title: "Modals",
    level: "intermediate",
    explanation: "Can, could, should, must, might add meaning to a verb. After a modal, use the base form.",
    hindi: "Modal के बाद क्रिया की मूल form आती है — can go, not can going.",
    examples: ["You should send the deck today.", "I might join the call."],
    mistakes: [{ bad: "You should to go.", good: "You should go.", why: "No ‘to’ after should." }],
    practice: [{ prompt: "Polite request for a file.", answer: "Could you please share the file?" }],
    speaking: "Give three pieces of advice to a junior using should and could.",
  },
  {
    slug: "conditionals",
    title: "Conditionals",
    level: "intermediate",
    explanation: "If + present, will + verb (real future). If + past, would + verb (imaginary).",
    hindi: "असली भविष्य: If I get time, I will call. काल्पनिक: If I had time, I would call.",
    examples: ["If I get the data, I will share the chart.", "If I were you, I would ask for a raise."],
    mistakes: [{ bad: "If I will go, I will call.", good: "If I go, I will call.", why: "No will in the if-clause." }],
    practice: [{ prompt: "Complete: If I were the manager, I ___", answer: "would…" }],
    speaking: "Talk about what you would do if you led your team.",
  },
  {
    slug: "sva",
    title: "Subject-verb agreement",
    level: "beginner",
    explanation: "Singular subjects take singular verbs. Everyone, each, nobody are singular.",
    hindi: "एकवचन कर्ता = एकवचन क्रिया। Everyone singular है।",
    examples: ["The list of tasks is long.", "Everyone is ready."],
    mistakes: [{ bad: "The team are working.", good: "The team is working.", why: "Team is usually singular in Indian/British office English." }],
    practice: [{ prompt: "Correct: Each of the files are ready.", answer: "Each of the files is ready." }],
    speaking: "Describe your team using is/are correctly.",
  },
  {
    slug: "questions",
    title: "Question formation",
    level: "beginner",
    explanation: "Yes/no: Do/Does/Did + subject + verb. Wh-: What do you do? For be: Are you ready?",
    hindi: "सहायक क्रिया पहले आती है: Do you work? What do you do?",
    examples: ["Where do you work?", "Did you finish the report?"],
    mistakes: [{ bad: "Where you work?", good: "Where do you work?", why: "Need do/does in present questions." }],
    practice: [{ prompt: "Make a question: You live in Gurugram.", answer: "Do you live in Gurugram?" }],
    speaking: "Ask five questions you would ask a new colleague.",
  },
  {
    slug: "passive",
    title: "Active and passive voice",
    level: "intermediate",
    explanation: "Passive: be + past participle. Use it when the action matters more than the doer.",
    hindi: "Passive: be + third form. काम ज़रूरी हो, करने वाला नहीं।",
    examples: ["The report was sent yesterday.", "The bug has been fixed."],
    mistakes: [{ bad: "The mail is send.", good: "The mail was sent.", why: "Past participle is sent." }],
    practice: [{ prompt: "Change to passive: They completed the project.", answer: "The project was completed." }],
    speaking: "Describe a launch using passive: was released, was tested, was approved.",
  },
  {
    slug: "reported",
    title: "Direct and indirect speech",
    level: "intermediate",
    explanation: "When we report, tenses often shift back and pronouns change.",
    hindi: "Reported speech में tense पीछे सरक सकता है।",
    examples: ["She said she was busy.", "He asked if I had finished."],
    mistakes: [{ bad: "He said that he is tired yesterday.", good: "He said that he was tired.", why: "Reporting verb in past → shift tense." }],
    practice: [{ prompt: "Report: ‘I will join at 5,’ she said.", answer: "She said she would join at 5." }],
    speaking: "Report a conversation you had this morning.",
  },
  {
    slug: "relative",
    title: "Relative clauses",
    level: "advanced",
    explanation: "Who/which/that add extra information. Who = people. Which = things. That = defining clause.",
    hindi: "Who लोगों के लिए, which चीज़ों के लिए।",
    examples: ["The engineer who wrote the query is on leave.", "The dashboard that we built is live."],
    mistakes: [{ bad: "The man which called you…", good: "The man who called you…", why: "People take who." }],
    practice: [{ prompt: "Join: I met a PM. She led the launch.", answer: "I met a PM who led the launch." }],
    speaking: "Describe a colleague using who and a tool using that.",
  },
  {
    slug: "advanced-sentences",
    title: "Advanced sentence structures",
    level: "advanced",
    explanation: "Use contrast (although, whereas), cause (since, as), and inversion for emphasis (Not only… but also).",
    hindi: "Contrast, cause और emphasis से वाक्य परिपक्व लगते हैं।",
    examples: ["Although the data was noisy, the trend was clear.", "Not only did we ship on time, we also reduced cost."],
    mistakes: [{ bad: "Although it was late but we finished.", good: "Although it was late, we finished.", why: "Do not pair although with but." }],
    practice: [{ prompt: "Rewrite with although: It rained. We went.", answer: "Although it rained, we went." }],
    speaking: "Give a project update using although, which, and so that.",
  },
  {
    slug: "adjectives",
    title: "Adjectives and adverbs",
    level: "beginner",
    explanation: "Adjectives describe nouns. Adverbs describe verbs and often end in -ly.",
    hindi: "Adjective संज्ञा को, adverb क्रिया को बताता है।",
    examples: ["She is a careful analyst.", "She checks the numbers carefully."],
    mistakes: [{ bad: "She speaks English good.", good: "She speaks English well.", why: "Well is the adverb." }],
    practice: [{ prompt: "Correct: He did the work perfect.", answer: "He did the work perfectly." }],
    speaking: "Describe how you work using three adverbs.",
  },
  {
    slug: "conjunctions",
    title: "Conjunctions",
    level: "beginner",
    explanation: "And, but, so, because, although connect ideas. Because answers why. So answers result.",
    hindi: "Because = कारण। So = नतीजा।",
    examples: ["I stayed late because the release was today.", "The query failed, so we rolled back."],
    mistakes: [{ bad: "Because I was tired so I slept.", good: "Because I was tired, I slept.", why: "Do not use because and so together." }],
    practice: [{ prompt: "Join with so: The file was huge. The upload failed.", answer: "The file was huge, so the upload failed." }],
    speaking: "Tell a short story using because, but, and so.",
  },
];

export const ROLEPLAY = {
  "Daily Life": [
    "Restaurant",
    "Shopping",
    "Hotel",
    "Airport",
    "Asking directions",
    "Doctor appointment",
    "Meeting a new person",
  ],
  Professional: [
    "Job interview",
    "HR interview",
    "Team meeting",
    "Client meeting",
    "Salary negotiation",
    "Presentation",
    "Asking for leave",
    "Giving project updates",
    "Talking to manager",
    "Customer support",
  ],
  Advanced: [
    "Debate",
    "Leadership discussion",
    "Business negotiation",
    "Technical interview",
    "Public speaking",
    "Group discussion",
  ],
} as const;

export const MIRROR_TOPICS = [
  "Introduce yourself",
  "Talk about your family",
  "Describe your city",
  "Explain your daily routine",
  "Talk about your career",
  "Talk about your favorite movie",
  "Explain your project",
  "Talk about your goals",
];

export const ROUND_TABLE_TOPICS = [
  "Will AI replace human jobs?",
  "Should offices return five days a week?",
  "Is English necessary for success in India?",
  "Are competitive exams the best path?",
  "Should social media have age limits?",
];

export const HINDI_PROMPTS = [
  { hi: "मैं रोज़ सुबह 6 बजे उठता हूँ।", en: "I wake up at 6 AM every morning.", natural: "I usually wake up at around 6 AM every morning.", advanced: "I generally start my day by waking up around 6 AM." },
  { hi: "कल मैं बाज़ार गया था।", en: "I went to the market yesterday.", natural: "I went to the market yesterday.", advanced: "I dropped by the market yesterday." },
  { hi: "मैं दो साल से यहाँ काम कर रहा हूँ।", en: "I have been working here for two years.", natural: "I have been working here for two years.", advanced: "I have been with this team for the past two years." },
  { hi: "क्या आप मुझे रास्ता बता सकते हैं?", en: "Could you tell me the way?", natural: "Could you please tell me how to get there?", advanced: "Would you mind pointing me in the right direction?" },
  { hi: "मुझे छुट्टी चाहिए क्योंकि मैं बीमार हूँ।", en: "I need leave because I am sick.", natural: "I would like to take leave today because I am unwell.", advanced: "I would like to request sick leave as I am not feeling well." },
  { hi: "यह प्रोजेक्ट अगले हफ्ते पूरा होगा।", en: "This project will be completed next week.", natural: "We will complete this project next week.", advanced: "We are on track to close this project next week." },
];

export const PATH_STEPS = [
  { id: "beginner", title: "Beginner", blurb: "Sounds, greetings, and survival English." },
  { id: "basic-vocab", title: "Basic vocabulary", blurb: "Daily words you can use tonight." },
  { id: "basic-grammar", title: "Basic grammar", blurb: "Present, past, and articles." },
  { id: "simple-convo", title: "Simple conversations", blurb: "Short, real dialogues." },
  { id: "elementary", title: "Elementary", blurb: "Describe your life with confidence." },
  { id: "intermediate", title: "Intermediate", blurb: "Opinions, stories, and work talk." },
  { id: "advanced-grammar", title: "Advanced grammar", blurb: "Conditionals, clauses, polish." },
  { id: "fluent", title: "Fluent conversation", blurb: "Talk without translating first." },
  { id: "professional", title: "Professional English", blurb: "Meetings, mail, and interviews." },
  { id: "advanced-comm", title: "Advanced communication", blurb: "Lead, negotiate, present." },
];

export const ACADEMY = [
  { slug: "workplace", title: "Workplace English", summary: "Stand-ups, blockers, and polite pushback." },
  { slug: "interview", title: "Interview English", summary: "STAR stories, strengths, and salary." },
  { slug: "corporate", title: "Corporate communication", summary: "Status, alignment, and next steps." },
  { slug: "presentation", title: "Presentation skills", summary: "Open, signpost, and close." },
  { slug: "email", title: "Email communication", summary: "Clear subject lines and asks." },
  { slug: "meetings", title: "Meetings", summary: "Agenda, turn-taking, minutes." },
  { slug: "leadership", title: "Leadership communication", summary: "Vision, feedback, and calm." },
  { slug: "client", title: "Client communication", summary: "Updates, delays, and trust." },
  { slug: "negotiation", title: "Negotiation", summary: "Ask, anchor, and close." },
  { slug: "public", title: "Public speaking", summary: "Breath, structure, presence." },
  { slug: "networking", title: "Networking", summary: "Intros that do not sound scripted." },
  { slug: "technical", title: "Technical communication", summary: "Explain SQL, Python, and models to a manager." },
];

export const TECH_DRILLS = [
  "Explain your latest data analytics project to a manager.",
  "Walk through a SQL query you wrote last month.",
  "Describe a Python script you automated.",
  "Explain a Power BI dashboard to a non-technical stakeholder.",
  "How would you present an ML model’s accuracy without jargon?",
  "Tell a client why a cloud migration slipped by a week.",
];

export const LISTENING: Record<string, { title: string; script: string; questions: { q: string; a: string }[] }> = {
  beginner: {
    title: "A slow morning",
    script: "Good morning. I wake up at six. I drink tea. Then I go to the office by metro. I start work at nine.",
    questions: [
      { q: "What time does the speaker wake up?", a: "six" },
      { q: "How do they go to the office?", a: "metro" },
    ],
  },
  intermediate: {
    title: "A standup update",
    script: "Yesterday I finished the sales dashboard. Today I am fixing a filter bug. I might need help from data engineering if the join is slow.",
    questions: [
      { q: "What did they finish yesterday?", a: "dashboard" },
      { q: "Who might they need help from?", a: "data engineering" },
    ],
  },
  advanced: {
    title: "A fast product review",
    script: "Look, churn is up two points week on week, mostly in the free tier. If we ship the onboarding fix by Thursday we can isolate whether it is product or pricing. I would not wait for the full quarter review.",
    questions: [
      { q: "Where is churn rising?", a: "free tier" },
      { q: "When should the fix ship?", a: "Thursday" },
    ],
  },
  professional: {
    title: "Client steering call",
    script: "Thanks for joining. We are green on ingestion, amber on the semantic layer, and red on the executive dashboard because the KPI definitions are still open. I propose we freeze the definitions today so design is not blocked.",
    questions: [
      { q: "What is red?", a: "executive dashboard" },
      { q: "What should be frozen today?", a: "KPI definitions" },
    ],
  },
};

export const INTERVIEW: Record<Band, { prompt: string; hint: string }[]> = {
  C: [
    { prompt: "What is your name, and where do you live?", hint: "Use I am / I live in." },
    { prompt: "What do you do every day?", hint: "Use present simple: I wake up, I go, I work." },
    { prompt: "Tell us about your family or friends.", hint: "Keep sentences short and clear." },
    { prompt: "Why do you want to speak better English?", hint: "Because + simple reason." },
  ],
  B: [
    { prompt: "Walk us through a typical workday or study day.", hint: "Sequence with first, then, after that." },
    { prompt: "Describe a challenge you solved recently.", hint: "Problem → action → result." },
    { prompt: "What topics do you enjoy talking about, and why?", hint: "Give a reason and an example." },
    { prompt: "How do you practise English outside class?", hint: "Be specific: apps, colleagues, news." },
  ],
  A: [
    { prompt: "Walk me through a project you would present to leadership.", hint: "Context, decision, impact, next step." },
    { prompt: "How do you handle disagreement with a stakeholder?", hint: "Listen, restate, propose options." },
    { prompt: "Explain a technical idea to a non-technical manager.", hint: "No jargon without a translation." },
    { prompt: "Where should your English be in twelve months, and why?", hint: "Tie the goal to career outcomes." },
  ],
};

export const FEATURE_WHY = [
  { title: "AI Speaking Partner", body: "Talk out loud with an AI that replies like a person, not a worksheet." },
  { title: "Hindi explanation", body: "See why a sentence is wrong — in Hindi — then hear the natural English." },
  { title: "Instant grammar correction", body: "Corrections appear beside the chat. The conversation keeps moving." },
  { title: "Pronunciation feedback", body: "Practise sounds that trip Hindi speakers, then score the attempt." },
  { title: "Real human conversations", body: "Voice and video rooms with other learners, with an optional AI coach." },
  { title: "Professional English", body: "Interviews, stand-ups, clients, and data reviews — not just textbook dialogues." },
  { title: "English games", body: "Tense battles, synonym races, and speak-and-score rounds that actually teach." },
  { title: "Personalized learning", body: "Average, Intermediate, or Professional — the whole product shifts with you." },
];

export const PUBLIC_ROOMS = [
  { slug: "beginner-club", name: "Beginner English Club", topic: "Slow, kind conversations", band: "C" },
  { slug: "daily", name: "Daily English Conversation", topic: "What happened today", band: "C" },
  { slug: "interview", name: "Job Interview Practice", topic: "STAR stories and HR rounds", band: "B" },
  { slug: "it", name: "IT Professionals", topic: "Sprints, tickets, and demos", band: "A" },
  { slug: "data", name: "Data Analyst English", topic: "Dashboards and insights", band: "A" },
  { slug: "ielts", name: "IELTS Speaking", topic: "Part 1–3 drills", band: "B" },
  { slug: "debate", name: "Debate Club", topic: "Structured disagreement", band: "A" },
  { slug: "advanced", name: "Advanced English", topic: "Nuance, tone, rhetoric", band: "A" },
];
