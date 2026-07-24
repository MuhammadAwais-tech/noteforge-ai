"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "noteforge_kits_v1";

function loadKits() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveKits(kits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kits));
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studyKit, setStudyKit] = useState(null);
  const [kits, setKits] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setKits(loadKits());
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setStudyKit(null);
    setAnswers({});
    setSubmitted(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      const kit = {
        id: Date.now().toString(),
        topic: topic || "Untitled topic",
        createdAt: new Date().toISOString(),
        ...data.studyKit,
      };
      setStudyKit(kit);
      const updated = [kit, ...kits].slice(0, 20);
      setKits(updated);
      saveKits(updated);
    } catch (err) {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function openKit(kit) {
    setStudyKit(kit);
    setTopic(kit.topic);
    setAnswers({});
    setSubmitted(false);
    setError("");
  }

  function deleteKit(id) {
    const updated = kits.filter((k) => k.id !== id);
    setKits(updated);
    saveKits(updated);
    if (studyKit?.id === id) setStudyKit(null);
  }

  function selectAnswer(qIdx, optIdx) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  }

  const score =
    studyKit?.quiz && submitted
      ? studyKit.quiz.reduce(
          (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
          0
        )
      : 0;

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#eae6da] bg-paper/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-serif text-lg">
              N
            </div>
            <span className="font-serif text-xl">NoteForge AI</span>
          </div>
          <span className="text-sm text-ink/50 hidden sm:block">
            Messy notes in. Exam-ready study kit out.
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-10 grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar: saved kits */}
        <aside className="order-2 lg:order-1">
          <h2 className="font-serif text-lg mb-3">Your study kits</h2>
          {kits.length === 0 && (
            <p className="text-sm text-ink/50">
              Nothing saved yet. Generate a study kit and it'll show up here — saved in your browser, no account needed.
            </p>
          )}
          <ul className="space-y-2">
            {kits.map((k) => (
              <li
                key={k.id}
                className={`card p-3 cursor-pointer flex items-start justify-between gap-2 hover:border-accent transition-colors ${
                  studyKit?.id === k.id ? "border-accent" : ""
                }`}
                onClick={() => openKit(k)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{k.topic}</p>
                  <p className="text-xs text-ink/40">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteKit(k.id);
                  }}
                  className="text-ink/30 hover:text-accent2 text-xs shrink-0"
                  aria-label="Delete"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main column */}
        <div className="order-1 lg:order-2 space-y-8">
          <section>
            <h1 className="font-serif text-3xl sm:text-4xl mb-2">
              Turn your notes into a study kit
            </h1>
            <p className="text-ink/60 mb-6 max-w-2xl">
              Paste the raw notes for one topic — lecture slides, textbook
              bullets, whatever you've got. NoteForge generates a summary,
              a glossary of key terms, and a 6-question practice quiz you
              can take right here.
            </p>

            <form onSubmit={handleGenerate} className="card p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Topic / course
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Gradient Descent — Machine Learning"
                  className="w-full border border-[#eae6da] rounded-lg px-3 py-2 outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  placeholder="Paste your lecture notes, slide text, or textbook bullets here..."
                  className="w-full border border-[#eae6da] rounded-lg px-3 py-2 outline-none focus:border-accent resize-y scrollbar-thin"
                />
              </div>
              {error && (
                <p className="text-sm text-accent2 bg-accent2/5 border border-accent2/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-ink text-white rounded-lg px-5 py-2.5 font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading ? "Generating study kit..." : "Generate study kit"}
              </button>
            </form>
          </section>

          {studyKit && (
            <section className="space-y-8">
              <div className="card p-6">
                <h2 className="font-serif text-2xl mb-3">Summary</h2>
                <p className="text-ink/80 leading-relaxed">
                  {studyKit.summary}
                </p>
              </div>

              <div className="card p-6">
                <h2 className="font-serif text-2xl mb-4">Key terms</h2>
                <dl className="grid sm:grid-cols-2 gap-4">
                  {studyKit.keyTerms?.map((t, i) => (
                    <div key={i} className="border-l-2 border-accent pl-3">
                      <dt className="font-semibold text-sm">{t.term}</dt>
                      <dd className="text-sm text-ink/60">{t.definition}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-2xl">Practice quiz</h2>
                  {submitted && (
                    <span className="text-sm font-medium bg-accent/10 text-accent px-3 py-1 rounded-full">
                      Score: {score} / {studyKit.quiz?.length}
                    </span>
                  )}
                </div>
                <div className="space-y-6">
                  {studyKit.quiz?.map((q, qi) => (
                    <div key={qi}>
                      <p className="font-medium mb-2">
                        {qi + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const isSelected = answers[qi] === oi;
                          const isCorrect = q.correctIndex === oi;
                          let style =
                            "border-[#eae6da] hover:border-accent/50";
                          if (submitted) {
                            if (isCorrect) style = "border-green-500 bg-green-50";
                            else if (isSelected && !isCorrect)
                              style = "border-accent2 bg-accent2/5";
                          } else if (isSelected) {
                            style = "border-accent bg-accent/5";
                          }
                          return (
                            <button
                              type="button"
                              key={oi}
                              onClick={() => selectAnswer(qi, oi)}
                              className={`w-full text-left border rounded-lg px-3 py-2 text-sm transition-colors ${style}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {submitted && (
                        <p className="text-xs text-ink/50 mt-2 italic">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {!submitted ? (
                  <button
                    onClick={() => setSubmitted(true)}
                    className="mt-6 bg-accent text-white rounded-lg px-5 py-2.5 font-medium hover:opacity-90 transition-opacity"
                  >
                    Submit answers
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                    }}
                    className="mt-6 border border-ink/20 rounded-lg px-5 py-2.5 font-medium hover:border-accent transition-colors"
                  >
                    Retake quiz
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-ink/30 py-8">
        Built by Muhammad Awais — NoteForge AI
      </footer>
    </main>
  );
}
