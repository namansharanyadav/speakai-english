export type GameDef = {
  id: string;
  title: string;
  blurb: string;
  premium?: boolean;
};

export const GAMES: GameDef[] = [
  { id: "word-builder", title: "Word Builder", blurb: "Make English words from a letter pool." },
  { id: "sentence-builder", title: "Sentence Builder", blurb: "Put the words in a natural order." },
  { id: "grammar-battle", title: "Grammar Battle", blurb: "Pick the sentence that is actually correct." },
  { id: "fill-blank", title: "Fill the Blank", blurb: "Complete the missing word." },
  { id: "vocab-match", title: "Vocabulary Match", blurb: "Match English with Hindi meanings." },
  { id: "speak-score", title: "Speak & Score", blurb: "Say the sentence. Get a speaking score." },
  { id: "guess-word", title: "Guess the Word", blurb: "Use the clues. Type the word." },
  { id: "rapid-fire", title: "Rapid Fire", blurb: "Ten seconds. One answer." },
  { id: "tense-challenge", title: "Tense Challenge", blurb: "Name the tense. Keep the streak." },
  { id: "synonym-race", title: "Synonym Race", blurb: "Choose the closest synonym." },
  { id: "antonym", title: "Antonym Challenge", blurb: "Pick the opposite meaning." },
  { id: "phrasal", title: "Phrasal Verb Challenge", blurb: "Choose the natural phrasal verb." },
  { id: "listening", title: "Listening Challenge", blurb: "Hear a line, then answer." },
  { id: "conversation", title: "Conversation Challenge", blurb: "Finish a realistic dialogue." },
];

export const WORD_POOLS = [
  { letters: "RELIABLE", words: ["REAL", "ABLE", "BEAR", "EARL", "REEL", "RELIABLE", "BARE", "EAR"] },
  { letters: "SPEAKING", words: ["SPEAK", "SING", "KING", "PEAK", "SPAN", "GAIN", "SANG", "PIN"] },
  { letters: "CONFIDENT", words: ["CONFIDENT", "FINE", "TONE", "NOTE", "CODE", "DINE", "COIN", "TEND"] },
];

export const SENTENCE_ROUNDS = [
  { words: ["I", "went", "to", "the", "market", "yesterday"], answer: "I went to the market yesterday" },
  { words: ["She", "has", "been", "working", "here", "for", "two", "years"], answer: "She has been working here for two years" },
  { words: ["Could", "you", "please", "share", "the", "file"], answer: "Could you please share the file" },
  { words: ["I", "will", "follow", "up", "tomorrow"], answer: "I will follow up tomorrow" },
];

export const GRAMMAR_BATTLE = [
  { a: "He go to office every day.", b: "He goes to office every day.", correct: "b" },
  { a: "I have been working here for two years.", b: "I am working here since two years.", correct: "a" },
  { a: "She speaks English well.", b: "She speaks English good.", correct: "a" },
  { a: "If I will get time, I will call.", b: "If I get time, I will call.", correct: "b" },
  { a: "The team is working on it.", b: "The team are working on it.", correct: "a" },
];

export const FILL_BLANK = [
  { q: "I ___ to the market yesterday.", options: ["go", "went", "gone"], answer: "went" },
  { q: "She has been here ___ 2022.", options: ["for", "since", "from"], answer: "since" },
  { q: "Please keep the email ___.", options: ["concise", "concisely", "concision"], answer: "concise" },
  { q: "We need to ___ a decision today.", options: ["do", "make", "take"], answer: "make" },
];

export const MATCH_PAIRS = [
  { en: "Reliable", hi: "विश्वसनीय" },
  { en: "Deadline", hi: "अंतिम तिथि" },
  { en: "Grateful", hi: "आभारी" },
  { en: "Insight", hi: "अंतर्दृष्टि" },
  { en: "Negotiate", hi: "मोलभाव करना" },
  { en: "Follow up", hi: "बाद में संपर्क करना" },
];

export const GUESS_CLUES = [
  { clues: ["You can trust this person", "Opposite of unreliable", "Office compliment"], answer: "reliable" },
  { clues: ["Daily travel to work", "Metro, bus, or car", "Common in Gurugram"], answer: "commute" },
  { clues: ["Money a company earns", "Not profit", "Quarterly number"], answer: "revenue" },
];

export const RAPID = [
  { q: "Past of go?", a: "went" },
  { q: "Opposite of cheap?", a: "expensive" },
  { q: "Plural of child?", a: "children" },
  { q: "She ___ (be) a designer.", a: "is" },
  { q: "Article before hour?", a: "an" },
  { q: "Synonym of happy?", a: "glad" },
];

export const TENSES = [
  { s: "I have finished the report.", a: "Present perfect" },
  { s: "She was presenting when the call dropped.", a: "Past continuous" },
  { s: "We will ship on Thursday.", a: "Future simple" },
  { s: "He goes to office at nine.", a: "Present simple" },
  { s: "They had left before I arrived.", a: "Past perfect" },
];

export const SYNONYMS = [
  { w: "reliable", options: ["trustworthy", "late", "random"], a: "trustworthy" },
  { w: "concise", options: ["brief", "long", "loud"], a: "brief" },
  { w: "insight", options: ["finding", "furniture", "delay"], a: "finding" },
];

export const ANTONYMS = [
  { w: "reliable", options: ["unreliable", "useful", "early"], a: "unreliable" },
  { w: "concise", options: ["wordy", "short", "kind"], a: "wordy" },
  { w: "accept", options: ["reject", "agree", "join"], a: "reject" },
];

export const PHRASALS = [
  { q: "I will ___ the client tomorrow.", options: ["follow up with", "follow up on with", "follow"], a: "follow up with" },
  { q: "Let’s ___ a simpler plan.", options: ["figure out", "figure of", "figure in"], a: "figure out" },
  { q: "Please ___ the lights when you leave.", options: ["turn off", "turn of", "turn down off"], a: "turn off" },
];

export const DIALOGUES = [
  {
    context: "You are late to a stand-up.",
    bot: "Hey — we started. Any blockers?",
    options: ["Sorry I am late. No blockers. I will finish the dashboard today.", "I late. Dashboard doing."],
    a: 0,
  },
  {
    context: "A hotel reception in Jaipur.",
    bot: "Good evening. Do you have a reservation?",
    options: ["Yes, I booked a room under Sharma.", "I want room now give."],
    a: 0,
  },
];
