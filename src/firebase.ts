import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { IncomeRecord } from './types';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
      return false;
    }
    // Any permission check is normal for uncreated test doc
    return true;
  }
}

const COLLECTION_NAME = 'incomeRecords';

// Real-time synchronization for all live records
export function subscribeToIncomeRecords(
  onData: (records: IncomeRecord[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: IncomeRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        records.push({
          id: d.id,
          inputDate: data.inputDate,
          transactionDate: data.transactionDate,
          streamerId: data.streamerId,
          platform: data.platform,
          amount: Number(data.amount) || 0,
          sessionTitle: data.sessionTitle || '',
          orderCount: data.orderCount ? Number(data.orderCount) : undefined,
          receiptNumber: data.receiptNumber || undefined,
          notes: data.notes || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      // Sort newest transaction date first
      records.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
      onData(records);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
      } catch (e) {
        if (onError && e instanceof Error) {
          onError(e);
        }
      }
    }
  );
}

export async function saveIncomeRecordToFirestore(record: IncomeRecord): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, record.id);
  try {
    await setDoc(docRef, {
      id: record.id,
      inputDate: record.inputDate,
      transactionDate: record.transactionDate,
      streamerId: record.streamerId,
      platform: record.platform,
      amount: record.amount,
      sessionTitle: record.sessionTitle,
      orderCount: record.orderCount || null,
      receiptNumber: record.receiptNumber || null,
      notes: record.notes || null,
      createdAt: record.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${record.id}`);
  }
}

export async function deleteIncomeRecordFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function clearAllIncomeRecordsFromFirestore(): Promise<void> {
  const colRef = collection(db, COLLECTION_NAME);
  try {
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
  }
}

export async function seedInitialDataIfEmpty(initialRecords: IncomeRecord[]): Promise<void> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialRecords.length > 0) {
      const batch = writeBatch(db);
      initialRecords.forEach((rec) => {
        const docRef = doc(db, COLLECTION_NAME, rec.id);
        batch.set(docRef, rec);
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('Initial seed check error:', error);
  }
}

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
