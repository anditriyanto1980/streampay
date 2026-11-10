import React, { useState, useMemo } from 'react';
import { StreamerPeriodStats, IncomeRecord, PeriodType, DateRangeInfo } from '../types';
import { formatIDR, formatNumber, formatDateIndo } from '../utils/formatters';
import { MONTH_NAMES_ID } from '../constants';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  Calendar,
  Clock,
  BarChart3,
  CalendarRange,
} from 'lucide-react';

interface PerformanceReportViewProps {
  periodType: PeriodType;
  onPeriodTypeChange: (type: PeriodType) => void;
  dateRange: DateRangeInfo;

  // Specific state controllers
  selectedDailyDate: string;
  onDailyDateChange: (date: string) => void;

  selectedWeeklyAnchor: string;
  onWeeklyAnchorChange: (date: string) => void;

  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;

  customStartDate: string;
  customEndDate: string;
  onCustomRangeChange: (start: string, end: string) => void;

  stats: StreamerPeriodStats[];
  records: IncomeRecord[];
  allRecords: IncomeRecord[]; // for yearly breakdown calculation

  onExportExcel: () => void;
  onExportPdf: () => void;
}

export const PerformanceReportView: React.FC<PerformanceReportViewProps> = ({
  periodType,
  onPeriodTypeChange,
  dateRange,

  selectedDailyDate,
  onDailyDateChange,

  selectedWeeklyAnchor,
  onWeeklyAnchorChange,

  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,

  customStartDate,
  customEndDate,
  onCustomRangeChange,

  stats,
  records,
  allRecords,

  onExportExcel,
  onExportPdf,
}) => {
  const [commissionRate, setCommissionRate] = useState<number>(5);
  const [showCommission, setShowCommission] = useState<boolean>(false);

  const totalIncome = stats.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalShopee = stats.reduce((sum, s) => sum + s.shopeeIncome, 0);
  const totalTokped = stats.reduce((sum, s) => sum + s.tokpedIncome, 0);
  const totalSessions = stats.reduce((sum, s) => sum + s.sessionCount, 0);
  const totalOrders = stats.reduce((sum, s) => sum + s.totalOrders, 0);

  const shopeePct = totalIncome > 0 ? (totalShopee / totalIncome) * 100 : 0;
  const tokpedPct = totalIncome > 0 ? (totalTokped / totalIncome) * 100 : 0;

  // Daily Navigation helpers
  const handleShiftDay = (deltaDays: number) => {
    const parts = selectedDailyDate.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + deltaDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDailyDateChange(`${y}-${m}-${day}`);
  };

  // Weekly Navigation helpers
  const handleShiftWeek = (deltaWeeks: number) => {
    const parts = selectedWeeklyAnchor.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + deltaWeeks * 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onWeeklyAnchorChange(`${y}-${m}-${day}`);
  };

  // Monthly Navigation helpers
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

  // Preset buttons for Custom Date Range
  const setQuickCustomRange = (daysBack: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (daysBack - 1));

    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onCustomRangeChange(fmt(start), fmt(end));
  };

  // For Yearly mode: Monthly breakdown array (12 months)
  const yearlyMonthlyBreakdown = useMemo(() => {
    if (periodType !== 'yearly') return [];

    return MONTH_NAMES_ID.map((name, idx) => {
      const mNum = idx + 1;
      const mRecs = allRecords.filter((r) => {
        if (!r.transactionDate) return false;
        const [y, m] = r.transactionDate.split('-').map(Number);
        return y === selectedYear && m === mNum;
      });
      const income = mRecs.reduce((sum, r) => sum + r.amount, 0);
      return {
        monthIndex: mNum,
        monthName: name.slice(0, 3),
        fullMonthName: name,
        income,
        sessions: mRecs.length,
      };
    });
  }, [allRecords, selectedYear, periodType]);

  const maxYearlyMonthIncome = useMemo(() => {
    return Math.max(...yearlyMonthlyBreakdown.map((m) => m.income), 1);
  }, [yearlyMonthlyBreakdown]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
      {/* 1. Primary Period Selector Bar (Harian, Mingguan, Bulanan, Tahunan, Kustom) */}
      <div className="space-y-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-indigo-500" />
                Laporan Performa Multidimensi
              </span>
              <span className="text-xs text-slate-400">
                {records.length} Transaksi di Periode Ini
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Performa {dateRange.label}</span>
            </h2>
          </div>

          {/* Export & Print actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
              title="Unduh Laporan Periode Terpilih ke Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
              title="Unduh Laporan Periode Terpilih ke PDF"
            >
              <FileText className="w-4 h-4" />
              <span>Ekspor PDF</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              title="Cetak Laporan / Print"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5 Period Selection Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => onPeriodTypeChange('daily')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              periodType === 'daily'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Harian (Daily)</span>
          </button>

          <button
            onClick={() => onPeriodTypeChange('weekly')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              periodType === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Mingguan (Weekly)</span>
          </button>

          <button
            onClick={() => onPeriodTypeChange('monthly')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              periodType === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Bulanan (Monthly)</span>
          </button>

          <button
            onClick={() => onPeriodTypeChange('yearly')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              periodType === 'yearly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tahunan (Yearly)</span>
          </button>

          <button
            onClick={() => onPeriodTypeChange('custom')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              periodType === 'custom'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Kustom Tanggal</span>
          </button>
        </div>

        {/* Period-Specific Dynamic Sub-Controls */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          {/* Sub-control: HARIAN */}
          {periodType === 'daily' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShiftDay(-1)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDailyDate}
                  onChange={(e) => onDailyDateChange(e.target.value)}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleShiftDay(1)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                  title="Hari Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Pintasan:</span>
                <button
                  onClick={() => onDailyDateChange('2026-11-09')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Hari Ini (09 Nov)
                </button>
                <button
                  onClick={() => onDailyDateChange('2026-11-08')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Kemarin (08 Nov)
                </button>
              </div>
            </div>
          )}

          {/* Sub-control: MINGGUAN */}
          {periodType === 'weekly' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShiftWeek(-1)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                  title="Minggu Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  {dateRange.label}
                </div>
                <button
                  onClick={() => handleShiftWeek(1)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                  title="Minggu Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onWeeklyAnchorChange('2026-11-09')}
                  className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Lompat ke Minggu Ini
                </button>
              </div>
            </div>
          )}

          {/* Sub-control: BULANAN */}
          {periodType === 'monthly' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={selectedMonth}
                  onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MONTH_NAMES_ID.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[2027, 2026, 2025, 2024].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleNextMonth}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onMonthChange(11);
                    onYearChange(2026);
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Bulan Ini (November 2026)
                </button>
                <button
                  onClick={() => {
                    onMonthChange(10);
                    onYearChange(2026);
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Bulan Lalu (Oktober 2026)
                </button>
              </div>
            </div>
          )}

          {/* Sub-control: TAHUNAN */}
          {periodType === 'yearly' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Pilih Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
                  className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[2027, 2026, 2025, 2024].map((y) => (
                    <option key={y} value={y}>
                      Tahun {y}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500">
                Menampilkan komparasi 12 bulan dan performa tahunan seluruh live streamer
              </p>
            </div>
          )}

          {/* Sub-control: KUSTOM TANGGAL */}
          {periodType === 'custom' && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Dari:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => onCustomRangeChange(e.target.value, customEndDate)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Sampai:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => onCustomRangeChange(customStartDate, e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Quick custom range presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Pintasan Cepat:</span>
                <button
                  type="button"
                  onClick={() => setQuickCustomRange(7)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  7 Hari Terakhir
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCustomRange(14)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  14 Hari Terakhir
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCustomRange(30)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  30 Hari Terakhir
                </button>
                <button
                  type="button"
                  onClick={() => onCustomRangeChange('2026-11-01', '2026-11-09')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  November Berjalan
                </button>
                <button
                  type="button"
                  onClick={() => onCustomRangeChange('2026-10-01', '2026-10-31')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Oktober Penuh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Grand */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 -bottom-4 opacity-10">
            <TrendingUp className="w-28 h-28" />
          </div>
          <div className="text-xs font-medium text-indigo-200 uppercase tracking-wider mb-1">
            Total Uang Masuk ({dateRange.label})
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

      {/* 3. Yearly Chart / Breakdown (Visible only when in Yearly mode) */}
      {periodType === 'yearly' && (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Tren Omset 12 Bulan (Tahun {selectedYear})</span>
            </h3>
            <span className="text-xs text-slate-400">Klik bar untuk melihat bulan spesifik</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4 items-end h-44">
            {yearlyMonthlyBreakdown.map((m) => {
              const heightPct = (m.income / maxYearlyMonthIncome) * 100;
              const isSelected = selectedMonth === m.monthIndex;

              return (
                <div
                  key={m.monthIndex}
                  onClick={() => {
                    onMonthChange(m.monthIndex);
                    onPeriodTypeChange('monthly');
                  }}
                  className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                >
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {m.income > 0 ? `${(m.income / 1000000).toFixed(1)}jt` : '0'}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg h-28 flex items-end p-0.5">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isSelected
                          ? 'bg-indigo-600'
                          : m.income > 0
                          ? 'bg-indigo-400 dark:bg-indigo-500 hover:bg-indigo-600'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(heightPct, m.income > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      isSelected
                        ? 'text-indigo-600 font-black'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m.monthName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Rekapitulasi Per Streamer Table */}
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
