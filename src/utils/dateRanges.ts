import { MONTH_NAMES_ID } from '../constants';
import { formatDateIndo } from './formatters';
import { DateRangeInfo, PeriodType } from '../types';

export function padZero(num: number): string {
  return String(num).padStart(2, '0');
}

export function formatDateYMD(d: Date): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

// 1. Daily Range
export function getDailyRange(dateStr: string): DateRangeInfo {
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(y, m, day);

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = dayNames[d.getDay()];
  const monthName = MONTH_NAMES_ID[m];

  return {
    type: 'daily',
    startDate: dateStr,
    endDate: dateStr,
    label: `${dayName}, ${day} ${monthName} ${y}`,
  };
}

// 2. Weekly Range (Senin - Minggu)
export function getWeeklyRange(anchorDateStr: string): DateRangeInfo {
  const parts = anchorDateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const current = new Date(y, m, day);

  // Day of week (0 is Sunday, 1 is Monday ... 6 is Saturday)
  const dayOfWeek = current.getDay();
  // We want Monday as day 0
  const distanceToMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(current);
  monday.setDate(current.getDate() - distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startStr = formatDateYMD(monday);
  const endStr = formatDateYMD(sunday);

  return {
    type: 'weekly',
    startDate: startStr,
    endDate: endStr,
    label: `Minggu (${formatDateIndo(startStr, false)} s/d ${formatDateIndo(endStr, false)})`,
  };
}

// 3. Monthly Range
export function getMonthlyRange(year: number, month: number): DateRangeInfo {
  const monthName = MONTH_NAMES_ID[month - 1];
  const lastDay = new Date(year, month, 0).getDate();
  const startStr = `${year}-${padZero(month)}-01`;
  const endStr = `${year}-${padZero(month)}-${padZero(lastDay)}`;

  return {
    type: 'monthly',
    startDate: startStr,
    endDate: endStr,
    label: `Bulan ${monthName} ${year}`,
  };
}

// 4. Yearly Range
export function getYearlyRange(year: number): DateRangeInfo {
  return {
    type: 'yearly',
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    label: `Tahun ${year}`,
  };
}

// 5. Custom Range
export function getCustomRange(startStr: string, endStr: string): DateRangeInfo {
  // Ensure start is not after end
  let actualStart = startStr;
  let actualEnd = endStr;
  if (actualStart > actualEnd) {
    const temp = actualStart;
    actualStart = actualEnd;
    actualEnd = temp;
  }

  return {
    type: 'custom',
    startDate: actualStart,
    endDate: actualEnd,
    label: `${formatDateIndo(actualStart, false)} s/d ${formatDateIndo(actualEnd, false)}`,
  };
}
