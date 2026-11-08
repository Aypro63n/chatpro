import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../lib/firebase';

/**
 * Diagnostic utility to test Firebase Storage connectivity, CORS, Storage Rules, and permission scopes.
 * Attempts to write, get download URL, and delete a 1KB test blob.
 */
export async function runFirebaseStorageDiagnostic(): Promise<{ success: boolean; error?: any }> {
  console.log('--------------------------------------------------');
  console.log('[Storage Diagnostic] Starting Firebase Storage diagnostic test...');
  console.log('--------------------------------------------------');

  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn('[Storage Diagnostic] ⚠️ No authenticated user found. Tests requiring auth may fail if storage rules enforce request.auth != null.');
  } else {
    console.log('[Storage Diagnostic] ✓ Authenticated user UID:', currentUser.uid);
  }

  const bucketName = storage.app.options.storageBucket || 'unknown-bucket';
  console.log('[Storage Diagnostic] Target Storage Bucket:', bucketName);

  // Create a 1KB test blob
  const oneKilobyteData = new Uint8Array(1024).fill(65); // 1KB of 'A'
  const testBlob = new Blob([oneKilobyteData], { type: 'text/plain' });
  const testPath = `diagnostics/${currentUser?.uid || 'anonymous'}/test_1kb_${Date.now()}.txt`;
  const testRef = ref(storage, testPath);

  try {
    // Step 1: Write test
    console.log(`[Storage Diagnostic] Step 1/3: Attempting to write 1KB test blob to "${testPath}"...`);
    const startTime = performance.now();
    const snapshot = await uploadBytes(testRef, testBlob);
    const duration = Math.round(performance.now() - startTime);
    console.log(`[Storage Diagnostic] ✅ WRITE SUCCESS (${duration}ms):`, snapshot.ref.fullPath);

    // Step 2: Read / Download URL test
    console.log('[Storage Diagnostic] Step 2/3: Attempting to retrieve download URL...');
    const downloadURL = await getDownloadURL(testRef);
    console.log('[Storage Diagnostic] ✅ READ SUCCESS (Download URL):', downloadURL);

    // Step 3: Delete / Cleanup test
    console.log('[Storage Diagnostic] Step 3/3: Attempting to delete test blob...');
    await deleteObject(testRef);
    console.log('[Storage Diagnostic] ✅ DELETE SUCCESS: Test blob successfully cleaned up.');

    console.log('--------------------------------------------------');
    console.log('[Storage Diagnostic] 🎉 ALL STORAGE TESTS PASSED SUCCESSFULLY! CORS, Rules, and Network are fully operational.');
    console.log('--------------------------------------------------');
    return { success: true };
  } catch (error: any) {
    console.error('--------------------------------------------------');
    console.error('[Storage Diagnostic] ❌ STORAGE DIAGNOSTIC FAILED');
    console.error('[Storage Diagnostic] Error Code:', error.code || 'UNKNOWN_CODE');
    console.error('[Storage Diagnostic] Error Message:', error.message || error);
    console.error('[Storage Diagnostic] Possible Causes:');
    console.error('  1. CORS policy blocking the request (check CORS configuration on your Firebase Storage bucket).');
    console.error('  2. Firebase Storage Security Rules rejecting the write/delete (check rules for /diagnostics/{userId}/{allPaths=**}).');
    console.error('  3. Network connectivity or ad-blocker blocking Googleapis storage domain.');
    console.error('--------------------------------------------------');
    return { success: false, error };
  }
}
