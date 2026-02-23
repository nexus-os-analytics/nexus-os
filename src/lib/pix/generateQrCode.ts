import QRCode from 'qrcode';

/**
 * Generates QR Code as PNG base64 data URL from PIX EMV payload.
 * Suitable for <img src={qrCodeDataUrl} /> or response body.
 */
export async function generateQrCodeBase64(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    type: 'image/png',
    margin: 2,
    width: 256,
    errorCorrectionLevel: 'M',
  });
}
