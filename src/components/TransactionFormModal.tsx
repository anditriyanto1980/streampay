import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Store,
  User,
  Hash,
  FileText,
  CheckCircle2,
  DollarSign,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { IncomeRecord, StreamerId, PlatformId } from '../types';
import { STREAMER_LIST, QUICK_NOMINAL_BUTTONS, SESSION_PRESETS } from '../constants';
import {
  getTodayDateString,
  formatIDR,
  parseRawNumberInput,
  formatNumber,
} from '../utils/formatters';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    records: Array<Omit<IncomeRecord, 'id' | 'createdAt'>>,
    existingId?: string
  ) => void;
  editingRecord?: IncomeRecord | null;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
}) => {
  const [inputDate, setInputDate] = useState<string>(getTodayDateString());
  const [transactionDate, setTransactionDate] = useState<string>(getTodayDateString());
  const [streamerId, setStreamerId] = useState<StreamerId>('nata');
  const [sessionTitle, setSessionTitle] = useState<string>('Sesi Siang (13:00 - 16:00)');
  const [notes, setNotes] = useState<string>('');

  // Shopee fields
  const [enableShopee, setEnableShopee] = useState<boolean>(true);
  const [shopeeAmount, setShopeeAmount] = useState<number>(0);
  const [shopeeAmountDisplay, setShopeeAmountDisplay] = useState<string>('');
  const [shopeeOrderCount, setShopeeOrderCount] = useState<string>('');
  const [shopeeReceiptNumber, setShopeeReceiptNumber] = useState<string>('');

  // Tokopedia fields
  const [enableTokped, setEnableTokped] = useState<boolean>(true);
  const [tokpedAmount, setTokpedAmount] = useState<number>(0);
  const [tokpedAmountDisplay, setTokpedAmountDisplay] = useState<string>('');
  const [tokpedOrderCount, setTokpedOrderCount] = useState<string>('');
  const [tokpedReceiptNumber, setTokpedReceiptNumber] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (editingRecord) {
      setInputDate(editingRecord.inputDate);
      setTransactionDate(editingRecord.transactionDate);
      setStreamerId(editingRecord.streamerId);
      setSessionTitle(editingRecord.sessionTitle || '');
      setNotes(editingRecord.notes || '');

      if (editingRecord.platform === 'shopee') {
        setEnableShopee(true);
        setShopeeAmount(editingRecord.amount);
        setShopeeAmountDisplay(formatNumber(editingRecord.amount));
        setShopeeOrderCount(editingRecord.orderCount ? String(editingRecord.orderCount) : '');
        setShopeeReceiptNumber(editingRecord.receiptNumber || '');

        setEnableTokped(false);
        setTokpedAmount(0);
        setTokpedAmountDisplay('');
        setTokpedOrderCount('');
        setTokpedReceiptNumber('');
      } else {
        setEnableTokped(true);
        setTokpedAmount(editingRecord.amount);
        setTokpedAmountDisplay(formatNumber(editingRecord.amount));
        setTokpedOrderCount(editingRecord.orderCount ? String(editingRecord.orderCount) : '');
        setTokpedReceiptNumber(editingRecord.receiptNumber || '');

        setEnableShopee(false);
        setShopeeAmount(0);
        setShopeeAmountDisplay('');
        setShopeeOrderCount('');
        setShopeeReceiptNumber('');
      }
    } else {
      setInputDate(getTodayDateString());
      setTransactionDate(getTodayDateString());
      setStreamerId('nata');
      setSessionTitle('Sesi Siang (13:00 - 16:00)');
      setNotes('');

      setEnableShopee(true);
      setShopeeAmount(0);
      setShopeeAmountDisplay('');
      setShopeeOrderCount('');
      setShopeeReceiptNumber('');

      setEnableTokped(true);
      setTokpedAmount(0);
      setTokpedAmountDisplay('');
      setTokpedOrderCount('');
      setTokpedReceiptNumber('');
    }
    setErrorMsg('');
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  // Handlers for Shopee
  const handleShopeeChange = (val: string) => {
    const num = parseRawNumberInput(val);
    setShopeeAmount(num);
    setShopeeAmountDisplay(num > 0 ? formatNumber(num) : '');
  };

  const handleQuickAddShopee = (val: number) => {
    const next = shopeeAmount + val;
    setShopeeAmount(next);
    setShopeeAmountDisplay(formatNumber(next));
  };

  // Handlers for Tokopedia
  const handleTokpedChange = (val: string) => {
    const num = parseRawNumberInput(val);
    setTokpedAmount(num);
    setTokpedAmountDisplay(num > 0 ? formatNumber(num) : '');
  };

  const handleQuickAddTokped = (val: number) => {
    const next = tokpedAmount + val;
    setTokpedAmount(next);
    setTokpedAmountDisplay(formatNumber(next));
  };

  const totalCalculated =
    (enableShopee ? shopeeAmount : 0) + (enableTokped ? tokpedAmount : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionDate) {
      setErrorMsg('Harap tentukan tanggal sesi transaksi');
      return;
    }

    const itemsToSave: Array<Omit<IncomeRecord, 'id' | 'createdAt'>> = [];

    if (enableShopee && shopeeAmount > 0) {
      itemsToSave.push({
        inputDate: inputDate || getTodayDateString(),
        transactionDate: transactionDate || getTodayDateString(),
        streamerId,
        platform: 'shopee',
        amount: shopeeAmount,
        sessionTitle: sessionTitle.trim() || 'Sesi Live Reguler',
        orderCount: shopeeOrderCount ? parseInt(shopeeOrderCount, 10) : undefined,
        receiptNumber: shopeeReceiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    if (enableTokped && tokpedAmount > 0) {
      itemsToSave.push({
        inputDate: inputDate || getTodayDateString(),
        transactionDate: transactionDate || getTodayDateString(),
        streamerId,
        platform: 'tokopedia',
        amount: tokpedAmount,
        sessionTitle: sessionTitle.trim() || 'Sesi Live Reguler',
        orderCount: tokpedOrderCount ? parseInt(tokpedOrderCount, 10) : undefined,
        receiptNumber: tokpedReceiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    if (itemsToSave.length === 0) {
      setErrorMsg(
        'Harap masukkan nominal uang masuk minimal untuk salah satu platform (Shopee atau Tokopedia lebih dari Rp 0)'
      );
      return;
    }

    onSave(itemsToSave, editingRecord?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {editingRecord
                ? `Edit Transaksi (${editingRecord.platform === 'shopee' ? 'Shopee Live' : 'Tokopedia Live'})`
                : 'Input Uang Masuk Live Streaming'}
            </h3>
            <p className="text-xs text-indigo-200">
              Nominal uang masuk Shopee dan Tokopedia dapat diisi dengan angka berbeda
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <span className="font-semibold">Perhatian:</span> {errorMsg}
            </div>
          )}

          {/* 1. Pilih Live Streamer (Nata, Dona, Nina, Fawwas) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              Pilih Live Streamer (Wajib)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STREAMER_LIST.map((st) => {
                const isSelected = streamerId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStreamerId(st.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 relative ${
                      isSelected
                        ? `bg-indigo-50/90 dark:bg-indigo-950/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/30`
                        : `bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600`
                    }`}
                  >
                    <span className="text-2xl">{st.avatar}</span>
                    <span
                      className={`text-sm font-bold ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {st.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tanggal Sesi & Tanggal Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Tanggal Sesi Live (Wajib)
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Input / Pencatatan
              </label>
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 3. INPUT UANG MASUK SHOPEE DAN TOKOPEDIA TERPISAH (Bisa Berbeda) */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-indigo-500" />
                Nominal Uang Masuk Per Platform
              </label>
              <span className="text-[11px] text-slate-400">
                Isi platform yang aktif (angka Shopee & Tokopedia pasti berbeda)
              </span>
            </div>

            {/* SHOPEE CARD INPUT */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                enableShopee
                  ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/60 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EE4D2D]" />
                  <span className="font-extrabold text-sm text-orange-700 dark:text-orange-400">
                    Shopee Live
                  </span>
                </div>
                {!editingRecord && (
                  <button
                    type="button"
                    onClick={() => {
                      setEnableShopee(!enableShopee);
                      if (enableShopee) {
                        setShopeeAmount(0);
                        setShopeeAmountDisplay('');
                      }
                    }}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
                      enableShopee
                        ? 'text-orange-600 hover:bg-orange-100'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {enableShopee ? 'Aktif' : '+ Aktifkan Shopee'}
                  </button>
                )}
              </div>

              {enableShopee && (
                <div className="space-y-3">
                  <div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-orange-500 text-lg">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={shopeeAmountDisplay}
                        onChange={(e) => handleShopeeChange(e.target.value)}
                        placeholder="0 (Nominal Shopee)"
                        className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 rounded-xl text-lg sm:text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Quick nominal buttons for Shopee */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[10px] text-slate-400 font-medium">Cepat:</span>
                      {QUICK_NOMINAL_BUTTONS.slice(0, 5).map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => handleQuickAddShopee(btn.value)}
                          className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-orange-100 text-slate-700 dark:text-slate-300 border border-orange-200 dark:border-orange-900 rounded-lg transition-colors"
                        >
                          {btn.label}
                        </button>
                      ))}
                      {shopeeAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShopeeAmount(0);
                            setShopeeAmountDisplay('');
                          }}
                          className="px-2 py-0.5 text-xs text-rose-500 hover:bg-rose-50 rounded-lg ml-auto"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Optional Shopee Details */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="number"
                      min="0"
                      value={shopeeOrderCount}
                      onChange={(e) => setShopeeOrderCount(e.target.value)}
                      placeholder="Jml Checkout Shopee (opsional)"
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <input
                      type="text"
                      value={shopeeReceiptNumber}
                      onChange={(e) => setShopeeReceiptNumber(e.target.value)}
                      placeholder="No Ref / Settle Shopee (opsional)"
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TOKOPEDIA CARD INPUT */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                enableTokped
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#03AC0E]" />
                  <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                    Tokopedia Live
                  </span>
                </div>
                {!editingRecord && (
                  <button
                    type="button"
                    onClick={() => {
                      setEnableTokped(!enableTokped);
                      if (enableTokped) {
                        setTokpedAmount(0);
                        setTokpedAmountDisplay('');
                      }
                    }}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
                      enableTokped
                        ? 'text-emerald-600 hover:bg-emerald-100'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {enableTokped ? 'Aktif' : '+ Aktifkan Tokopedia'}
                  </button>
                )}
              </div>

              {enableTokped && (
                <div className="space-y-3">
                  <div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-600 text-lg">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={tokpedAmountDisplay}
                        onChange={(e) => handleTokpedChange(e.target.value)}
                        placeholder="0 (Nominal Tokopedia)"
                        className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl text-lg sm:text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Quick nominal buttons for Tokopedia */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[10px] text-slate-400 font-medium">Cepat:</span>
                      {QUICK_NOMINAL_BUTTONS.slice(0, 5).map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => handleQuickAddTokped(btn.value)}
                          className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-emerald-900 rounded-lg transition-colors"
                        >
                          {btn.label}
                        </button>
                      ))}
                      {tokpedAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setTokpedAmount(0);
                            setTokpedAmountDisplay('');
                          }}
                          className="px-2 py-0.5 text-xs text-rose-500 hover:bg-rose-50 rounded-lg ml-auto"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Optional Tokopedia Details */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="number"
                      min="0"
                      value={tokpedOrderCount}
                      onChange={(e) => setTokpedOrderCount(e.target.value)}
                      placeholder="Jml Checkout Tokped (opsional)"
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <input
                      type="text"
                      value={tokpedReceiptNumber}
                      onChange={(e) => setTokpedReceiptNumber(e.target.value)}
                      placeholder="No Ref / Settle Tokped (opsional)"
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Combined Summary Card */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-indigo-300">
                  Total Uang Masuk Sesi Ini (Shopee + Tokped)
                </div>
                <div className="text-lg font-black">{formatIDR(totalCalculated)}</div>
              </div>
              <div className="text-right text-[11px] text-slate-300 space-y-0.5">
                <div>
                  Shopee: <span className="font-bold text-orange-400">{formatIDR(enableShopee ? shopeeAmount : 0)}</span>
                </div>
                <div>
                  Tokopedia: <span className="font-bold text-emerald-400">{formatIDR(enableTokped ? tokpedAmount : 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Sesi Live Presets & Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sesi Live Streaming / Jam
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Contoh: Sesi Siang (13:00 - 16:00)"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5">
                {SESSION_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSessionTitle(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Catatan / Promo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Sesi / Produk Utama (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Mega Campaign 11.11, Flash Sale Skincare & Pria Style"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {editingRecord
                  ? 'Perbarui Transaksi'
                  : `Simpan Data (${formatIDR(totalCalculated)})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
