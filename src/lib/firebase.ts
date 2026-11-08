import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connection health test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
  }
}
testConnection();

// Diagnostic utility function to test Firebase Storage connectivity and permission scopes
export async function testStorageConnectivity(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    console.log('[Storage Diagnostics] Skipping storage connectivity test: No user signed in.');
    return false;
  }

  const testRef = ref(storage, `diagnostics/${user.uid}/test_${Date.now()}.txt`);
  const testBlob = new Blob(['Firebase Storage diagnostic test payload'], { type: 'text/plain' });

  try {
    console.log('[Storage Diagnostics] Testing storage connectivity and write permissions to bucket:', storage.app.options.storageBucket);
    const snapshot = await uploadBytes(testRef, testBlob);
    console.log('[Storage Diagnostics] SUCCESS: Write permission verified. Uploaded test file to:', snapshot.ref.fullPath);
    
    // Clean up test file
    await deleteObject(testRef);
    console.log('[Storage Diagnostics] SUCCESS: Delete permission verified. Test file cleaned up.');
    return true;
  } catch (err: any) {
    console.error('[Storage Diagnostics] FAILED: Storage permission or connectivity error:', err.code, err.message, err);
    return false;
  }
}

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
