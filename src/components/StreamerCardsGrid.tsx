import React from 'react';
import { StreamerMonthlyStats, StreamerId } from '../types';
import { formatIDR } from '../utils/formatters';
import { Award, TrendingUp, Radio } from 'lucide-react';

interface StreamerCardsGridProps {
  stats: StreamerMonthlyStats[];
  selectedStreamer: StreamerId | 'all';
  onSelectStreamer: (streamerId: StreamerId | 'all') => void;
  periodLabel: string;
}

export const StreamerCardsGrid: React.FC<StreamerCardsGridProps> = ({
  stats,
  selectedStreamer,
  onSelectStreamer,
  periodLabel,
}) => {
  // Sort by highest income to calculate rank
  const sortedStats = [...stats].sort((a, b) => b.totalIncome - a.totalIncome);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Performa 4 Live Streamer ({periodLabel})
          </h2>
        </div>
        <p className="text-xs text-slate-500">Klik kartu streamer untuk memfilter daftar transaksi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const rank = sortedStats.findIndex((s) => s.streamer.id === item.streamer.id) + 1;
          const isSelected = selectedStreamer === item.streamer.id;

          return (
            <div
              key={item.streamer.id}
              onClick={() => onSelectStreamer(isSelected ? 'all' : item.streamer.id)}
              className={`cursor-pointer group relative p-4 rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-lg ring-2 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
              }`}
            >
              {/* Subtle top color banner */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: item.streamer.color }}
              />

              {/* Streamer Profile Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-xs border border-slate-200/60 dark:border-slate-700">
                    {item.streamer.avatar}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      {item.streamer.name}
                      {isSelected && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          Aktif
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Radio className="w-3 h-3 text-emerald-500" />
                      <span>{item.sessionCount} Sesi Live</span>
                      {item.totalOrders > 0 && (
                        <span>• {item.totalOrders} order</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rank Badge */}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    rank === 1
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>#{rank}</span>
                </div>
              </div>

              {/* Total Income Display */}
              <div className="mb-3.5">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  Total Uang Masuk
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatIDR(item.totalIncome)}
                </div>
              </div>

              {/* Progress bar of total contribution */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Kontribusi Omset</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {item.percentageOfTotal.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(item.percentageOfTotal, 3))}%`,
                      backgroundColor: item.streamer.color,
                    }}
                  />
                </div>
              </div>

              {/* Breakdown Shopee vs Tokopedia */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="bg-orange-50/70 dark:bg-orange-950/30 p-2 rounded-xl border border-orange-100 dark:border-orange-900/40">
                  <div className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EE4D2D]" />
                    Shopee
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {formatIDR(item.shopeeIncome)}
                  </div>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#03AC0E]" />
                    Tokopedia
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {formatIDR(item.tokpedIncome)}
                  </div>
                </div>
              </div>

              {/* Average per session footnote */}
              {item.sessionCount > 0 && (
                <div className="mt-2 text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
                  <TrendingUp className="w-3 h-3 text-slate-400" />
                  <span>Rata-rata: {formatIDR(Math.round(item.avgPerSession))} / sesi</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
