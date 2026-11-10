import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Store, User, Hash, FileText, CheckCircle2 } from 'lucide-react';
import { IncomeRecord, StreamerId, PlatformId } from '../types';
import { STREAMERS, STREAMER_LIST, PLATFORMS, QUICK_NOMINAL_BUTTONS, SESSION_PRESETS } from '../constants';
import { getTodayDateString, formatIDR, parseRawNumberInput, formatNumber } from '../utils/formatters';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<IncomeRecord, 'id' | 'createdAt'>, existingId?: string) => void;
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
  const [platform, setPlatform] = useState<PlatformId>('shopee');
  const [amount, setAmount] = useState<number>(0);
  const [amountDisplay, setAmountDisplay] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState<string>('Sesi Siang (13:00 - 16:00)');
  const [orderCount, setOrderCount] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (editingRecord) {
      setInputDate(editingRecord.inputDate);
      setTransactionDate(editingRecord.transactionDate);
      setStreamerId(editingRecord.streamerId);
      setPlatform(editingRecord.platform);
      setAmount(editingRecord.amount);
      setAmountDisplay(formatNumber(editingRecord.amount));
      setSessionTitle(editingRecord.sessionTitle || '');
      setOrderCount(editingRecord.orderCount ? String(editingRecord.orderCount) : '');
      setReceiptNumber(editingRecord.receiptNumber || '');
      setNotes(editingRecord.notes || '');
    } else {
      setInputDate(getTodayDateString());
      setTransactionDate(getTodayDateString());
      setStreamerId('nata');
      setPlatform('shopee');
      setAmount(0);
      setAmountDisplay('');
      setSessionTitle('Sesi Siang (13:00 - 16:00)');
      setOrderCount('');
      setReceiptNumber('');
      setNotes('');
    }
    setErrorMsg('');
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numeric = parseRawNumberInput(rawVal);
    setAmount(numeric);
    setAmountDisplay(numeric > 0 ? formatNumber(numeric) : '');
  };

  const handleQuickAddAmount = (addVal: number) => {
    const newAmount = amount + addVal;
    setAmount(newAmount);
    setAmountDisplay(formatNumber(newAmount));
  };

  const handleClearAmount = () => {
    setAmount(0);
    setAmountDisplay('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Harap masukkan nominal uang masuk yang valid (lebih dari Rp 0)');
      return;
    }
    if (!transactionDate) {
      setErrorMsg('Harap tentukan tanggal sesi transaksi');
      return;
    }

    onSave(
      {
        inputDate: inputDate || getTodayDateString(),
        transactionDate: transactionDate || getTodayDateString(),
        streamerId,
        platform,
        amount,
        sessionTitle: sessionTitle.trim() || 'Sesi Live Reguler',
        orderCount: orderCount ? parseInt(orderCount, 10) : undefined,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      editingRecord?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              {editingRecord ? 'Edit Pencatatan Uang Masuk' : 'Input Uang Masuk Live Streaming'}
            </h3>
            <p className="text-xs text-indigo-200">
              Pencatatan nominal pendapatan live Shopee & Tokopedia per streamer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <span className="font-semibold">Perhatian:</span> {errorMsg}
            </div>
          )}

          {/* 1. Pilih Live Streamer (4 Pilihan Utama: Nata, Dona, Nina, Fawwas) */}
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
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
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

          {/* 2. Platform (Shopee vs Tokopedia) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-orange-500" />
              Platform E-Commerce
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Shopee Button */}
              <button
                type="button"
                onClick={() => setPlatform('shopee')}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2.5 ${
                  platform === 'shopee'
                    ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-orange-50/50'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    platform === 'shopee' ? 'bg-white' : 'bg-[#EE4D2D]'
                  }`}
                />
                Shopee Live
              </button>

              {/* Tokopedia Button */}
              <button
                type="button"
                onClick={() => setPlatform('tokopedia')}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2.5 ${
                  platform === 'tokopedia'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/40'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50/50'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    platform === 'tokopedia' ? 'bg-white' : 'bg-[#03AC0E]'
                  }`}
                />
                Tokopedia Live
              </button>
            </div>
          </div>

          {/* 3. Nominal Input (Besar & Jelas) */}
          <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Nominal Uang Masuk (Rp)
              </label>
              {amount > 0 && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {formatIDR(amount)}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Cepat:</span>
              {QUICK_NOMINAL_BUTTONS.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleQuickAddAmount(btn.value)}
                  className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
                >
                  {btn.label}
                </button>
              ))}
              {amount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAmount}
                  className="px-2 py-1 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* 4. Tanggal Sesi & Tanggal Input */}
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
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 5. Sesi Live Presets & Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sesi Live Streaming / Jam
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Contoh: Sesi Sore 16:30 - 19:00"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {/* 6. No. Ref & Jumlah Order (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                No. Bukti / Ref Settle (Opsional)
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. SP-261109-01"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Jumlah Order Checkout (Opsional)
              </label>
              <input
                type="number"
                min="0"
                value={orderCount}
                onChange={(e) => setOrderCount(e.target.value)}
                placeholder="e.g. 150 pesanan"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 7. Catatan / Promo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Promo / Produk Utama (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Flash Sale 11.11, Diskon 50% Skincare"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingRecord ? 'Perbarui Catatan' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
