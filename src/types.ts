export type StreamerId = 'nata' | 'dona' | 'nina' | 'fawwas';

export type PlatformId = 'shopee' | 'tokopedia';

export interface StreamerProfile {
  id: StreamerId;
  name: string;
  avatar: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  accentGradient: string;
  commissionRate?: number; // e.g. 5%
}

export interface IncomeRecord {
  id: string;
  inputDate: string; // YYYY-MM-DD
  transactionDate: string; // YYYY-MM-DD
  streamerId: StreamerId;
  platform: PlatformId;
  amount: number;
  sessionTitle: string; // e.g. "Live Sore Mega Sale", "Pagi 09:00 - 12:00"
  orderCount?: number; // Jumlah order checkout (opsional)
  receiptNumber?: string; // No. Settle / Ref ID
  notes?: string;
  createdAt: string;
}

export interface FilterState {
  month: number; // 1 - 12
  year: number;
  streamerId: StreamerId | 'all';
  platform: PlatformId | 'all';
  searchQuery: string;
}

export interface StreamerMonthlyStats {
  streamer: StreamerProfile;
  totalIncome: number;
  shopeeIncome: number;
  tokpedIncome: number;
  sessionCount: number;
  totalOrders: number;
  percentageOfTotal: number;
  avgPerSession: number;
}
