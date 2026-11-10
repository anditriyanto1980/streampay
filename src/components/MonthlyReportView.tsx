import React, { useState } from 'react';
import { StreamerMonthlyStats, IncomeRecord } from '../types';
import { formatIDR, formatNumber } from '../utils/formatters';
import { MONTH_NAMES_ID } from '../constants';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  Sparkles,
} from 'lucide-react';

interface MonthlyReportViewProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  stats: StreamerMonthlyStats[];
  records: IncomeRecord[];
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  stats,
  records,
  onExportExcel,
  onExportPdf,
}) => {
  const [commissionRate, setCommissionRate] = useState<number>(5); // Default 5% commission rate
  const [showCommission, setShowCommission] = useState<boolean>(false);

  const monthName = MONTH_NAMES_ID[selectedMonth - 1];

  const totalIncome = stats.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalShopee = stats.reduce((sum, s) => sum + s.shopeeIncome, 0);
  const totalTokped = stats.reduce((sum, s) => sum + s.tokpedIncome, 0);
  const totalSessions = stats.reduce((sum, s) => sum + s.sessionCount, 0);
  const totalOrders = stats.reduce((sum, s) => sum + s.totalOrders, 0);

  const shopeePct = totalIncome > 0 ? (totalShopee / totalIncome) * 100 : 0;
  const tokpedPct = totalIncome > 0 ? (totalTokped / totalIncome) * 100 : 0;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(12);
      onYearChange(selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(1);
      onYearChange(selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Month & Year Navigation + Export Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Laporan Rekapitulasi
            </span>
            <span className="text-xs text-slate-400">Total {records.length} Transaksi Tercatat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Laporan Uang Masuk Bulanan
          </h2>
        </div>

        {/* Month Selector + Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Month / Year Navigator */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
              {monthName} {selectedYear}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
            title="Download file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
            title="Download file PDF"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor PDF</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Cetak Laporan / Print"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Grand */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 -bottom-4 opacity-10">
            <TrendingUp className="w-28 h-28" />
          </div>
          <div className="text-xs font-medium text-indigo-200 uppercase tracking-wider mb-1">
            Total Uang Masuk ({monthName})
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            {formatIDR(totalIncome)}
          </div>
          <div className="flex items-center gap-3 text-xs text-indigo-200 border-t border-indigo-800/80 pt-3">
            <div>
              <span className="font-bold text-white">{totalSessions}</span> Sesi Live
            </div>
            <span>•</span>
            <div>
              <span className="font-bold text-white">{totalOrders}</span> Pesanan Terjual
            </div>
          </div>
        </div>

        {/* Shopee Summary */}
        <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#EE4D2D]" />
                Shopee Live
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300">
                {shopeePct.toFixed(1)}% Share
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatIDR(totalShopee)}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-orange-100 dark:border-orange-900/40">
            Total uang masuk dari siaran langsung Shopee Live
          </p>
        </div>

        {/* Tokopedia Summary */}
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#03AC0E]" />
                Tokopedia Live
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                {tokpedPct.toFixed(1)}% Share
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatIDR(totalTokped)}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/40">
            Total uang masuk dari siaran langsung Tokopedia Live
          </p>
        </div>
      </div>

      {/* Visual Platform Share Progress Bar */}
      {totalIncome > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 text-orange-600">
              <span className="w-2 h-2 rounded-full bg-[#EE4D2D]" />
              Shopee Live: {shopeePct.toFixed(1)}% ({formatIDR(totalShopee)})
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-[#03AC0E]" />
              Tokopedia Live: {tokpedPct.toFixed(1)}% ({formatIDR(totalTokped)})
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div
              className="bg-[#EE4D2D] h-full transition-all duration-500"
              style={{ width: `${shopeePct}%` }}
              title={`Shopee: ${shopeePct.toFixed(1)}%`}
            />
            <div
              className="bg-[#03AC0E] h-full transition-all duration-500"
              style={{ width: `${tokpedPct}%` }}
              title={`Tokopedia: ${tokpedPct.toFixed(1)}%`}
            />
          </div>
        </div>
      )}

      {/* Rekapitulasi Per Streamer Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tabel Rekapitulasi 4 Live Streamer</span>
            <span className="text-xs font-normal text-slate-400">
              (Nata, Dona, Nina, Fawwas)
            </span>
          </h3>

          {/* Toggle Commission Tool */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommission(!showCommission)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                showCommission
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>{showCommission ? 'Tutup Kalkulator Komisi' : 'Hitung Komisi Streamer'}</span>
            </button>
            {showCommission && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500">Rate:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-14 px-2 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 font-bold text-center"
                />
                <span className="text-slate-500">%</span>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Nama Streamer</th>
                <th className="py-3 px-4 text-right">Shopee Live</th>
                <th className="py-3 px-4 text-right">Tokopedia Live</th>
                <th className="py-3 px-4 text-right">Total Masuk</th>
                <th className="py-3 px-4 text-center">Kontribusi</th>
                <th className="py-3 px-4 text-center">Jumlah Sesi</th>
                <th className="py-3 px-4 text-right">Rata-rata/Sesi</th>
                {showCommission && (
                  <th className="py-3 px-4 text-right text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30">
                    Est. Komisi ({commissionRate}%)
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.map((item) => {
                const commission = (item.totalIncome * commissionRate) / 100;
                return (
                  <tr
                    key={item.streamer.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors font-medium text-slate-700 dark:text-slate-300"
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2.5">
                      <span className="text-xl">{item.streamer.avatar}</span>
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {item.streamer.name}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {item.totalOrders} pesanan checkout
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-orange-600 dark:text-orange-400">
                      {formatIDR(item.shopeeIncome)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatIDR(item.tokpedIncome)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatIDR(item.totalIncome)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.percentageOfTotal.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      {item.sessionCount} Sesi
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                      {item.sessionCount > 0 ? formatIDR(Math.round(item.avgPerSession)) : '-'}
                    </td>
                    {showCommission && (
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                        {formatIDR(commission)}
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Total Footer Row */}
              <tr className="bg-slate-50 dark:bg-slate-800/70 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                <td className="py-4 px-4 text-sm uppercase">Total Keseluruhan</td>
                <td className="py-4 px-4 text-right text-orange-600 dark:text-orange-400">
                  {formatIDR(totalShopee)}
                </td>
                <td className="py-4 px-4 text-right text-emerald-600 dark:text-emerald-400">
                  {formatIDR(totalTokped)}
                </td>
                <td className="py-4 px-4 text-right text-base text-slate-900 dark:text-white">
                  {formatIDR(totalIncome)}
                </td>
                <td className="py-4 px-4 text-center">100%</td>
                <td className="py-4 px-4 text-center">{totalSessions} Sesi</td>
                <td className="py-4 px-4 text-right text-xs">
                  {totalSessions > 0 ? formatIDR(Math.round(totalIncome / totalSessions)) : '-'}
                </td>
                {showCommission && (
                  <td className="py-4 px-4 text-right text-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-950/50">
                    {formatIDR((totalIncome * commissionRate) / 100)}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
