import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { HTTP_STATUS } from '@/lib/constants/http-status';

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (): Promise<{ url: string }> => {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        window.location.href = '/login?plan=PRO';
        throw new Error('Usuário não autenticado');
      }

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      return response.json();
    },
    onSuccess(data) {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError(error) {
      notifications.show({
        color: 'red',
        title: 'Ops! Algo deu errado',
        message: error instanceof Error ? error.message : 'Erro ao iniciar o checkout',
      });
    },
  });
}
