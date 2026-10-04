import toast, { Toaster } from 'react-hot-toast';

const BRAND_GREEN = '#4A812F';

/**
 * White-themed Toaster for the whole app. Mount once near the app root.
 * Replaces the browser's default alert()/confirm() chrome with branded UI.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.25)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '420px',
        },
        success: {
          iconTheme: { primary: BRAND_GREEN, secondary: '#ffffff' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
        },
      }}
    />
  );
}

/**
 * Promise-based confirmation dialog rendered as a white toast with
 * Cancel / Confirm buttons. Drop-in replacement for window.confirm().
 *
 * @param {Object} opts
 * @param {string} opts.message        Main confirmation text.
 * @param {string} [opts.title]        Optional bold heading.
 * @param {string} [opts.confirmLabel] Confirm button text (default "Confirm").
 * @param {string} [opts.cancelLabel]  Cancel button text (default "Cancel").
 * @param {boolean} [opts.danger]      Style the confirm button as destructive.
 * @returns {Promise<boolean>} resolves true if confirmed, false otherwise.
 */
export function confirmToast({
  message,
  title,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    const confirmBg = danger ? '#dc2626' : BRAND_GREEN;

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          {title ? (
            <p className="text-sm font-semibold text-slate-900">{title}</p>
          ) : null}
          <p className="text-sm text-slate-600 leading-snug">{message}</p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              style={{ backgroundColor: confirmBg }}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.25)',
          padding: '14px 16px',
          maxWidth: '420px',
        },
      }
    );
  });
}

export { toast };
export default toast;
