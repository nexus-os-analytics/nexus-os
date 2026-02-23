/**
 * CRC16-CCITT (0xFFFF) as per BR Code / EMV QRCPS.
 * Polynomial 0x1021, initial value 0xFFFF.
 */
export function crc16ccitt(str: string): string {
  let crc = 0xffff;
  const poly = 0x1021;

  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ poly) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}
