import { useCreatePaymentOrder, useVerifyPayment } from './useFinance';
import { loadRazorpayScript, RAZORPAY_KEY_ID } from '../lib/razorpay';

/**
 * Full Razorpay flow (Phase 7):
 *   create-order (server) -> open Razorpay Checkout -> verify (server).
 *
 * Returns a `checkout(opts)` function and loading flags. The server verifies the
 * signature and records the ledger transaction; the amount is authoritative
 * server-side.
 *
 *   const { checkout } = useRazorpayCheckout();
 *   await checkout({ amount: 4999, description: 'Gold plan', source: 'MEMBERSHIP',
 *                    prefill: { name, email, contact } });
 */
export const useRazorpayCheckout = () => {
  const createOrder = useCreatePaymentOrder();
  const verify = useVerifyPayment();

  // The amount is NEVER sent from the client — the server derives it from the
  // planId/invoiceId reference. The server returns the authoritative paise amount.
  const checkout = async ({ planId, invoiceId, name = 'BookMyCourt', description, prefill, source, notes }) => {
    if (!RAZORPAY_KEY_ID) {
      throw { message: 'Online payments are not configured (missing VITE_RAZORPAY_KEY_ID).' };
    }
    await loadRazorpayScript();
    const order = await createOrder.mutateAsync({ planId, invoiceId }); // { id, amount(paise), currency }

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name,
        description,
        prefill,
        theme: { color: '#10b981' },
        handler: async (resp) => {
          try {
            const tx = await verify.mutateAsync({
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
              ...(source ? { source } : {}),
              ...(notes ? { notes } : {}),
            });
            resolve(tx);
          } catch (e) {
            reject(e);
          }
        },
        modal: { ondismiss: () => reject({ message: 'Payment cancelled.', cancelled: true }) },
      });
      rzp.open();
    });
  };

  return {
    checkout,
    isProcessing: createOrder.isPending || verify.isPending,
  };
};
