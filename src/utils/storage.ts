import { IncomeRecord } from '../types';
import { INITIAL_SAMPLE_RECORDS } from './sampleData';

const STORAGE_KEY = 'streampay_income_records_v1';
const CLEARED_FLAG_KEY = 'streampay_db_cleared_v1';
const INITIALIZED_FLAG_KEY = 'streampay_has_initialized_v1';

export function isDatabaseCleared(): boolean {
  try {
    return localStorage.getItem(CLEARED_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function loadRecordsFromStorage(): IncomeRecord[] {
  try {
    // If the database has been cleared by the user, keep it completely empty even after page refresh!
    if (isDatabaseCleared()) {
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // If already initialized before, do not recreate sample data
      if (localStorage.getItem(INITIALIZED_FLAG_KEY) === 'true') {
        return [];
      }
      // First time initialization ever
      localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
      saveRecordsToStorage(INITIAL_SAMPLE_RECORDS);
      return INITIAL_SAMPLE_RECORDS;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Failed to load records from storage:', error);
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
  try {
    // Set permanent flag that database was wiped by user so refresh stays empty
    localStorage.setItem(CLEARED_FLAG_KEY, 'true');
    localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
    saveRecordsToStorage([]);
  } catch (error) {
    console.error('Failed to set cleared flag:', error);
  }
  return [];
}

export function resetRecordsToSample(): IncomeRecord[] {
  try {
    // Remove the cleared flag so sample records can be restored
    localStorage.removeItem(CLEARED_FLAG_KEY);
    localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
    saveRecordsToStorage(INITIAL_SAMPLE_RECORDS);
  } catch (error) {
    console.error('Failed to reset sample records:', error);
  }
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
