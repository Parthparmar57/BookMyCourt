/**
 * Razorpay Checkout loader (Phase 7).
 * The key_id is a public, client-side value (safe to expose); the secret stays
 * on the server. Loaded lazily from Razorpay's CDN the first time it's needed.
 */
export const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load the Razorpay checkout.'));
    document.body.appendChild(script);
  });

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
