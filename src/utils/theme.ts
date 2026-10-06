import { NoteColor } from '../types/note';

export interface NoteColorTheme {
  id: NoteColor;
  name: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  cardBg: string;
  darkCardBg: string;
  dotColor: string;
}

export const NOTE_COLORS: Record<NoteColor, NoteColorTheme> = {
  default: {
    id: 'default',
    name: 'Tech Base',
    bgClass: 'bg-white dark:bg-slate-900/90',
    borderClass: 'border-slate-200 dark:border-blue-950/80 hover:border-blue-500/50',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    cardBg: '#FFFFFF',
    darkCardBg: '#0F172A',
    dotColor: '#3B82F6',
  },
  blue: {
    id: 'blue',
    name: 'Cobalto Tech',
    bgClass: 'bg-blue-50/90 dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-800/60',
    badgeClass: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200',
    cardBg: '#EFF6FF',
    darkCardBg: '#172554',
    dotColor: '#2563EB',
  },
  sky: {
    id: 'sky',
    name: 'Cian Cuántico',
    bgClass: 'bg-sky-50/90 dark:bg-sky-950/40',
    borderClass: 'border-sky-200 dark:border-sky-800/60',
    badgeClass: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200',
    cardBg: '#F0F9FF',
    darkCardBg: '#082F49',
    dotColor: '#0EA5E9',
  },
  teal: {
    id: 'teal',
    name: 'Aqua Eléctrico',
    bgClass: 'bg-teal-50/90 dark:bg-teal-950/40',
    borderClass: 'border-teal-200 dark:border-teal-800/60',
    badgeClass: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200',
    cardBg: '#F0FDFA',
    darkCardBg: '#042F2E',
    dotColor: '#14B8A6',
  },
  indigo: {
    id: 'indigo',
    name: 'Zafiro Cyber',
    bgClass: 'bg-indigo-50/90 dark:bg-indigo-950/50',
    borderClass: 'border-indigo-200 dark:border-indigo-800/60',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-200',
    cardBg: '#EEF2FF',
    darkCardBg: '#1E1B4B',
    dotColor: '#6366F1',
  },
  violet: {
    id: 'violet',
    name: 'Neón Violeta',
    bgClass: 'bg-violet-50/90 dark:bg-violet-950/40',
    borderClass: 'border-violet-200 dark:border-violet-800/60',
    badgeClass: 'bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200',
    cardBg: '#F5F3FF',
    darkCardBg: '#2E1065',
    dotColor: '#8B5CF6',
  },
  emerald: {
    id: 'emerald',
    name: 'Matrix Verde',
    bgClass: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200',
    cardBg: '#ECFDF5',
    darkCardBg: '#022C22',
    dotColor: '#10B981',
  },
  amber: {
    id: 'amber',
    name: 'Láser Ámbar',
    bgClass: 'bg-amber-50/90 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    badgeClass: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
    cardBg: '#FFFBEB',
    darkCardBg: '#451A03',
    dotColor: '#F59E0B',
  },
  coral: {
    id: 'coral',
    name: 'Plasma Naranja',
    bgClass: 'bg-orange-50/90 dark:bg-orange-950/40',
    borderClass: 'border-orange-200 dark:border-orange-800/60',
    badgeClass: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200',
    cardBg: '#FFF7ED',
    darkCardBg: '#431407',
    dotColor: '#F97316',
  },
  yellow: {
    id: 'yellow',
    name: 'Oro Cyber',
    bgClass: 'bg-yellow-50/90 dark:bg-yellow-950/40',
    borderClass: 'border-yellow-200 dark:border-yellow-800/60',
    badgeClass: 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200',
    cardBg: '#FEFCE8',
    darkCardBg: '#422006',
    dotColor: '#EAB308',
  },
  pink: {
    id: 'pink',
    name: 'Synthwave Rosa',
    bgClass: 'bg-pink-50/90 dark:bg-pink-950/40',
    borderClass: 'border-pink-200 dark:border-pink-800/60',
    badgeClass: 'bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200',
    cardBg: '#FDF2F8',
    darkCardBg: '#500724',
    dotColor: '#EC4899',
  },
  sand: {
    id: 'sand',
    name: 'Titanio',
    bgClass: 'bg-slate-100 dark:bg-slate-800/80',
    borderClass: 'border-slate-300 dark:border-slate-700',
    badgeClass: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
    cardBg: '#F1F5F9',
    darkCardBg: '#1E293B',
    dotColor: '#64748B',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Obsidiana Stealth',
    bgClass: 'bg-slate-100/90 dark:bg-[#0B1120]',
    borderClass: 'border-slate-300 dark:border-blue-900/40',
    badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
    cardBg: '#F8FAFC',
    darkCardBg: '#0B1120',
    dotColor: '#38BDF8',
  },
  red: {
    id: 'red',
    name: 'Alerta Rojo',
    bgClass: 'bg-red-50/90 dark:bg-red-950/40',
    borderClass: 'border-red-200 dark:border-red-800/60',
    badgeClass: 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200',
    cardBg: '#FEF2F2',
    darkCardBg: '#450A0A',
    dotColor: '#EF4444',
  },
};

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} d`;
  
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(timestamp));
}

export function formatFullDate(timestamp: number): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    if (type === 'light') navigator.vibrate(10);
    else if (type === 'medium') navigator.vibrate(25);
    else navigator.vibrate([30, 50, 30]);
  }
}
