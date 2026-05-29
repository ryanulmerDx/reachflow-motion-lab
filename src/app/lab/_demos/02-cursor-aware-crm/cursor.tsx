'use client';

import { useEffect, useRef, useState } from 'react';

/** Shape variants driven by data-cursor attribute values */
type CursorShape =
  | { kind: 'default' }
  | { kind: 'drag' }
  | { kind: 'inspect' }
  | { kind: 'open' }
  | { kind: 'avatar'; name: string };

function parseCursorAttr(attr: string | null | undefined): CursorShape {
  if (!attr) return { kind: 'default' };
  if (attr === 'drag') return { kind: 'drag' };
  if (attr === 'inspect') return { kind: 'inspect' };
  if (attr === 'open') return { kind: 'open' };
  if (attr.startsWith('avatar:')) return { kind: 'avatar', name: attr.slice(7) };
  return { kind: 'default' };
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -120, y: -120 });
  const targetRef = useRef({ x: -120, y: -120 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const visibleRef = useRef(false);
  const [shape, setShape] = useState<CursorShape>({ kind: 'default' });
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide on touch devices — (pointer: coarse) check
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = cursorRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      targetRef.current = { x: e.clientX, y: e.clientY };

      // Traverse up from target to find the nearest data-cursor attribute
      let node = e.target as Element | null;
      let found: string | null = null;
      while (node && node !== document.body) {
        const val = (node as HTMLElement).dataset?.cursor;
        if (val !== undefined) {
          found = val;
          break;
        }
        node = node.parentElement;
      }
      setShape(parseCursorAttr(found));
    };

    const onDown = () => {
      isDownRef.current = true;
      setPressed(true);
    };

    const onUp = () => {
      isDownRef.current = false;
      setPressed(false);
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const onEnter = () => {
      visibleRef.current = true;
      setVisible(true);
    };

    const LERP = 0.18;

    const tick = () => {
      const pos = posRef.current;
      const tgt = targetRef.current;
      posRef.current = {
        x: pos.x + (tgt.x - pos.x) * LERP,
        y: pos.y + (tgt.y - pos.y) * LERP,
      };

      if (el) {
        el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // On touch — render nothing
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const { label, icon, pillWidth, isDefaultDot } = resolveCursorAppearance(shape, pressed);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}
    >
      {isDefaultDot ? (
        <span
          className="block rounded-full bg-[var(--color-accent)]"
          style={{
            width: pressed ? 10 : 8,
            height: pressed ? 10 : 8,
            transition: 'width 0.15s ease, height 0.15s ease',
          }}
        />
      ) : (
        <span
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-accent)] bg-[var(--color-bg)]/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent)] backdrop-blur-sm"
          style={{
            minWidth: pillWidth,
            transition: 'min-width 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s',
            transform: pressed ? 'scale(0.92)' : 'scale(1)',
          }}
        >
          <span style={{ fontSize: 11, lineHeight: 1 }}>{icon}</span>
          {label}
        </span>
      )}
    </div>
  );
}

function resolveCursorAppearance(
  shape: CursorShape,
  pressed: boolean
): {
  label: string;
  icon: string;
  pillWidth: number;
  isDefaultDot: boolean;
} {
  switch (shape.kind) {
    case 'drag':
      return { label: 'Drag', icon: '⠿', pillWidth: 88, isDefaultDot: false };
    case 'inspect':
      return { label: 'Inspect', icon: '◎', pillWidth: 104, isDefaultDot: false };
    case 'open':
      return {
        label: pressed ? 'Opening' : 'Open',
        icon: '→',
        pillWidth: 88,
        isDefaultDot: false,
      };
    case 'avatar': {
      const firstName = shape.name.split(' ')[0] ?? shape.name;
      return {
        label: firstName,
        icon: '◉',
        pillWidth: Math.max(88, firstName.length * 8 + 56),
        isDefaultDot: false,
      };
    }
    default:
      return { label: '', icon: '', pillWidth: 0, isDefaultDot: true };
  }
}
