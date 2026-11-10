import { IncomeRecord } from '../types';
import { INITIAL_SAMPLE_RECORDS } from './sampleData';

const STORAGE_KEY = 'streampay_income_records_v1';

export function loadRecordsFromStorage(): IncomeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First time initialization
      saveRecordsToStorage(INITIAL_SAMPLE_RECORDS);
      return INITIAL_SAMPLE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Failed to load records from storage, using initial data:', error);
    return [];
  }
}

export function saveRecordsToStorage(records: IncomeRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save records to storage:', error);
  }
}

export function clearAllDatabaseRecords(): IncomeRecord[] {
  saveRecordsToStorage([]);
  return [];
}

export function resetRecordsToSample(): IncomeRecord[] {
  saveRecordsToStorage(INITIAL_SAMPLE_RECORDS);
  return INITIAL_SAMPLE_RECORDS;
}

export function exportDataAsJson(records: IncomeRecord[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `streampay_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
