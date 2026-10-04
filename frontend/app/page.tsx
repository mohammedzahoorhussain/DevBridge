"use client";

import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const USER_NAME = "ZAHOORDEV";

type Msg = {
  id: string;
  question: string;
  answer: string;
  memoriesUsed: string[];
  memoryOn: boolean;
  isError: boolean;
};

const PRESETS = [
  { label: "[ retryCount: 0 vs backoff ]", q: "Why retryCount: 0 instead of exponential backoff?" },
  { label: "[ TTL 4500ms rationale ]", q: "Why is the TTL 4500 and not 10000?" },
  { label: "[ Redis cluster partitioned ]", q: "What if Redis is unreachable?" },
];

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const SANS = "'Space Grotesk', system-ui, sans-serif";

export default function Home() {
  const [useMemory, setUseMemory] = useState(true);
  const [code, setCode] = useState(
    "await redisLock.acquire(lockKey, { ttl: 4500, retryCount: 0 });"
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTeach, setShowTeach] = useState(false);
  const [teachContent, setTeachContent] = useState("");
  const [teachNote, setTeachNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [teachLoading, setTeachLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleAsk(questionText?: string) {
    const query = (questionText ?? inputQuery).trim();
    if (!query || isLoading) return;
    setInputQuery("");
    setIsLoading(true);

    const add = (answer: string, mems: string[], memoryOn: boolean, isError: boolean) =>
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), question: query, answer, memoriesUsed: mems, memoryOn, isError },
      ]);

    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, code, use_memory: useMemory }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const detail = err?.detail;
        add(
          detail ? (typeof detail === "string" ? detail : JSON.stringify(detail)) : `Backend returned ${res.status}`,
          [], useMemory, true
        );
      } else {
        const data = await res.json();
        add(data.answer || "No response generated.", data.memories_used || [], data.memory_on ?? useMemory, false);
      }
    } catch {
      add("CRITICAL: Backend offline. Start it with: uvicorn main:app --reload", [], useMemory, true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTeach(e: React.FormEvent) {
    e.preventDefault();
    if (!teachContent.trim() || teachLoading) return;
    setTeachLoading(true);
    try {
      const res = await fetch(`${API}/remember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: teachContent.trim() }),
      });
      if (!res.ok) throw new Error();
      setTeachContent("");
      setTeachNote({ ok: true, text: "MEMORY COMMITTED TO TEAM KNOWLEDGE STORE." });
    } catch {
      setTeachNote({ ok: false, text: "COMMIT FAILED. IS THE BACKEND RUNNING?" });
    } finally {
      setTeachLoading(false);
      setTimeout(() => setTeachNote(null), 3000);
    }
  }

  return (
    <div
      className="min-h-screen text-[#E2E8F0] selection:bg-[#00FF66]/30 selection:text-[#00FF66]"
      style={{
        fontFamily: MONO,
        backgroundColor: "#070908",
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.05) 0%, transparent 60%), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 32px 32px, 32px 32px",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      />
      <style>{`
        details summary::-webkit-details-marker{display:none}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#0A0E0C}
        ::-webkit-scrollbar-thumb{background:#1B382B;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#00FF66}
      `}</style>

      <div className="mx-auto flex min-h-screen max-w-[840px] flex-col justify-between px-4 py-6 sm:px-6">
        <div className="flex-1 pb-52">
          {/* Header */}
          <header className="relative border-b border-[#162B20] pb-5 pt-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-sm bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
                    <h1
                      className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
                      style={{ fontFamily: SANS }}
                    >
                      DevBridge
                      <span className="text-lg font-normal text-[#00FF66]" style={{ fontFamily: MONO }}>.sh</span>
                    </h1>
                  </div>
                  <span className="rounded border border-[#00FF66]/40 bg-[#00FF66]/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#00FF66]">
                    [{USER_NAME}] // V2.4-PROD
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-2 text-xs text-[#A0AEC0] sm:text-[13px]">
                  <span className="text-[#00FF66]">/dev/senior</span>
                  <span className="text-[#3A4D43]">•</span>
                  <span>The senior engineer who is always available.</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setUseMemory(!useMemory)}
                aria-pressed={useMemory}
                className={`inline-flex items-center gap-2.5 rounded border px-3 py-1.5 text-xs transition-all ${
                  useMemory
                    ? "border-[#00FF66]/50 bg-[#0A1A12] text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.15)]"
                    : "border-[#1C2A22] bg-[#0E1411] text-[#64748B]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-all ${
                    useMemory ? "bg-[#00FF66] shadow-[0_0_8px_#00FF66]" : "bg-[#334155]"
                  }`}
                />
                <span className="tracking-wide">
                  TEAM MEMORY: <span className="font-bold">{useMemory ? "ONLINE" : "BYPASSED"}</span>
                </span>
              </button>
            </div>
          </header>

          {/* Code buffer */}
          <section className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="code-context" className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#00FF66]">
                <span className="text-[#3A4D43]">// 01</span>
                <span>CODE_BUFFER :: ACTIVE_INSPECT</span>
              </label>
              <span className="text-[10px] text-[#526D5F]">UTF-8 • JAVASCRIPT</span>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#1B382B] bg-[#0A0E0C] shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_15px_-3px_rgba(0,255,102,0.2)]">
              <div className="flex select-none items-center justify-between border-b border-[#16281E] bg-[#0E1512] px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#E0443E] bg-[#FF5F56]/80" />
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#DEA123] bg-[#FFBD2E]/80" />
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#1AAB29] bg-[#27C93F]/80" />
                  <span className="ml-2 text-[11px] text-[#718096]">worker_lock.ts</span>
                </div>
                <div className="flex items-center gap-1.5 rounded border border-[#00FF66]/20 bg-[#00FF66]/5 px-2 py-0.5 text-[10px] text-[#00FF66]/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00FF66]" />
                  READ-WRITE BUFFER
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="code-context"
                  rows={3}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="block w-full resize-none border-none bg-[#080C0A] p-4 text-xs leading-relaxed text-[#00FF66] caret-[#00FF66] selection:bg-[#00FF66]/20 focus:outline-none sm:text-[13px]"
                />
                <div className="pointer-events-none absolute bottom-2.5 right-3 select-none text-[10px] text-[#3A4D43]">
                  L:1 C:{code.length}
                </div>
              </div>
            </div>
          </section>

          {/* Feed */}
          <section className="mt-8 space-y-6" aria-label="Conversation">
            <div className="flex items-center gap-2 border-b border-[#14231A] pb-2 text-[10px] uppercase tracking-widest text-[#3A4D43]">
              <span>// 02 EXECUTION_FEED</span>
              <span className="text-[#1F3327]">---------------------------------------------</span>
              <span className="text-[#00FF66]/70">LIVE</span>
            </div>

            {messages.length === 0 && (
              <div className="rounded border border-dashed border-[#1B382B] bg-[#0A0E0C]/40 py-14 text-center">
                <p className="text-xs text-[#718096] sm:text-sm">
                  &gt; Ask the senior dev why this code is written this way.
                </p>
              </div>
            )}

            {messages.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg border border-[#162B20] bg-[#0A0E0C] p-4 transition-all hover:border-[#1F3E2F] sm:p-5"
              >
                <div className="mb-3.5 flex items-start gap-2.5 border-b border-[#132219] pb-3">
                  <span className="select-none rounded border border-[#00FF66]/30 bg-[#00FF66]/10 px-1.5 py-0.5 text-xs font-bold text-[#00FF66]">
                    PROMPT ❯
                  </span>
                  <p className="text-sm font-semibold leading-snug tracking-wide text-white sm:text-[15px]">
                    {item.question}
                  </p>
                </div>

                <div className="pl-1 sm:pl-2">
                  <div className="mb-2 flex items-center gap-2 text-[11px] text-[#526D5F]">
                    <span className="text-[#00FF66]">SENIOR_RESPONSE ::</span>
                    <span>ANALYSIS_MATRIX</span>
                  </div>
                  <p
                    className={`whitespace-pre-wrap text-[13px] leading-relaxed sm:text-[14px] ${
                      item.isError ? "text-[#FF6B6B]" : "text-[#D1FAE5]/90"
                    }`}
                  >
                    {item.answer}
                  </p>

                  {!item.isError && (
                    <details className="group mt-4 border-t border-[#132219] pt-3">
                      <summary className="inline-flex cursor-pointer select-none items-center gap-2 text-xs text-[#00FF66] transition-colors hover:text-[#34D399]">
                        <span className="inline-block text-[10px] transition-transform duration-150 group-open:rotate-90">▶</span>
                        {item.memoryOn ? (
                          <span className="flex items-center gap-2">
                            <span>SYNAPSE:</span>
                            <span className="underline decoration-[#00FF66]/40 underline-offset-4">
                              {item.memoriesUsed.length > 0
                                ? `Queried ${item.memoriesUsed.length} Team Knowledge Nodes`
                                : "No matching team memories found"}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[#64748B]">[RAW_MODEL] General reasoning only. Team memory offline.</span>
                        )}
                      </summary>

                      {item.memoryOn && item.memoriesUsed.length > 0 && (
                        <div className="mt-3 space-y-2 border-l-2 border-[#00FF66]/60 pl-3 sm:pl-4">
                          {item.memoriesUsed.map((mem, idx) => (
                            <div key={idx} className="rounded border border-[#162A20] bg-[#0D1512] p-2 text-xs">
                              <div className="mb-0.5 text-[10px] text-[#00FF66]">[MEM://node-{String(idx + 1).padStart(2, "0")}]</div>
                              <div className="leading-relaxed text-[#A0AEC0]">{mem}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 rounded-lg border border-[#00FF66]/30 bg-[#0A0E0C] p-4 text-[#00FF66]">
                <span className="inline-block h-2.5 w-2.5 animate-ping rounded-full bg-[#00FF66]" />
                <p className="text-xs tracking-wide sm:text-sm">
                  {useMemory ? "SEARCHING TEAM MEMORIES..." : "SYNTHESIZING SENIOR LOGIC..."}
                </p>
              </div>
            )}
            <div ref={endRef} />
          </section>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#182C22] bg-[#080B09]/95 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div className="mx-auto max-w-[840px] space-y-3 px-4 py-3.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2">
              <span className="mr-1 text-[10px] uppercase tracking-wider text-[#526D5F]">PRESETS:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.q}
                  type="button"
                  onClick={() => handleAsk(p.q)}
                  disabled={isLoading}
                  className="rounded border border-[#183124] bg-[#0D1411] px-2.5 py-1 text-left text-[11px] text-[#86EFAC] transition-all hover:border-[#00FF66]/60 hover:bg-[#14231D] hover:text-[#00FF66] disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex flex-1 items-center rounded-md border border-[#1B3628] bg-[#070A09] transition-all focus-within:border-[#00FF66] focus-within:shadow-[0_0_12px_rgba(0,255,102,0.25)]">
                <span className="select-none pl-3 pr-1 text-sm font-bold text-[#00FF66]">&gt;</span>
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                  placeholder="Why this, and not that?"
                  disabled={isLoading}
                  className="w-full bg-transparent px-2 py-2.5 text-xs text-[#00FF66] placeholder-[#4B6356] focus:outline-none sm:text-sm"
                />
                {inputQuery && (
                  <span className="hidden pr-3 text-[10px] text-[#526D5F] sm:inline">[PRESS ENTER]</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={isLoading || !inputQuery.trim()}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#00FF66] px-4 py-2.5 text-xs font-bold uppercase text-[#06140D] shadow-[0_0_16px_rgba(0,255,102,0.35)] transition-all hover:bg-[#34D399] hover:shadow-[0_0_22px_rgba(0,255,102,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
              >
                <span>RUN / ASK</span>
                <span className="text-[10px]">↵</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              {!showTeach ? (
                <button
                  type="button"
                  onClick={() => setShowTeach(true)}
                  className="group flex items-center gap-1.5 text-[11px] text-[#00FF66] transition-colors hover:text-[#5EEAD4]"
                >
                  <span className="text-[#3A4D43] group-hover:text-[#00FF66]">[+]</span>
                  <span className="underline decoration-[#00FF66]/30 underline-offset-4">
                    RECORD NEW TEAM KNOWLEDGE // TEACH SYSTEM
                  </span>
                </button>
              ) : (
                <form onSubmit={handleTeach} className="w-full space-y-2 border-t border-[#162A20] pt-2">
                  <div className="flex items-center justify-between text-xs text-[#86EFAC]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#00FF66]" />
                      COMMIT TO TEAM KNOWLEDGE STORE:
                    </span>
                    <button type="button" onClick={() => setShowTeach(false)} className="text-[11px] text-[#64748B] hover:text-[#E2E8F0]">
                      [ESC / CLOSE]
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={teachContent}
                      onChange={(e) => setTeachContent(e.target.value)}
                      placeholder="e.g. In checkout, locks use ttl 4500 to accommodate Stripe webhooks."
                      className="flex-1 rounded border border-[#1C3628] bg-[#060A08] px-3 py-1.5 text-xs text-[#00FF66] placeholder-[#3C5346] focus:border-[#00FF66] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={teachLoading || !teachContent.trim()}
                      className="whitespace-nowrap rounded border border-[#00FF66]/50 bg-[#12281D] px-3.5 py-1.5 text-xs text-[#00FF66] transition-colors hover:bg-[#1A3828] disabled:opacity-40"
                    >
                      {teachLoading ? "COMMITTING..." : "COMMIT MEMORY"}
                    </button>
                  </div>
                  {teachNote && (
                    <p className={`flex items-center gap-1 text-[11px] ${teachNote.ok ? "text-[#00FF66]" : "text-[#FF6B6B]"}`}>
                      <span>{teachNote.ok ? "✓" : "✗"}</span> {teachNote.text}
                    </p>
                  )}
                </form>
              )}
              <div className="hidden text-[10px] text-[#3A4D43] sm:block">NODE: SYNCED</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}