import React, { useState } from 'react';
import { AlertTriangle, Lock, Eye, EyeOff, X, Trash2, Download } from 'lucide-react';

interface ClearDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  onBackupJson: () => void;
  recordCount: number;
}

// Master secret key specified by the administrator (never displayed in the UI)
const DEFAULT_MASTER_KEY = 'online2026';

export const ClearDatabaseModal: React.FC<ClearDatabaseModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  onBackupJson,
  recordCount,
}) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setPasswordInput('');
    setErrorMsg('');
    setIsDeleting(false);
    onClose();
  };

  const handleExecuteWipe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!passwordInput.trim()) {
      setErrorMsg('Harap masukkan kata kunci otorisasi');
      return;
    }

    // Verify against master authorization key
    if (passwordInput.trim() !== DEFAULT_MASTER_KEY) {
      setErrorMsg('Kata kunci otorisasi salah. Penghapusan database ditolak.');
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      onConfirmClear();
      handleClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-950/80 overflow-hidden">
        {/* Header with Danger Accent */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Hapus Seluruh Database</h3>
              <p className="text-xs text-rose-100">Otorisasi Khusus Administrator</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleExecuteWipe} className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>PERINGATAN PENGHAPUSAN PERMANEN</span>
            </div>
            <p className="leading-relaxed">
              Tindakan ini akan menghapus <strong>{recordCount} data transaksi</strong> secara permanen dari memori sistem. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          {/* Quick backup CTA before wiping */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <span className="text-slate-600 dark:text-slate-300">Amankan salinan data terlebih dahulu?</span>
            <button
              type="button"
              onClick={onBackupJson}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Backup</span>
            </button>
          </div>

          {/* Secret Password Authorization Field */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              Kata Kunci Otorisasi Master (Wajib)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan kata kunci rahasia..."
                autoFocus
                className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 pt-0.5">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isDeleting || !passwordInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Menghapus...' : 'Hapus Seluruh Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
