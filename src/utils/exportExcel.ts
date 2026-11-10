import * as XLSX from 'xlsx';
import { IncomeRecord, StreamerMonthlyStats } from '../types';
import { MONTH_NAMES_ID, PLATFORMS } from '../constants';
import { formatDateIndo } from './formatters';

export function exportPeriodReportToExcel(
  records: IncomeRecord[],
  stats: StreamerMonthlyStats[],
  periodLabel: string
): void {
  const totalIncome = stats.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalShopee = stats.reduce((sum, s) => sum + s.shopeeIncome, 0);
  const totalTokped = stats.reduce((sum, s) => sum + s.tokpedIncome, 0);
  const totalSessions = stats.reduce((sum, s) => sum + s.sessionCount, 0);
  const totalOrders = stats.reduce((sum, s) => sum + s.totalOrders, 0);

  // Sheet 1: Ringkasan Periode
  const summaryData: (string | number)[][] = [
    ['LAPORAN PENCATATAN UANG MASUK LIVE STREAMING'],
    [`Periode: ${periodLabel}`],
    [`Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`],
    [],
    ['RINGKASAN TOTAL OMSET PERIODE INI'],
    ['Kategori', 'Nominal (Rp)', 'Keterangan'],
    ['Total Uang Masuk', totalIncome, 'Total keseluruhan Shopee & Tokopedia'],
    ['Total Shopee Live', totalShopee, `${((totalShopee / (totalIncome || 1)) * 100).toFixed(1)}% dari total`],
    ['Total Tokopedia Live', totalTokped, `${((totalTokped / (totalIncome || 1)) * 100).toFixed(1)}% dari total`],
    ['Total Sesi Live', totalSessions, 'Sesi'],
    ['Total Pesanan / Order', totalOrders, 'Checkout'],
    [],
    ['REKAPITULASI PER LIVE STREAMER (Nata, Dona, Nina, Fawwas)'],
    [
      'No',
      'Nama Streamer',
      'Shopee Live (Rp)',
      'Tokopedia Live (Rp)',
      'Total Masuk (Rp)',
      'Kontribusi (%)',
      'Jumlah Sesi',
      'Total Order',
      'Rata-rata/Sesi (Rp)',
    ],
  ];

  stats.forEach((item, idx) => {
    summaryData.push([
      idx + 1,
      item.streamer.name,
      item.shopeeIncome,
      item.tokpedIncome,
      item.totalIncome,
      Number(item.percentageOfTotal.toFixed(1)),
      item.sessionCount,
      item.totalOrders,
      Math.round(item.avgPerSession),
    ]);
  });

  summaryData.push([
    '',
    'TOTAL',
    totalShopee,
    totalTokped,
    totalIncome,
    100,
    totalSessions,
    totalOrders,
    Math.round(totalIncome / (totalSessions || 1)),
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
  ];

  // Sheet 2: Rincian Transaksi
  const detailData: (string | number)[][] = [
    [
      'No',
      'Tanggal Input',
      'Tanggal Sesi',
      'Streamer',
      'Platform',
      'Nominal Masuk (Rp)',
      'Sesi Live',
      'No. Ref / Bukti',
      'Order Count',
      'Catatan / Promo',
    ],
  ];

  records.forEach((rec, idx) => {
    detailData.push([
      idx + 1,
      formatDateIndo(rec.inputDate, false),
      formatDateIndo(rec.transactionDate, false),
      rec.streamerId.toUpperCase(),
      PLATFORMS[rec.platform]?.name || rec.platform,
      rec.amount,
      rec.sessionTitle || '-',
      rec.receiptNumber || '-',
      rec.orderCount || 0,
      rec.notes || '-',
    ]);
  });

  // Total row at bottom
  detailData.push([
    '',
    '',
    '',
    'TOTAL',
    '',
    records.reduce((sum, r) => sum + r.amount, 0),
    '',
    '',
    records.reduce((sum, r) => sum + (r.orderCount || 0), 0),
    '',
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet(detailData);

  wsDetail['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 26 },
    { wch: 18 },
    { wch: 14 },
    { wch: 35 },
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rincian Transaksi');

  // Clean filename
  const cleanLabel = periodLabel.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const fileName = `Laporan_Live_Streamer_${cleanLabel}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Backward-compatible wrapper
export function exportMonthlyReportToExcel(
  records: IncomeRecord[],
  stats: StreamerMonthlyStats[],
  month: number,
  year: number
): void {
  const monthName = MONTH_NAMES_ID[month - 1];
  exportPeriodReportToExcel(records, stats, `${monthName} ${year}`);
}
