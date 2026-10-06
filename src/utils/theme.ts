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
    name: 'Por defecto',
    bgClass: 'bg-white dark:bg-zinc-900',
    borderClass: 'border-stone-200 dark:border-zinc-800',
    badgeClass: 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300',
    cardBg: '#FFFFFF',
    darkCardBg: '#18181b',
    dotColor: '#9CA3AF',
  },
  emerald: {
    id: 'emerald',
    name: 'Esmeralda',
    bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/50',
    badgeClass: 'bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200',
    cardBg: '#ECFDF5',
    darkCardBg: '#064E3B',
    dotColor: '#10B981',
  },
  amber: {
    id: 'amber',
    name: 'Ámbar',
    bgClass: 'bg-amber-50/80 dark:bg-amber-950/40',
    borderClass: 'border-amber-200/80 dark:border-amber-800/50',
    badgeClass: 'bg-amber-100/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
    cardBg: '#FFFBEB',
    darkCardBg: '#78350F',
    dotColor: '#F59E0B',
  },
  sky: {
    id: 'sky',
    name: 'Cielo',
    bgClass: 'bg-sky-50/80 dark:bg-sky-950/40',
    borderClass: 'border-sky-200/80 dark:border-sky-800/50',
    badgeClass: 'bg-sky-100/80 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200',
    cardBg: '#F0F9FF',
    darkCardBg: '#0C4A6E',
    dotColor: '#0EA5E9',
  },
  violet: {
    id: 'violet',
    name: 'Violeta',
    bgClass: 'bg-violet-50/80 dark:bg-violet-950/40',
    borderClass: 'border-violet-200/80 dark:border-violet-800/50',
    badgeClass: 'bg-violet-100/80 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200',
    cardBg: '#F5F3FF',
    darkCardBg: '#4C1D95',
    dotColor: '#8B5CF6',
  },
  teal: {
    id: 'teal',
    name: 'Turquesa',
    bgClass: 'bg-teal-50/80 dark:bg-teal-950/40',
    borderClass: 'border-teal-200/80 dark:border-teal-800/50',
    badgeClass: 'bg-teal-100/80 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200',
    cardBg: '#F0FDFA',
    darkCardBg: '#134E4A',
    dotColor: '#14B8A6',
  },
  yellow: {
    id: 'yellow',
    name: 'Canario',
    bgClass: 'bg-yellow-50/80 dark:bg-yellow-950/40',
    borderClass: 'border-yellow-200/80 dark:border-yellow-800/50',
    badgeClass: 'bg-yellow-100/80 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200',
    cardBg: '#FEFCE8',
    darkCardBg: '#713F12',
    dotColor: '#EAB308',
  },
  coral: {
    id: 'coral',
    name: 'Coral',
    bgClass: 'bg-orange-50/80 dark:bg-orange-950/40',
    borderClass: 'border-orange-200/80 dark:border-orange-800/50',
    badgeClass: 'bg-orange-100/80 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200',
    cardBg: '#FFF7ED',
    darkCardBg: '#7C2D12',
    dotColor: '#F97316',
  },
  blue: {
    id: 'blue',
    name: 'Índigo',
    bgClass: 'bg-indigo-50/80 dark:bg-indigo-950/40',
    borderClass: 'border-indigo-200/80 dark:border-indigo-800/50',
    badgeClass: 'bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200',
    cardBg: '#EEF2FF',
    darkCardBg: '#312E81',
    dotColor: '#6366F1',
  },
  sand: {
    id: 'sand',
    name: 'Arena',
    bgClass: 'bg-stone-100/90 dark:bg-stone-900/80',
    borderClass: 'border-stone-300 dark:border-stone-700',
    badgeClass: 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200',
    cardBg: '#F5F5F4',
    darkCardBg: '#292524',
    dotColor: '#78716C',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Grafito',
    bgClass: 'bg-zinc-100/90 dark:bg-zinc-900/90',
    borderClass: 'border-zinc-300 dark:border-zinc-700',
    badgeClass: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200',
    cardBg: '#F4F4F5',
    darkCardBg: '#18181B',
    dotColor: '#52525B',
  },
  red: {
    id: 'red',
    name: 'Rubí',
    bgClass: 'bg-red-50/80 dark:bg-red-950/40',
    borderClass: 'border-red-200/80 dark:border-red-800/50',
    badgeClass: 'bg-red-100/80 dark:bg-red-900/60 text-red-800 dark:text-red-200',
    cardBg: '#FEF2F2',
    darkCardBg: '#7F1D1D',
    dotColor: '#EF4444',
  },
  indigo: {
    id: 'indigo',
    name: 'Zafiro',
    bgClass: 'bg-indigo-50/90 dark:bg-indigo-950/50',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    cardBg: '#EEF2FF',
    darkCardBg: '#312E81',
    dotColor: '#4F46E5',
  },
  pink: {
    id: 'pink',
    name: 'Fucsia',
    bgClass: 'bg-pink-50/80 dark:bg-pink-950/40',
    borderClass: 'border-pink-200/80 dark:border-pink-800/50',
    badgeClass: 'bg-pink-100/80 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200',
    cardBg: '#FDF2F8',
    darkCardBg: '#831843',
    dotColor: '#EC4899',
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
