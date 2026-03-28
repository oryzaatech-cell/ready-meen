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
export async function sendNotification(userId, { title, body, data = {}, role = null }) {
  const { default: supabase } = await import('../config/supabase.js');

  // Always save to DB for in-app notifications
  try {
    const insertData = {
      user_id: userId,
      user_role: role || 'customer',
      title,
      body,
      type: data.type || 'order',
      order_id: data.order_id ? Number(data.order_id) : null,
    };
    console.log('Saving notification:', JSON.stringify(insertData));
    const { error: dbError } = await supabase.from('notifications').insert(insertData);
    if (dbError) console.error('Failed to save notification:', dbError.message, dbError);
  } catch (err) {
    console.warn('Failed to save notification to DB:', err.message);
  }

  // Also send FCM push if configured
  const ready = await initFirebase();
  if (!ready) return;

  try {
    // Look up FCM token from the correct table based on role
    let fcmToken = null;
    let tokenTable = null;

    if (role === 'vendor') {
      // Vendor — check vendor_info first
      const { data: vendor } = await supabase
        .from('vendor_info')
        .select('fcm_token')
        .eq('id', userId)
        .maybeSingle();
      fcmToken = vendor?.fcm_token;
      if (fcmToken) tokenTable = 'vendor_info';
    } else if (role === 'customer') {
      // Customer — check user_info first
      const { data: user } = await supabase
        .from('user_info')
        .select('fcm_token')
        .eq('id', userId)
        .maybeSingle();
      fcmToken = user?.fcm_token;
      if (fcmToken) tokenTable = 'user_info';
    } else {
      // Fallback: check both (legacy calls without role)
      const { data: user } = await supabase
        .from('user_info')
        .select('fcm_token')
        .eq('id', userId)
        .maybeSingle();
      fcmToken = user?.fcm_token;
      if (fcmToken) tokenTable = 'user_info';

      if (!fcmToken) {
        const { data: vendor } = await supabase
          .from('vendor_info')
          .select('fcm_token')
          .eq('id', userId)
          .maybeSingle();
        fcmToken = vendor?.fcm_token;
        if (fcmToken) tokenTable = 'vendor_info';
      }
    }

    if (!fcmToken) return;

    await firebaseAdmin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: { ...data, title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          data: { ...data, title, body },
        },
        fcmOptions: { link: data.order_id ? `/orders/${data.order_id}` : '/orders' },
      },
      android: {
        priority: 'high',
        notification: { title, body, icon: '/icons/icon-192.png' },
      },
      apns: {
        payload: { aps: { alert: { title, body }, sound: 'default', badge: 1 } },
      },
    });
  } catch (err) {
    console.warn('Push notification failed:', err.message);
    // Clear stale token only from the table it was found in
    if (err.code === 'messaging/registration-token-not-registered' ||
        err.code === 'messaging/invalid-registration-token') {
      if (tokenTable) {
        await supabase.from(tokenTable).update({ fcm_token: null }).eq('id', userId);
      }
    }
  }
}
