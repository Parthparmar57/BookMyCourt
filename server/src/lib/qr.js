import QRCode from 'qrcode';

export const generateQRCodeDataUrl = async (payload) => {
  try {
    const text = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 250,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};
