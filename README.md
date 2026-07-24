# NoteForge AI

**Turn messy lecture notes into an exam-ready study kit — a summary, a glossary, and a self-test quiz — in one click.**

## a. What it does, and the problem it solves

As a BS Artificial Intelligence student, I sit through several courses a semester, each producing slides, scattered bullet points, and half-formed notes that pile up fast. When exams get close, the real work isn't learning the material for the first time — it's *re-organizing* days of messy notes into something you can actually revise from: a summary, the vocabulary you're expected to know, and something to test yourself with. That reorganizing step eats hours that should go to actually studying.

**NoteForge AI** solves this directly: paste the raw notes for one topic, and it instantly generates:
1. A clear, plain-language **summary** of the core ideas.
2. A **glossary of key terms** with definitions pitched at student level.
3. A **6-question practice quiz** (multiple choice, mixed difficulty) that you can take right in the browser, with instant scoring and explanations.

It's built for university students — originally for myself and classmates at PAFIAST — but it works for any topic, any course, any subject.

## b. Live URL

🔗 **[Add your deployed Vercel URL here after deploying]**

## c. Features

- Paste any topic + raw notes (slide text, bullet fragments, textbook excerpts) and generate a full study kit in seconds
- AI-generated **summary**, **glossary of key terms**, and a **6-question interactive quiz**
- Take the quiz directly in the app — select answers, submit, get an instant score and a one-line explanation per question
- Retake any quiz as many times as you want
- **Study kits are saved automatically** in your browser (no account, no login, no database) — revisit past topics from the sidebar any time
- Delete old study kits you no longer need
- Clean, distraction-free, responsive UI that works on mobile and desktop
- Graceful error handling — if notes are too short or the AI call fails, you get a clear, actionable message instead of a silent break

## d. The AI feature

**What it does:** A single AI call turns unstructured notes into a strict, structured JSON object — `{ summary, keyTerms[], quiz[] }` — which the UI renders directly into the summary card, glossary grid, and interactive quiz component. The prompt was written specifically for this app, not copied from a generic "summarize this" template: it enforces exact counts (5–8 key terms, exactly 6 quiz questions), a fixed difficulty mix (2 easy / 3 medium / 1 hard), a strict 4-option-single-answer quiz format, and an explicit instruction not to fabricate facts beyond what's in the notes (falling back conservatively to standard textbook knowledge only when the notes are too thin).

**Model used:** `gemini-2.5-flash` via the Google Gemini API — chosen because it has a genuinely free tier (no credit card, no expiry) that comfortably covers this app's usage, and it's fast enough for a short, well-defined structured-output task like this.

**The exact system prompt** (see `app/api/generate/route.js`):

```
You are NoteForge, a study-kit generator built for university students who need to turn raw, messy lecture notes into exam-ready material quickly.

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
- Never include markdown formatting, backticks, or explanatory text outside the JSON object. Output must be valid, parseable JSON.
```

## e. Tools, services, and models used

- **Framework:** Next.js 14 (App Router), React 18
- **Styling:** Tailwind CSS
- **AI model/provider:** Google Gemini API — `gemini-2.5-flash` (free tier)
- **Storage:** Browser `localStorage` (no external database — kept the app simple and dependency-free for reliability)
- **Hosting/deployment:** Vercel
- **Version control:** Git + GitHub

## f. Screenshots

> Add at least 3 screenshots here after you deploy — e.g. the empty state, a generated study kit (summary + glossary), and the quiz with a submitted score.

![Home / empty state](./screenshots/1-home.png)
![Generated study kit](./screenshots/2-studykit.png)
![Quiz with score](./screenshots/3-quiz.png)

## g. How to run the project

### Run locally

```bash
git clone https://github.com/<your-username>/noteforge-ai.git
cd noteforge-ai
npm install
cp .env.example .env.local
# then edit .env.local and paste your free Gemini API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

1. Push this repo to your own **public** GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign in, and click **Add New → Project**.
3. Import your GitHub repo.
4. In **Environment Variables**, add:
   - `GEMINI_API_KEY` = your free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (no credit card needed)
5. Click **Deploy**. Vercel will build and give you a public URL — paste it into section (b) above.

No database, no auth setup, no extra config needed — this is intentionally a zero-infrastructure app.

---

Built by **Muhammad Awais**, BS Artificial Intelligence, Pak-Austria Fachhochschule (PAFIAST).
