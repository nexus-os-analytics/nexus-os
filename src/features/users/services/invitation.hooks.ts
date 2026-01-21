import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/api';

export function useVerifyInvitation(token?: string | null) {
  return useQuery<{ isValid: boolean; email?: string; role?: string }>({
    queryKey: ['verify-invite-token', token],
    enabled: !!token,
    queryFn: () => axiosInstance.get('/users/invite/verify', { params: { token } }),
  });
}

interface AxiosErrorLike {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export function useAcceptInvitation() {
  return useMutation<
    { email: string },
    unknown,
    { token: string; password: string; confirmPassword: string }
  >({
    mutationFn: (data) => axiosInstance.post('/users/invite/accept', data),
    onSuccess() {
      notifications.show({
        color: 'green',
        title: 'Convite aceito!',
        message: 'Sua conta foi ativada com sucesso.',
      });
    },
    onError(error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Ops! Algo deu errado',
        message:
          (typeof error === 'object' && error && (error as AxiosErrorLike).response?.data?.error) ||
          (error as AxiosErrorLike)?.message ||
          'Erro ao aceitar convite',
      });
    },
  });
}
