'use client';

/**
 * Demo 09 — Voice Receptionist (Live Call)
 *
 * A Retell/Vapi-style AI phone agent answering a live call. An audio-reactive
 * GLSL waveform swells while a speaker talks; the transcript streams in
 * token-by-token; the agent extracts intents in real time and lands a booking.
 *
 * Architecture:
 *   - A setTimeout-driven state machine walks the scripted call (data.ts),
 *     looping forever so the demo always shows activity.
 *   - Amplitude lives in a ref, animated by a separate rAF loop with a noisy
 *     speech envelope, and read by the waveform shader inside useFrame.
 *   - The active speaker's color lives in a THREE.Color ref the waveform lerps
 *     toward — no React re-render drives the canvas.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Color } from 'three';
import { DemoView } from '@/components/demo-view';
import { findDemo } from '@/lib/demo-registry';
import { VoiceWaveform } from './waveform';
import {
  AGENT_COLOR,
  AGENT_NAME,
  CALLER,
  CALLER_COLOR,
  INTENT_REVEAL,
  INTENTS,
  OUTCOME,
  TURNS,
  type Speaker,
} from './data';

const demo = findDemo('voice-receptionist')!;

type CallStatus = 'ringing' | 'connected' | 'in-call' | 'wrap';

interface Message {
  id: number;
  speaker: Speaker;
  text: string;
}

const STATUS_LABEL: Record<CallStatus, string> = {
  ringing: 'Incoming call…',
  connected: 'Connected',
  'in-call': 'On call',
  wrap: 'Call complete',
};

// ─── Root ───────────────────────────────────────────────────────────────────

export default function VoiceReceptionist() {
  const [messages, setMessages] = useState<ReadonlyArray<Message>>([]);
  const [status, setStatus] = useState<CallStatus>('ringing');
  const [intentCount, setIntentCount] = useState(0);
  const [outcome, setOutcome] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Hot-path refs read by the waveform's useFrame
  const ampRef = useRef(0);
  const speakingRef = useRef(false);
  const colorRef = useRef(new Color(AGENT_COLOR));

  const transcriptRef = useRef<HTMLDivElement>(null);

  // ── Amplitude envelope (rAF) ──────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const loop = () => {
      t += 0.08;
      let target = 0.05;
      if (speakingRef.current) {
        // Noisy speech-like envelope so the wave never looks like a clean tone
        target =
          0.55 +
          Math.sin(t * 5.0) * 0.2 +
          Math.sin(t * 11.3) * 0.12 +
          Math.random() * 0.15;
        target = Math.min(1, Math.max(0.3, target));
      }
      ampRef.current += (target - ampRef.current) * 0.25;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Call timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'in-call' && status !== 'wrap') {
      setSeconds(0);
      return;
    }
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  // ── Call state machine ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timers.push(window.setTimeout(res, ms));
      });

    async function typeTurn(turn: (typeof TURNS)[number], id: number) {
      colorRef.current.set(turn.speaker === 'agent' ? AGENT_COLOR : CALLER_COLOR);
      speakingRef.current = true;
      setMessages((m) => [...m, { id, speaker: turn.speaker, text: '' }]);
      for (let i = 0; i < turn.text.length; i++) {
        if (cancelled) return;
        await wait(16 + Math.random() * 22);
        const next = turn.text.slice(0, i + 1);
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: next } : msg)));
      }
      speakingRef.current = false;
    }

    async function run() {
      while (!cancelled) {
        setMessages([]);
        setIntentCount(0);
        setOutcome(false);

        setStatus('ringing');
        await wait(1500);
        if (cancelled) return;

        setStatus('connected');
        await wait(650);
        if (cancelled) return;

        setStatus('in-call');
        for (let i = 0; i < TURNS.length; i++) {
          if (cancelled) return;
          await typeTurn(TURNS[i]!, i);
          const reveal = INTENT_REVEAL[i];
          if (reveal != null) setIntentCount(reveal);
          await wait(440); // silence gap between turns
        }
        if (cancelled) return;

        setStatus('wrap');
        setOutcome(true);
        await wait(4600); // hold the outcome before looping
      }
    }

    run();

    return () => {
      cancelled = true;
      speakingRef.current = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // ── Auto-scroll transcript to the newest line ─────────────────────────────
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const live = status === 'in-call' || status === 'connected';

  return (
    <main className="relative min-h-dvh px-6 pb-32 pt-28 md:px-12">
      <header className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          {demo.ordinal} · {demo.system}
        </p>
        <h1 className="mt-3 text-balance text-4xl font-medium leading-[1.05] md:text-6xl">
          {demo.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-ink-dim)] md:text-lg">{demo.tagline}</p>
      </header>

      <section className="mx-auto mt-12 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* ── Call console ──────────────────────────────────────────────── */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.015]">
            {/* Status bar */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <StatusDot status={status} />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink)]">
                  {STATUS_LABEL[status]}
                </span>
              </div>
              <span className="font-mono text-[11px] tabular-nums text-[var(--color-ink-dim)]">
                {formatClock(seconds)}
              </span>
            </div>

            {/* Waveform band */}
            <div className="relative h-[150px] w-full overflow-hidden border-b border-white/5 bg-black/30">
              <DemoView className="absolute inset-0 h-full w-full">
                <VoiceWaveform ampRef={ampRef} colorRef={colorRef} />
              </DemoView>
              <div className="pointer-events-none absolute left-5 top-4 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: AGENT_COLOR }}
                  aria-hidden
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                  {AGENT_NAME} · AI receptionist
                </span>
              </div>
            </div>

            {/* Transcript */}
            <div
              ref={transcriptRef}
              className="flex h-[320px] flex-col gap-3 overflow-y-auto px-5 py-5 [scrollbar-width:thin]"
              aria-live="polite"
              aria-label="Live call transcript"
            >
              {messages.length === 0 ? (
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/25">
                  Waiting for the call to connect…
                </p>
              ) : (
                messages.map((m) => <TranscriptLine key={m.id} message={m} />)
              )}
            </div>
          </div>

          {/* ── Live panel ────────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-4">
            {/* Caller card */}
            <div className="rounded-2xl border border-white/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                Caller
              </p>
              <p className="mt-2 text-lg font-medium">{CALLER.name}</p>
              <p className="font-mono text-[12px] text-[var(--color-ink-dim)]">{CALLER.phone}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]/70">
                {CALLER.reason}
              </p>
            </div>

            {/* Detected intents */}
            <div className="rounded-2xl border border-white/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                Detected intent
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {intentCount === 0 ? (
                  <span className="font-mono text-[11px] text-white/25">Listening…</span>
                ) : (
                  INTENTS.slice(0, intentCount).map((intent) => (
                    <span
                      key={intent}
                      className="rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent)]"
                    >
                      {intent}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Outcome */}
            <div
              className={`rounded-2xl border p-5 transition-all duration-500 ${
                outcome
                  ? 'border-emerald-400/40 bg-emerald-400/[0.06]'
                  : 'border-white/5 bg-white/[0.01]'
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                Outcome
              </p>
              {outcome ? (
                <div className="mt-2">
                  <p className="flex items-center gap-2 text-base font-medium text-emerald-300">
                    <span aria-hidden>✓</span> {OUTCOME.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-ink)]">{OUTCOME.detail}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
                    {OUTCOME.meta}
                  </p>
                </div>
              ) : (
                <p className="mt-2 font-mono text-[11px] text-white/25">
                  {live ? 'Resolving the call…' : 'Pending'}
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      <footer className="mx-auto mt-24 max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Demo 09 · Audio-reactive GLSL waveform + streaming transcript state machine.{' '}
          <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
            ← Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}

// ─── Pieces ───────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: CallStatus }) {
  const color =
    status === 'wrap' ? '#34d399' : status === 'ringing' ? '#fde68a' : 'var(--color-accent)';
  return (
    <span className="relative flex h-2 w-2">
      {status !== 'wrap' && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function TranscriptLine({ message }: { message: Message }) {
  const isAgent = message.speaker === 'agent';
  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[82%] ${isAgent ? '' : 'text-right'}`}>
        <p
          className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em]"
          style={{ color: isAgent ? AGENT_COLOR : CALLER_COLOR }}
        >
          {isAgent ? AGENT_NAME : CALLER.name.split(' ')[0]}
        </p>
        <p
          className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAgent
              ? 'rounded-tl-sm bg-white/[0.05] text-[var(--color-ink)]'
              : 'rounded-tr-sm bg-[var(--color-accent)]/10 text-[var(--color-ink)]'
          }`}
        >
          {message.text}
          <span className="ml-0.5 inline-block w-1 animate-pulse text-[var(--color-ink-dim)]">
            {message.text.length > 0 ? '' : '▍'}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── utils ──────────────────────────────────────────────────────────────────

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
