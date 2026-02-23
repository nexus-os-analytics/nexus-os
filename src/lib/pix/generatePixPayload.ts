/**
 * Generates PIX BR Code EMV payload (static QR) for manual reconciliation.
 * Format: EMV QRCPS-MPM, IDs per BCB BR Code manual.
 */

import { crc16ccitt } from './crc16';

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return id + len + value;
}

export interface PixPayloadInput {
  pixKey: string;
  amount: number;
  merchantName: string;
  merchantCity: string;
  txId: string;
}

/**
 * Build BR Code payload string. No diacritics in merchant name/city (per spec).
 */
export function generatePixPayload(input: PixPayloadInput): string {
  const { pixKey, amount, merchantName, merchantCity, txId } = input;

  const gui = 'br.gov.bcb.pix';
  const currency = '986';
  const country = 'BR';

  const amountStr = amount.toFixed(2);
  const name = merchantName.slice(0, 25).replace(/[àáâãäåæçèéêëìíîïñòóôõöùúûüýÿ]/gi, (c) => {
    const map: Record<string, string> = {
      à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a', æ: 'ae',
      ç: 'c',
      è: 'e', é: 'e', ê: 'e', ë: 'e',
      ì: 'i', í: 'i', î: 'i', ï: 'i',
      ñ: 'n',
      ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
      ù: 'u', ú: 'u', û: 'u', ü: 'u',
      ý: 'y', ÿ: 'y',
    };
    return map[c.toLowerCase()] ?? c;
  });
  const city = merchantCity.slice(0, 15).replace(/[àáâãäåæçèéêëìíîïñòóôõöùúûüýÿ]/gi, (c) => {
    const map: Record<string, string> = {
      à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a', æ: 'ae',
      ç: 'c',
      è: 'e', é: 'e', ê: 'e', ë: 'e',
      ì: 'i', í: 'i', î: 'i', ï: 'i',
      ñ: 'n',
      ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
      ù: 'u', ú: 'u', û: 'u', ü: 'u',
      ý: 'y', ÿ: 'y',
    };
    return map[c.toLowerCase()] ?? c;
  });
  const ref = txId.slice(0, 25);

  const merchantAccountPix = tlv('00', gui) + tlv('01', pixKey);
  const field26 = tlv('26', merchantAccountPix);
  const field62 = tlv('62', tlv('05', ref));

  const payloadWithoutCrc =
    tlv('00', '01') +
    field26 +
    tlv('52', '0000') +
    tlv('53', currency) +
    tlv('54', amountStr) +
    tlv('58', country) +
    tlv('59', name) +
    tlv('60', city) +
    field62;

  const crc = crc16ccitt(payloadWithoutCrc + '6304');
  return payloadWithoutCrc + tlv('63', crc);
}
