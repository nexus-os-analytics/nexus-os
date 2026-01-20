'use client';
import { Button, Paper, PinInput, Stack, Text } from '@mantine/core';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';
import { use2FAGenerateSecret, use2FAVerify } from '../../services';

interface TwoFactorQRCodeProps {
  onSuccess?: (code: string) => void;
}

export function TwoFactorQRCode({ onSuccess }: TwoFactorQRCodeProps) {
  const [qr, setQr] = useState<string | null>(null);
  const { mutateAsync: generateSecret, error } = use2FAGenerateSecret();
  const { mutateAsync: verify2FA, isPending: isVerifying } = use2FAVerify();

  const handleGenerateQR = useCallback(async () => {
    try {
      const { otpauth } = await generateSecret();

      if (otpauth) {
        const qrCodeDataUrl = await QRCode.toDataURL(otpauth);
        setQr(qrCodeDataUrl);
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }, [generateSecret]);

  const handleEnable2FA = async (code: string) => {
    try {
      await verify2FA({ code });
      if (onSuccess) onSuccess(code);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
    }
  };

  useEffect(() => {
    handleGenerateQR();
  }, [handleGenerateQR]);

  return (
    <Paper radius="md" p="lg" withBorder>
      <Stack align="center">
        <Text ta="center" fz="lg" fw={500}>
          Configuração de Autenticação de Dois Fatores (2FA)
        </Text>

        {qr && (
          <>
            <Text ta="center" fz="sm">
              Aponte seu aplicativo autenticador para o QR Code abaixo para configurar a
              autenticação de dois fatores.
            </Text>
            <Image height={250} width={250} src={qr} alt="QR Code" />
          </>
        )}
        <Text ta="center" fz="sm">
          Após configurar o aplicativo, insira o código de 6 dígitos gerado para verificar a
          autenticação de dois fatores.
        </Text>
        <PinInput autoFocus length={6} inputMode="numeric" onComplete={handleEnable2FA} />
        <Button
          variant="light"
          color="red"
          fullWidth
          disabled={!qr}
          loading={isVerifying}
          onClick={() => signOut({ callbackUrl: '/login' })}
          radius="xl"
        >
          Encerrar Sessão
        </Button>
        {error && (
          <Text ta="center" fz="sm" c="red">
            Ocorreu um erro ao gerar o QR Code. Tente novamente.
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
