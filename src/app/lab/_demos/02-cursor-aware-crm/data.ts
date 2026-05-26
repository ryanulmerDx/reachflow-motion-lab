export type DealStage = 'New' | 'Contacted' | 'Proposal' | 'Won';

export interface Deal {
  id: string;
  company: string;
  value: number;
  ownerInitials: string;
  ownerName: string;
  ownerColor: string;
  note: string;
  stage: DealStage;
}

export const STAGES: ReadonlyArray<DealStage> = ['New', 'Contacted', 'Proposal', 'Won'];

export const DEALS: ReadonlyArray<Deal> = [
  {
    id: 'd1',
    company: 'Esthetics by Seneca',
    value: 4800,
    ownerInitials: 'RU',
    ownerName: 'Ryan Ulmer',
    ownerColor: '#67e8f9',
    note: 'Full rebrand + booking system. Signed off on scope.',
    stage: 'Won',
  },
  {
    id: 'd2',
    company: 'Hammerhead Pools',
    value: 12400,
    ownerInitials: 'KM',
    ownerName: 'Kira Morel',
    ownerColor: '#a78bfa',
    note: 'Service portal + CRM sync. Proposal sent Mon.',
    stage: 'Proposal',
  },
  {
    id: 'd3',
    company: 'Roper & Co',
    value: 8900,
    ownerInitials: 'RU',
    ownerName: 'Ryan Ulmer',
    ownerColor: '#67e8f9',
    note: 'E-commerce migration off Squarespace. Discovery call done.',
    stage: 'Contacted',
  },
  {
    id: 'd4',
    company: 'Northbound Coffee',
    value: 6200,
    ownerInitials: 'JT',
    ownerName: 'Jamie Tran',
    ownerColor: '#fb923c',
    note: 'Loyalty app + POS integration. Waitlisted Q3.',
    stage: 'New',
  },
  {
    id: 'd5',
    company: 'Cedar & Sun Studio',
    value: 3400,
    ownerInitials: 'KM',
    ownerName: 'Kira Morel',
    ownerColor: '#a78bfa',
    note: 'Portfolio site with client login. Needs revised scope.',
    stage: 'Contacted',
  },
  {
    id: 'd6',
    company: 'Atlas Hardware',
    value: 18700,
    ownerInitials: 'RU',
    ownerName: 'Ryan Ulmer',
    ownerColor: '#67e8f9',
    note: 'Inventory + B2B quoting tool. Legal reviewing MSA.',
    stage: 'Proposal',
  },
  {
    id: 'd7',
    company: 'Linden Architecture',
    value: 9100,
    ownerInitials: 'JT',
    ownerName: 'Jamie Tran',
    ownerColor: '#fb923c',
    note: 'Project tracking dashboard. New inbound from site.',
    stage: 'New',
  },
  {
    id: 'd8',
    company: 'Meridian Fitness',
    value: 5500,
    ownerInitials: 'KM',
    ownerName: 'Kira Morel',
    ownerColor: '#a78bfa',
    note: 'Member app MVP. Verbal yes, awaiting deposit.',
    stage: 'Won',
  },
  {
    id: 'd9',
    company: 'Sable & Thread',
    value: 7200,
    ownerInitials: 'RU',
    ownerName: 'Ryan Ulmer',
    ownerColor: '#67e8f9',
    note: 'Wholesale ordering system. Cold outreach responded.',
    stage: 'New',
  },
  {
    id: 'd10',
    company: 'Clearpath Transit',
    value: 22000,
    ownerInitials: 'JT',
    ownerName: 'Jamie Tran',
    ownerColor: '#fb923c',
    note: 'Fleet management portal. CFO review this Thursday.',
    stage: 'Proposal',
  },
] as const;

export const KPI_METRICS = [
  {
    label: 'Pipeline value',
    value: '$98,200',
    sub: 'across 10 open deals',
  },
  {
    label: 'Avg deal size',
    value: '$9,820',
    sub: 'up 14% vs last quarter',
  },
  {
    label: 'Win rate',
    value: '34%',
    sub: '2 won · 4 in proposal',
  },
] as const;

/** 8-week closed deal value (thousands) */
export const SPARKLINE_DATA: ReadonlyArray<number> = [
  3.2, 5.8, 4.1, 9.4, 6.7, 12.1, 8.5, 14.3,
] as const;
