"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { auth } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: auth.login,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success('Logged in successfully');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to login';
      toast.error(errorMessage);
      setIsLoading(false);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          data-testid="email-input"
          {...register('email')}
          className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" data-testid="email-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          data-testid="password-input"
          {...register('password')}
          className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" data-testid="password-error">
            {errors.password.message}
          </p>
        )}
      </div>

      {loginMutation.error && (
        <div data-testid="error-message" className="text-red-600 text-sm mt-2">
          {loginMutation.error.response?.data?.message || 'Failed to login'}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        data-testid="login-button"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}