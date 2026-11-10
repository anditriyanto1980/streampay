import { StreamerProfile, PlatformId, StreamerId } from './types';

export const STREAMERS: Record<StreamerId, StreamerProfile> = {
  nata: {
    id: 'nata',
    name: 'Nata',
    avatar: '👩🏻‍💼',
    color: '#6366F1', // Indigo
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    accentGradient: 'from-indigo-500 to-blue-600',
    commissionRate: 5,
  },
  dona: {
    id: 'dona',
    name: 'Dona',
    avatar: '👱🏻‍♀️',
    color: '#10B981', // Emerald
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    accentGradient: 'from-emerald-500 to-teal-600',
    commissionRate: 5,
  },
  nina: {
    id: 'nina',
    name: 'Nina',
    avatar: '👩🏽',
    color: '#EC4899', // Pink / Rose
    badgeBg: 'bg-pink-50 dark:bg-pink-950/60',
    badgeBorder: 'border-pink-200 dark:border-pink-800',
    textColor: 'text-pink-700 dark:text-pink-300',
    accentGradient: 'from-pink-500 to-rose-600',
    commissionRate: 5,
  },
  fawwas: {
    id: 'fawwas',
    name: 'Fawwas',
    avatar: '👨🏻‍💻',
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-300',
    accentGradient: 'from-amber-500 to-orange-600',
    commissionRate: 5,
  },
};

export const STREAMER_LIST = Object.values(STREAMERS);

export const PLATFORMS: Record<PlatformId, {
  id: PlatformId;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconBg: string;
  brandColor: string;
}> = {
  shopee: {
    id: 'shopee',
    name: 'Shopee Live',
    shortName: 'Shopee',
    color: '#EE4D2D',
    bgColor: 'bg-orange-50 dark:bg-orange-950/50',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    iconBg: 'bg-orange-500',
    brandColor: '#EE4D2D',
  },
  tokopedia: {
    id: 'tokopedia',
    name: 'Tokopedia Live',
    shortName: 'Tokopedia',
    color: '#03AC0E',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-emerald-600',
    brandColor: '#03AC0E',
  },
};

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const QUICK_NOMINAL_BUTTONS = [
  { label: '+100 rb', value: 100000 },
  { label: '+250 rb', value: 250000 },
  { label: '+500 rb', value: 500000 },
  { label: '+1 Jt', value: 1000000 },
  { label: '+2.5 Jt', value: 2500000 },
  { label: '+5 Jt', value: 5000000 },
];

export const SESSION_PRESETS = [
  'Sesi Pagi (09:00 - 12:00)',
  'Sesi Siang (13:00 - 16:00)',
  'Sesi Sore (16:30 - 19:00)',
  'Sesi Malam (19:30 - 22:30)',
  'Flash Sale / Mega Campaign',
  'Midnight Live (23:00 - 01:00)',
];
