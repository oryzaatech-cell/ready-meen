import { readFileSync } from 'fs';

let firebaseAdmin = null;
let firebaseInitialized = false;

async function initFirebase() {
  if (firebaseInitialized) return true;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    return false;
  }

  try {
    const mod = await import('firebase-admin');
    firebaseAdmin = mod.default;
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    return true;
  } catch (err) {
    console.warn('Firebase init skipped:', err.message);
    return false;
  }
}

/**
 * Send push notification to a user via FCM.
 * Requires the user to have an fcm_token stored in the users table.
 * Silently skips if Firebase is not configured.
 */
export async function sendNotification(userId, { title, body, data = {} }) {
  const ready = await initFirebase();
  if (!ready) return;

  try {
    const { default: supabase } = await import('../config/supabase.js');

    const { data: user } = await supabase
      .from('user_info')
      .select('fcm_token')
      .eq('id', userId)
      .single();

    if (!user?.fcm_token) return;

    await firebaseAdmin.messaging().send({
      token: user.fcm_token,
      notification: { title, body },
      data,
    });
  } catch (err) {
    console.warn('Push notification failed:', err.message);
  }
}
