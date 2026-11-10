import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IncomeRecord, StreamerMonthlyStats } from '../types';
import { MONTH_NAMES_ID, PLATFORMS } from '../constants';
import { formatIDR, formatDateIndo } from './formatters';

export function exportPeriodReportToPdf(
  records: IncomeRecord[],
  stats: StreamerMonthlyStats[],
  periodLabel: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalIncome = stats.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalShopee = stats.reduce((sum, s) => sum + s.shopeeIncome, 0);
  const totalTokped = stats.reduce((sum, s) => sum + s.tokpedIncome, 0);
  const totalSessions = stats.reduce((sum, s) => sum + s.sessionCount, 0);

  // Brand Header
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 28, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN PENCATATAN UANG MASUK LIVE STREAMER', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`SHOPEE LIVE & TOKOPEDIA LIVE  |  PERIODE: ${periodLabel.toUpperCase()}`, 14, 18);
  doc.text(
    `Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    14,
    23
  );

  // Summary Cards Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RINGKASAN OMSET PERIODE INI', 14, 37);

  // 3 Mini summary boxes
  // Box 1: Total Omset
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 40, 58, 20, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL UANG MASUK', 18, 46);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatIDR(totalIncome), 18, 54);

  // Box 2: Shopee
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(76, 40, 58, 20, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(194, 65, 12);
  doc.text('SHOPEE LIVE', 80, 46);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text(formatIDR(totalShopee), 80, 54);

  // Box 3: Tokopedia
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(138, 40, 58, 20, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text('TOKOPEDIA LIVE', 142, 46);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(formatIDR(totalTokped), 142, 54);

  // Section 2: Table Rekap Streamer
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. REKAPITULASI PER LIVE STREAMER (Nata, Dona, Nina, Fawwas)', 14, 69);

  const streamerTableRows = stats.map((item, idx) => [
    `${idx + 1}`,
    item.streamer.name,
    formatIDR(item.shopeeIncome),
    formatIDR(item.tokpedIncome),
    formatIDR(item.totalIncome),
    `${item.percentageOfTotal.toFixed(1)}%`,
    `${item.sessionCount} Sesi`,
  ]);

  // Push total row
  streamerTableRows.push([
    '',
    'TOTAL KESELURUHAN',
    formatIDR(totalShopee),
    formatIDR(totalTokped),
    formatIDR(totalIncome),
    '100%',
    `${totalSessions} Sesi`,
  ]);

  autoTable(doc, {
    startY: 73,
    head: [
      ['No', 'Streamer', 'Shopee Live', 'Tokopedia Live', 'Total Nominal', 'Kontribusi', 'Total Sesi'],
    ],
    body: streamerTableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 34 },
      5: { halign: 'center', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 20 },
    },
    didParseCell: (data) => {
      // Bold the total row
      if (data.row.index === streamerTableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  // Section 3: Detail Records Table
  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('3. RINCIAN TRANSAKSI MASUK', 14, finalY + 10);

  const detailRows = records.map((r, idx) => [
    `${idx + 1}`,
    formatDateIndo(r.transactionDate, false),
    formatDateIndo(r.inputDate, false),
    r.streamerId.toUpperCase(),
    PLATFORMS[r.platform]?.shortName || r.platform,
    r.sessionTitle || '-',
    r.receiptNumber || '-',
    formatIDR(r.amount),
  ]);

  autoTable(doc, {
    startY: finalY + 14,
    head: [
      ['No', 'Tgl Sesi', 'Tgl Input', 'Streamer', 'Platform', 'Sesi Live', 'No. Ref', 'Nominal (Rp)'],
    ],
    body: detailRows.length > 0 ? detailRows : [['-', '-', '-', '-', '-', 'Belum ada transaksi di periode ini', '-', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { fontStyle: 'bold', cellWidth: 20 },
      4: { cellWidth: 22 },
      5: { cellWidth: 38 },
      6: { cellWidth: 22 },
      7: { halign: 'right', fontStyle: 'bold', cellWidth: 28 },
    },
  });

  // Signature section at bottom
  const pageCount = doc.getNumberOfPages();
  doc.setPage(pageCount);
  const finalDetailY = (doc as any).lastAutoTable?.finalY || 200;

  let sigY = finalDetailY + 15;
  if (sigY > 245) {
    doc.addPage();
    sigY = 30;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Disiapkan Oleh:', 24, sigY);
  doc.text('( Admin Live Streaming )', 20, sigY + 22);

  doc.text('Mengetahui & Menyetujui:', 140, sigY);
  doc.text('( Owner / Finance Lead )', 138, sigY + 22);

  const cleanLabel = periodLabel.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  doc.save(`Laporan_Live_Streamer_${cleanLabel}.pdf`);
}

// Backward-compatible wrapper
export function exportMonthlyReportToPdf(
  records: IncomeRecord[],
  stats: StreamerMonthlyStats[],
  month: number,
  year: number
): void {
  const monthName = MONTH_NAMES_ID[month - 1];
  exportPeriodReportToPdf(records, stats, `${monthName} ${year}`);
}
