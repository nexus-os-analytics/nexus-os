import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/api';

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (): Promise<{ url: string }> => {
      return axiosInstance.post('/stripe/checkout', {
        plan: 'pro',
      });
    },
    onError(error) {
      notifications.show({
        color: 'red',
        title: 'Ops! Algo deu errado',
        message: error.message || 'Erro ao iniciar o checkout',
      });
    },
  });
}
