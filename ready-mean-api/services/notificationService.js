import { readFileSync } from 'fs';

let firebaseAdmin = null;
let firebaseInitialized = false;

async function initFirebase() {
  if (firebaseInitialized) return true;

  try {
    let serviceAccount = null;

    // Option 1: JSON string in env var (for Vercel/production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    // Option 2: File path (for local development)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      serviceAccount = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
    }

    if (!serviceAccount) return false;

    const mod = await import('firebase-admin');
    firebaseAdmin = mod.default;
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
 * Send notification to a user — saves to DB + sends FCM push if available.
 */
export async function sendNotification(userId, { title, body, data = {} }) {
  const { default: supabase } = await import('../config/supabase.js');

  // Always save to DB for in-app notifications
  try {
    const { error: dbError } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      type: data.type || 'order',
      order_id: data.order_id ? Number(data.order_id) : null,
    });
    if (dbError) console.warn('Failed to save notification:', dbError.message);
  } catch (err) {
    console.warn('Failed to save notification to DB:', err.message);
  }

  // Also send FCM push if configured
  const ready = await initFirebase();
  if (!ready) return;

  try {
    // Check both user_info and vendor_info for the FCM token
    let fcmToken = null;

    const { data: user } = await supabase
      .from('user_info')
      .select('fcm_token')
      .eq('id', userId)
      .maybeSingle();

    fcmToken = user?.fcm_token;

    if (!fcmToken) {
      const { data: vendor } = await supabase
        .from('vendor_info')
        .select('fcm_token')
        .eq('id', userId)
        .maybeSingle();

      fcmToken = vendor?.fcm_token;
    }

    if (!fcmToken) return;

    await firebaseAdmin.messaging().send({
      token: fcmToken,
      data: { ...data, title, body },
    });
  } catch (err) {
    console.warn('Push notification failed:', err.message);
  }
}
