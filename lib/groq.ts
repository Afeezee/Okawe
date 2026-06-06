import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export type Flashcard = {
  front: string;
  back: string;
};

export async function askReadingAssistant(
  bookTitle: string,
  pageText: string,
  userQuestion: string,
  history: ChatHistoryItem[]
): Promise<string> {
  const safeHistory = (history || []).filter(
    (m) => m && typeof m.role === "string" && typeof m.content === "string" && ["user", "assistant"].includes(m.role)
  );

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content: `You are Okawe AI, a knowledgeable and patient reading assistant helping a student understand the academic book "${bookTitle}".
You have access to the current page content. Answer questions clearly, define complex terms, and explain concepts at undergraduate level.
If a question is unrelated to the book content, gently redirect the student.
Keep responses concise and educational. Use bullet points where helpful.`,
      },
      ...safeHistory,
      {
        role: "user",
        content: `Current page content:\n"""\n${pageText.slice(0, 3000)}\n"""\n\nStudent's question: ${userQuestion}`,
      },
    ],
  });
  return response.choices[0].message.content ?? "I could not generate a response.";
}

export async function semanticSearch(
  query: string,
  books: { id: string; title: string; author: string; subject: string | null; description: string | null }[]
): Promise<string[]> {
  if (!books.length) return [];

  const bookList = books
    .map((b) => `ID:${b.id} | "${b.title}" by ${b.author} | Subject: ${b.subject ?? "General"} | ${b.description ?? ""}`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `You are a semantic search engine for an academic e-library.

Available books:
${bookList}

Student search query: "${query}"

Find books that are conceptually relevant to the query — by topic, theme, subject, or meaning, not just exact keywords.
Return ONLY a valid JSON array of book IDs ordered by relevance. Include only genuinely relevant matches.
Example output: ["clxabc123","clxdef456"]
If nothing is relevant, return: []
Do not include any explanation or markdown.`,
      },
    ],
  });

  try {
    const raw = response.choices[0].message.content?.trim() ?? "[]";
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function generateSummary(bookTitle: string, pageText: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `You are a study assistant for the book "${bookTitle}". Generate clear, structured study summaries.`,
      },
      {
        role: "user",
        content: `Write a study summary of this text in 3 well-structured paragraphs.
Focus on key concepts, definitions, and ideas a student must understand and remember.

Text:
${pageText.slice(0, 4000)}`,
      },
    ],
  });
  return response.choices[0].message.content ?? "";
}

export async function generateQuiz(bookTitle: string, pageText: string): Promise<QuizQuestion[]> {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `You are a study assistant for "${bookTitle}". Generate challenging but fair quiz questions.`,
      },
      {
        role: "user",
        content: `Generate exactly 5 multiple-choice questions to test a student's comprehension of this text.
Each question must have 4 options (A, B, C, D) and one correct answer.
Return ONLY valid JSON with no explanation or markdown:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A. ..."}]

Text:
${pageText.slice(0, 4000)}`,
      },
    ],
  });

  try {
    const raw = response.choices[0].message.content?.trim() ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as QuizQuestion[];
  } catch {
    return [];
  }
}

export async function generateFlashcards(bookTitle: string, pageText: string): Promise<Flashcard[]> {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `You are a study assistant for "${bookTitle}". Create effective study flashcards.`,
      },
      {
        role: "user",
        content: `Generate 8 study flashcards from this text. Each card should cover a key term, concept, or fact.
Return ONLY valid JSON with no explanation or markdown:
[{"front":"term or question","back":"definition or answer"}]

Text:
${pageText.slice(0, 4000)}`,
      },
    ],
  });

  try {
    const raw = response.choices[0].message.content?.trim() ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as Flashcard[];
  } catch {
    return [];
  }
}

export async function getRecommendations(
  readHistory: { title: string; subject: string | null }[],
  allBooks: { id: string; title: string; subject: string | null; description: string | null }[],
  readBookIds: string[]
): Promise<string[]> {
  const unreadBooks = allBooks.filter((b) => !readBookIds.includes(b.id));
  if (!unreadBooks.length) return [];

  const history = readHistory.map((b) => `"${b.title}" (${b.subject ?? "General"})`).join(", ");
  const catalogue = unreadBooks
    .map((b) => `ID:${b.id} | "${b.title}" | ${b.subject ?? "General"} | ${b.description ?? ""}`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `A student has been reading: ${history || "nothing yet"}.

From these unread books, recommend the 4 most relevant to their interests and academic growth:
${catalogue}

Return ONLY a JSON array of 4 book IDs. Example: ["id1","id2","id3","id4"]
Do not include explanation or markdown.`,
      },
    ],
  });

  try {
    const raw = response.choices[0].message.content?.trim() ?? "[]";
    return JSON.parse(raw) as string[];
  } catch {
    return unreadBooks.slice(0, 4).map((b) => b.id);
  }
}
