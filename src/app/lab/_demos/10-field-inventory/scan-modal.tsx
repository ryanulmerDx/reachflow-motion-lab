'use client';

/**
 * ScanModal — the QR-scan-to-log hero interaction.
 *
 * Mirrors the real field workflow: scan a printed item label, pick pull
 * (consume) or restock (add), set a quantity, confirm. Confirm calls the same
 * adjustQuantity mutation the inline steppers use.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CREW_ROSTER, type Item } from './data';
import { STATUS, statusOf, extractPartNumber } from './status';

type Phase = 'scanning' | 'matched' | 'done';

interface ScanModalProps {
  items: ReadonlyArray<Item>;
  onConfirm: (itemId: string, delta: number, crew: string) => void;
  onClose: () => void;
}

export function ScanModal({ items, onConfirm, onClose }: ScanModalProps) {
  const [phase, setPhase] = useState<Phase>('scanning');
  const [matchId, setMatchId] = useState<string>(() => pickRandom(items).id);
  const [action, setAction] = useState<'pull' | 'add'>('pull');
  const [qty, setQty] = useState(1);

  const crew = useMemo(() => CREW_ROSTER[Math.floor(Math.random() * CREW_ROSTER.length)]!, []);
  const item = items.find((i) => i.id === matchId) ?? items[0]!;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Scan animation → lock onto the matched item
  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = window.setTimeout(() => setPhase('matched'), 1300);
    return () => window.clearTimeout(t);
  }, [phase]);

  function rescan() {
    setMatchId(pickRandom(items).id);
    setQty(1);
    setAction('pull');
    setPhase('scanning');
  }

  function confirm() {
    const delta = action === 'pull' ? -qty : qty;
    onConfirm(item.id, delta, crew);
    setPhase('done');
    window.setTimeout(onClose, 750);
  }

  const status = STATUS[statusOf(item)];
  const part = extractPartNumber(item.name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Scan an inventory item"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-bg)] shadow-2xl shadow-black/60"
      >
        {/* Mock camera viewport */}
        <div className="relative h-44 overflow-hidden border-b border-white/5 bg-black/50">
          {/* corner reticle */}
          <div className="pointer-events-none absolute inset-6 rounded-lg border border-[var(--color-accent)]/30">
            {(['left-0 top-0', 'right-0 top-0', 'left-0 bottom-0', 'right-0 bottom-0'] as const).map(
              (pos) => (
                <span
                  key={pos}
                  className={`absolute h-4 w-4 border-[var(--color-accent)] ${cornerClass(pos)}`}
                />
              )
            )}
          </div>

          {phase === 'scanning' && (
            <motion.div
              className="absolute inset-x-6 h-12 bg-gradient-to-b from-transparent via-[var(--color-accent)]/30 to-transparent"
              initial={{ top: 16 }}
              animate={{ top: ['16px', '120px', '16px'] }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
            />
          )}

          <div className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            {phase === 'scanning' ? 'Scanning label…' : `${crew.includes('@') ? crew : crew} · scanning`}
          </div>
        </div>

        {/* Matched item + controls */}
        <div className="p-5">
          {phase === 'scanning' ? (
            <p className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/30">
              Locating item…
            </p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-medium">{item.name}</p>
                  {part && (
                    <p className="mt-0.5 font-mono text-[11px] text-[var(--color-ink-dim)]">{part}</p>
                  )}
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em]"
                  style={{ color: status.color, background: `${status.color}1a`, border: `1px solid ${status.color}44` }}
                >
                  {status.label}
                </span>
              </div>

              <p className="mt-2 font-mono text-[11px] text-[var(--color-ink-dim)]">
                On hand: <span className="text-[var(--color-ink)]">{item.quantity}</span> · reorder at{' '}
                {item.minThreshold}
              </p>

              {/* Pull / Restock segmented control */}
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-full border border-white/10 p-1">
                {(['pull', 'add'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAction(a)}
                    className={`rounded-full py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                      action === a
                        ? 'bg-[var(--color-accent)] text-black'
                        : 'text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {a === 'pull' ? 'Pull' : 'Restock'}
                  </button>
                ))}
              </div>

              {/* Quantity stepper */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                  Quantity
                </span>
                <div className="flex items-center gap-3">
                  <StepBtn label="decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    −
                  </StepBtn>
                  <span className="w-8 text-center font-mono text-lg tabular-nums">{qty}</span>
                  <StepBtn label="increase quantity" onClick={() => setQty((q) => q + 1)}>
                    +
                  </StepBtn>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={rescan}
                  className="rounded-full border border-white/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-ink)]"
                >
                  Rescan
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={phase === 'done'}
                  className="flex-1 rounded-full bg-[var(--color-accent)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {phase === 'done'
                    ? 'Logged ✓'
                    : `${action === 'pull' ? 'Log pull' : 'Log restock'} · ${action === 'pull' ? '−' : '+'}${qty}`}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StepBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 font-mono text-sm text-[var(--color-ink)] transition-colors hover:border-white/30 hover:bg-white/[0.04]"
    >
      {children}
    </button>
  );
}

function cornerClass(pos: string): string {
  if (pos.includes('left-0 top-0')) return 'left-0 top-0 border-l-2 border-t-2 rounded-tl';
  if (pos.includes('right-0 top-0')) return 'right-0 top-0 border-r-2 border-t-2 rounded-tr';
  if (pos.includes('left-0 bottom-0')) return 'left-0 bottom-0 border-l-2 border-b-2 rounded-bl';
  return 'right-0 bottom-0 border-r-2 border-b-2 rounded-br';
}

function pickRandom(items: ReadonlyArray<Item>): Item {
  return items[Math.floor(Math.random() * items.length)]!;
}
