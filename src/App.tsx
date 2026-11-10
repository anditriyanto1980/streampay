import React, { useState, useEffect, useMemo } from 'react';
import { IncomeRecord, StreamerId, PlatformId, StreamerMonthlyStats } from './types';
import { STREAMERS, STREAMER_LIST, MONTH_NAMES_ID } from './constants';
import {
  loadRecordsFromStorage,
  saveRecordsToStorage,
  resetRecordsToSample,
  clearAllDatabaseRecords,
  exportDataAsJson,
} from './utils/storage';
import { INITIAL_SAMPLE_RECORDS } from './utils/sampleData';
import { exportMonthlyReportToExcel } from './utils/exportExcel';
import { exportMonthlyReportToPdf } from './utils/exportPdf';
import { formatIDR, getTodayDateString } from './utils/formatters';
import {
  auth,
  testConnection,
  subscribeToIncomeRecords,
  saveIncomeRecordToFirestore,
  deleteIncomeRecordFromFirestore,
  clearAllIncomeRecordsFromFirestore,
  seedInitialDataIfEmpty,
  loginWithGoogle,
  logoutUser,
} from './firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { StreamerCardsGrid } from './components/StreamerCardsGrid';
import { MonthlyReportView } from './components/MonthlyReportView';
import { TransactionTable } from './components/TransactionTable';
import { TransactionFormModal } from './components/TransactionFormModal';
import { ClearDatabaseModal } from './components/ClearDatabaseModal';
import {
  Layers,
  TrendingUp,
  CheckCircle,
  Cloud,
} from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return new Date().getMonth() + 1; // 1 - 12
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear();
  });

  const [selectedStreamer, setSelectedStreamer] = useState<StreamerId | 'all'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'rekap' | 'tabel'>('rekap');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and subscribe to Firebase Firestore in real-time
  useEffect(() => {
    // 1. Load initial cache from local storage first for instant rendering
    const local = loadRecordsFromStorage();
    if (local && local.length > 0) {
      setRecords(local);
    }

    // 2. Test Firebase connection
    testConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    // 3. Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // 4. Seed initial records if Firestore is completely empty
    seedInitialDataIfEmpty(INITIAL_SAMPLE_RECORDS);

    // 5. Realtime listener to Firestore collection
    const unsubscribeSnapshot = subscribeToIncomeRecords(
      (liveRecords) => {
        setRecords(liveRecords);
        saveRecordsToStorage(liveRecords);
        setIsCloudConnected(true);
      },
      (error) => {
        console.warn('Realtime sync fallback to local cache:', error);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  // Show temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter records by selected Month and Year
  const monthlyRecords = useMemo(() => {
    return records.filter((r) => {
      if (!r.transactionDate) return false;
      const parts = r.transactionDate.split('-');
      if (parts.length < 2) return false;
      const recYear = parseInt(parts[0], 10);
      const recMonth = parseInt(parts[1], 10);
      return recYear === selectedYear && recMonth === selectedMonth;
    });
  }, [records, selectedMonth, selectedYear]);

  // Compute stats for all 4 streamers (Nata, Dona, Nina, Fawwas)
  const monthlyStats: StreamerMonthlyStats[] = useMemo(() => {
    const totalMonthIncome = monthlyRecords.reduce((sum, r) => sum + r.amount, 0);

    return STREAMER_LIST.map((profile) => {
      const streamerRecs = monthlyRecords.filter((r) => r.streamerId === profile.id);
      const totalIncome = streamerRecs.reduce((sum, r) => sum + r.amount, 0);
      const shopeeIncome = streamerRecs
        .filter((r) => r.platform === 'shopee')
        .reduce((sum, r) => sum + r.amount, 0);
      const tokpedIncome = streamerRecs
        .filter((r) => r.platform === 'tokopedia')
        .reduce((sum, r) => sum + r.amount, 0);
      const sessionCount = streamerRecs.length;
      const totalOrders = streamerRecs.reduce((sum, r) => sum + (r.orderCount || 0), 0);
      const percentageOfTotal = totalMonthIncome > 0 ? (totalIncome / totalMonthIncome) * 100 : 0;
      const avgPerSession = sessionCount > 0 ? totalIncome / sessionCount : 0;

      return {
        streamer: profile,
        totalIncome,
        shopeeIncome,
        tokpedIncome,
        sessionCount,
        totalOrders,
        percentageOfTotal,
        avgPerSession,
      };
    });
  }, [monthlyRecords]);

  const totalIncomeThisMonth = useMemo(() => {
    return monthlyStats.reduce((sum, s) => sum + s.totalIncome, 0);
  }, [monthlyStats]);

  // Handle Save (writes to Firebase Firestore + local cache)
  const handleSaveTransaction = async (
    formData: Omit<IncomeRecord, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Update
      const existing = records.find((r) => r.id === existingId);
      const updatedRec: IncomeRecord = {
        ...formData,
        id: existingId,
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      const updated = records.map((r) => (r.id === existingId ? updatedRec : r));
      setRecords(updated);
      saveRecordsToStorage(updated);

      try {
        await saveIncomeRecordToFirestore(updatedRec);
      } catch (err) {
        console.error('Failed to update in Firestore:', err);
      }

      showToast('Data pencatatan uang masuk berhasil diperbarui!');
    } else {
      // Create new
      const newRec: IncomeRecord = {
        ...formData,
        id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newRec, ...records];
      setRecords(updated);
      saveRecordsToStorage(updated);

      try {
        await saveIncomeRecordToFirestore(newRec);
      } catch (err) {
        console.error('Failed to create in Firestore:', err);
      }

      showToast(`Pencatatan uang masuk ${formatIDR(formData.amount)} berhasil ditambahkan ke Cloud!`);
    }
    setEditingRecord(null);
  };

  // Handle Delete (deletes from Firebase Firestore + local cache)
  const handleDeleteTransaction = async (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveRecordsToStorage(updated);

    try {
      await deleteIncomeRecordFromFirestore(id);
    } catch (err) {
      console.error('Failed to delete from Firestore:', err);
    }

    showToast('Catatan transaksi berhasil dihapus.');
  };

  // Handle Reset to sample
  const handleResetData = async () => {
    if (confirm('Kembalikan data ke contoh awal bawaan sistem?')) {
      const sample = resetRecordsToSample();
      setRecords(sample);

      try {
        await clearAllIncomeRecordsFromFirestore();
        await seedInitialDataIfEmpty(sample);
      } catch (err) {
        console.error('Reset firestore error:', err);
      }

      showToast('Data berhasil di-reset ke sample data awal.');
    }
  };

  // Handle Clear Entire Database (Confirmed via master password modal)
  const handleConfirmClearDatabase = async () => {
    const cleared = clearAllDatabaseRecords();
    setRecords(cleared);

    try {
      await clearAllIncomeRecordsFromFirestore();
    } catch (err) {
      console.error('Clear firestore error:', err);
    }

    showToast('Seluruh database transaksi di Cloud Firestore berhasil dikosongkan.');
  };

  // Handle Backup JSON
  const handleBackupJson = () => {
    exportDataAsJson(records);
    showToast('File backup data JSON berhasil diunduh.');
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        setUser(loggedUser);
        showToast(`Selamat datang, ${loggedUser.displayName || loggedUser.email}!`);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // Google Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      showToast('Anda telah keluar dari akun.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    exportMonthlyReportToExcel(monthlyRecords, monthlyStats, selectedMonth, selectedYear);
    showToast(`Laporan Excel bulan ${MONTH_NAMES_ID[selectedMonth - 1]} ${selectedYear} berhasil diunduh!`);
  };

  // Export PDF
  const handleExportPdf = () => {
    exportMonthlyReportToPdf(monthlyRecords, monthlyStats, selectedMonth, selectedYear);
    showToast(`Laporan PDF bulan ${MONTH_NAMES_ID[selectedMonth - 1]} ${selectedYear} berhasil diunduh!`);
  };

  const handleOpenEdit = (rec: IncomeRecord) => {
    setEditingRecord(rec);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenNewTransaction={handleOpenCreate}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onResetData={handleResetData}
        onOpenClearDatabase={() => setIsClearModalOpen(true)}
        onBackupJson={handleBackupJson}
        totalIncomeThisMonth={totalIncomeThisMonth}
        monthName={MONTH_NAMES_ID[selectedMonth - 1]}
        year={selectedYear}
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        isCloudConnected={isCloudConnected}
      />

      {/* Hero Sub-header / Quick Metrics */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Cloud className="w-3 h-3 text-indigo-500" />
                Firebase Cloud Connected
              </span>
              <span className="text-xs text-slate-400">• Shopee & Tokopedia Live</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Rekap Pendapatan 4 Live Streamer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pencatatan real-time uang masuk untuk <b>Nata</b>, <b>Dona</b>, <b>Nina</b>, dan <b>Fawwas</b> terhubung ke cloud database.
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('rekap')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rekap'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Rekap & Laporan</span>
            </button>
            <button
              onClick={() => setActiveTab('tabel')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tabel'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Daftar Transaksi ({monthlyRecords.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 w-full">
        {/* Streamers 4 Grid (Always prominent at top) */}
        <StreamerCardsGrid
          stats={monthlyStats}
          selectedStreamer={selectedStreamer}
          onSelectStreamer={(sId) => {
            setSelectedStreamer(sId);
          }}
          monthName={MONTH_NAMES_ID[selectedMonth - 1]}
          year={selectedYear}
        />

        {/* Tab 1: Rekap & Laporan Bulanan */}
        {activeTab === 'rekap' && (
          <div className="space-y-6">
            <MonthlyReportView
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              stats={monthlyStats}
              records={monthlyRecords}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
            />

            {/* Quick Preview of Transactions below report */}
            <TransactionTable
              records={monthlyRecords}
              selectedStreamer={selectedStreamer}
              onSelectStreamer={setSelectedStreamer}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTransaction}
              onOpenNewTransaction={handleOpenCreate}
            />
          </div>
        )}

        {/* Tab 2: Full Transactions Table View */}
        {activeTab === 'tabel' && (
          <div className="space-y-6">
            <TransactionTable
              records={records}
              selectedStreamer={selectedStreamer}
              onSelectStreamer={setSelectedStreamer}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTransaction}
              onOpenNewTransaction={handleOpenCreate}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">StreamPay</span>
            <span>•</span>
            <span>Pencatatan Live Streamer: Nata, Dona, Nina, Fawwas</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              <Cloud className="w-3 h-3" /> Firebase Firestore
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-orange-600 font-semibold">Shopee Live</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Tokopedia Live</span>
            <span>•</span>
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors underline decoration-dotted"
            >
              Hapus Seluruh Database
            </button>
          </div>
        </div>
      </footer>

      {/* Form Modal for Add/Edit */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveTransaction}
        editingRecord={editingRecord}
      />

      {/* Clear Database Modal Protected with Master Password */}
      <ClearDatabaseModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirmClear={handleConfirmClearDatabase}
        onBackupJson={handleBackupJson}
        recordCount={records.length}
      />
    </div>
  );
}
