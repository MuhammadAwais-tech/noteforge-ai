import { NextResponse } from "next/server";

// This is the system prompt behind NoteForge AI's core feature.
// It is written specifically for this app: it forces the model into a
// strict JSON contract so the UI can render a summary, a glossary, and
// an interactive multiple-choice quiz from a single generation call.
const SYSTEM_PROMPT = `You are NoteForge, a study-kit generator built for university students who need to turn raw, messy lecture notes into exam-ready material quickly.

You will be given:
- a course/topic name
- raw notes (may be unstructured, bullet fragments, copy-pasted slide text, or informal shorthand)

Your job is to produce ONE JSON object, and nothing else — no markdown fences, no commentary before or after — with exactly this shape:

{
  "summary": "string, 4-7 sentences, plain language, covering the core ideas a student must understand",
  "keyTerms": [
    { "term": "string", "definition": "one or two sentence definition in the student's own likely vocabulary level" }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "one sentence explaining why the correct option is correct"
    }
  ]
}

Rules:
- Produce between 5 and 8 keyTerms, ranked by importance to the topic.
- Produce exactly 6 quiz questions. They must test understanding of the notes provided, not trivia outside their scope. Vary difficulty: 2 easy (recall), 3 medium (application), 1 hard (synthesis/edge case).
- Each quiz question must have exactly 4 options, only one correct, with correctIndex being the 0-based index of the right option.
- Do not invent facts that contradict or are unsupported by the provided notes. If the notes are too thin for 6 solid questions, you may generalize slightly using standard textbook knowledge of the stated topic, but stay conservative and never fabricate specific numbers, dates, or attributions.
- Write for a university student studying the stated topic — assume intelligence, not prior expertise.
- Never include markdown formatting, backticks, or explanatory text outside the JSON object. Output must be valid, parseable JSON.`;

export async function POST(request) {
  try {
    const { topic, notes } = await request.json();

    if (!notes || notes.trim().length < 40) {
      return NextResponse.json(
        { error: "Please paste a bit more of your notes (at least a few sentences) so the AI has something real to work with." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY. Set it in your hosting provider's environment variables." },
        { status: 500 }
      );
    }

    const userMessage = `Topic/course: ${topic || "Untitled topic"}\n\nRaw notes:\n${notes}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `AI provider error: ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText = data.content?.map((b) => b.text || "").join("") || "";

    let parsed;
    try {
      const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json(
        { error: "The AI response couldn't be parsed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ studyKit: parsed });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error: " + err.message },
      { status: 500 }
    );
  }
}
