import React from 'react';
import {
  Video,
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Download,
  RotateCcw,
  Trash2,
  Cloud,
  LogIn,
  LogOut,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onResetData: () => void;
  onOpenClearDatabase: () => void;
  onBackupJson: () => void;
  totalIncomeThisMonth: number;
  monthName?: string;
  year?: number;
  periodLabel?: string;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isCloudConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTransaction,
  onExportExcel,
  onExportPdf,
  onResetData,
  onOpenClearDatabase,
  onBackupJson,
  user,
  onLogin,
  onLogout,
  isCloudConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  StreamPay
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Shopee
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Tokopedia
                </span>
                {/* Firebase Cloud status badge */}
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800"
                  title="Tersinkronisasi dengan Firebase Cloud Firestore secara realtime"
                >
                  <Cloud className="w-3 h-3 text-indigo-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden lg:inline">Firebase Live</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Pencatatan Uang Masuk Live Streamer • Powered By : Andi Triyanto
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Export buttons */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={onExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-xs"
                title="Unduh Laporan Format Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={onExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-xs"
                title="Unduh Laporan Format PDF"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>PDF</span>
              </button>
            </div>

            {/* Utility buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onBackupJson}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Backup Data JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Kembalikan Contoh Sample Awal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenClearDatabase}
                className="p-2 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                title="Hapus Seluruh Database (Kata Kunci Master)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Google Auth Status / Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <div
                  className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300 overflow-hidden ring-1 ring-indigo-300"
                  title={user.email || 'Pengguna'}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                title="Login dengan Google"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Masuk</span>
              </button>
            )}

            {/* Primary Add Button */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Input Uang Masuk</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
