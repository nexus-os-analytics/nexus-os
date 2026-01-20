import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/api';

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await axiosInstance.post<{ url: string }>('/stripe/checkout', {
        plan: 'pro',
      });
      const url = response.data?.url;
      if (url) {
        window.location.href = url;
      }
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
