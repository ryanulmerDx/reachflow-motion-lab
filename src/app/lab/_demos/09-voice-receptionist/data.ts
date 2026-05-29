/**
 * Scripted call for demo 09 — Voice Receptionist.
 *
 * Mock data, wired UI: the transcript, intents, and outcome are fabricated,
 * but the streaming state machine, waveform, and timing are real. Models a
 * Retell/Vapi-style AI receptionist booking a first-time client for a salon.
 */

export const AGENT_COLOR = '#67e8f9'; // accent cyan — the AI agent speaking
export const CALLER_COLOR = '#c084fc'; // violet — the human caller speaking

export const AGENT_NAME = 'Ava';

export const CALLER = {
  name: 'Jordan Reyes',
  phone: '+1 (520) 555-0143',
  reason: 'Inbound · first-time caller',
} as const;

export type Speaker = 'agent' | 'caller';

export interface Turn {
  speaker: Speaker;
  text: string;
}

export const TURNS: ReadonlyArray<Turn> = [
  { speaker: 'agent', text: 'Thanks for calling Esthetics by Seneca, this is Ava. How can I help?' },
  { speaker: 'caller', text: "Hi — I'd like to book a facial sometime next week." },
  { speaker: 'agent', text: 'Happy to help. Have you visited us before, or is this your first time?' },
  { speaker: 'caller', text: 'First time, actually.' },
  { speaker: 'agent', text: 'Welcome! Our Signature Facial is the favorite for a first visit. Does Tuesday afternoon work?' },
  { speaker: 'caller', text: 'Tuesday at 2:30 would be perfect.' },
  { speaker: 'agent', text: "Booked — Tuesday 2:30 for a Signature Facial. I'll text a confirmation and a quick new-client form." },
  { speaker: 'caller', text: 'Amazing, thank you so much!' },
  { speaker: 'agent', text: "You're all set, Jordan. See you Tuesday." },
];

/** Progressive intent chips the agent extracts as the call unfolds. */
export const INTENTS: ReadonlyArray<string> = [
  'Booking request',
  'First-time client',
  'Signature Facial',
  'Tue · 2:30 PM',
];

/** After turn index `key`, reveal the first `value` intent chips. */
export const INTENT_REVEAL: Record<number, number> = {
  1: 1, // caller asks to book
  3: 2, // confirms first-time
  4: 3, // agent proposes Signature Facial
  5: 4, // caller locks the time
};

export const OUTCOME = {
  title: 'Appointment booked',
  detail: 'Tue, 2:30 PM · Signature Facial',
  meta: 'SMS confirmation + new-client form sent · synced to calendar',
} as const;
