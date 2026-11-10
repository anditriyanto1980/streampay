import React, { useState, useMemo } from 'react';
import { IncomeRecord, StreamerId, PlatformId } from '../types';
import { STREAMERS, STREAMER_LIST, PLATFORMS } from '../constants';
import { formatIDR, formatDateIndo } from '../utils/formatters';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  ArrowUpDown,
  ShoppingBag,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface TransactionTableProps {
  records: IncomeRecord[];
  selectedStreamer: StreamerId | 'all';
  onSelectStreamer: (streamerId: StreamerId | 'all') => void;
  selectedPlatform: PlatformId | 'all';
  onSelectPlatform: (platform: PlatformId | 'all') => void;
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: string) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  records,
  selectedStreamer,
  onSelectStreamer,
  selectedPlatform,
  onSelectPlatform,
  onEdit,
  onDelete,
  onOpenNewTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filtered & sorted records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (selectedStreamer !== 'all') {
      result = result.filter((r) => r.streamerId === selectedStreamer);
    }

    if (selectedPlatform !== 'all') {
      result = result.filter((r) => r.platform === selectedPlatform);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.sessionTitle?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q) ||
          r.receiptNumber?.toLowerCase().includes(q) ||
          STREAMERS[r.streamerId]?.name.toLowerCase().includes(q) ||
          r.amount.toString().includes(q) ||
          r.transactionDate.includes(q) ||
          r.inputDate.includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.transactionDate).getTime();
        const dateB = new Date(b.transactionDate).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
      } else {
        return sortAsc ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return result;
  }, [records, selectedStreamer, selectedPlatform, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const totalFilteredAmount = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [filteredRecords]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Header & Search / Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>Daftar Transaksi Masuk</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
              {filteredRecords.length} Data
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Pencatatan rincian tanggal, streamer, platform, dan nominal per sesi
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari sesi, no ref, atau catatan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs: Streamers & Platforms */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        {/* Streamer Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Streamer:
          </span>
          <button
            onClick={() => onSelectStreamer('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedStreamer === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua (4)
          </button>
          {STREAMER_LIST.map((st) => {
            const isSelected = selectedStreamer === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStreamer(st.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{st.avatar}</span>
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1">Platform:</span>
          <button
            onClick={() => onSelectPlatform('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedPlatform === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => onSelectPlatform('shopee')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedPlatform === 'shopee'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#EE4D2D]" />
            Shopee
          </button>
          <button
            onClick={() => onSelectPlatform('tokopedia')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedPlatform === 'tokopedia'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#03AC0E]" />
            Tokopedia
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleSort('date')}
                  className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                >
                  <span>Tanggal Sesi / Input</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Streamer</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Sesi Live & Catatan</th>
              <th className="py-3 px-4">No. Ref / Bukti</th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => toggleSort('amount')}
                  className="flex items-center gap-1 justify-end w-full hover:text-slate-900 dark:hover:text-white"
                >
                  <span>Nominal Masuk</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tidak ada transaksi yang cocok
                    </p>
                    <p className="text-xs text-slate-400">
                      Coba ganti filter streamer, platform, atau masukkan transaksi baru.
                    </p>
                    <button
                      onClick={onOpenNewTransaction}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Input Transaksi</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const streamer = STREAMERS[rec.streamerId];
                const plat = PLATFORMS[rec.platform];

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors font-medium text-slate-700 dark:text-slate-300 group"
                  >
                    {/* Tanggal */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatDateIndo(rec.transactionDate, false)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Input: {formatDateIndo(rec.inputDate, false)}
                      </div>
                    </td>

                    {/* Streamer Badge */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                        <span className="text-base">{streamer?.avatar || '👤'}</span>
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          {streamer?.name || rec.streamerId}
                        </span>
                      </div>
                    </td>

                    {/* Platform Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${plat.bgColor} ${plat.borderColor} ${plat.textColor}`}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: plat.brandColor }}
                        />
                        {plat.shortName}
                      </span>
                    </td>

                    {/* Sesi & Catatan */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {rec.sessionTitle}
                      </div>
                      {rec.notes && (
                        <div className="text-xs text-slate-500 line-clamp-1 italic">
                          "{rec.notes}"
                        </div>
                      )}
                      {rec.orderCount && rec.orderCount > 0 && (
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                          {rec.orderCount} pesanan checkout
                        </div>
                      )}
                    </td>

                    {/* No. Ref */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {rec.receiptNumber ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          {rec.receiptNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>

                    {/* Nominal */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {formatIDR(rec.amount)}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(rec)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Catatan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan transaksi ${formatIDR(rec.amount)} oleh ${streamer?.name}?`)) {
                              onDelete(rec.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Subtotal Summary */}
      {filteredRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 gap-2">
          <div>
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-300">{filteredRecords.length}</span> data transaksi
          </div>
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            Total Saring: <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{formatIDR(totalFilteredAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
