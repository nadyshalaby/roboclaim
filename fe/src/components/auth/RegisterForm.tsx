"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { auth } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const registerMutation = useMutation({
    mutationFn: auth.register,
    onSuccess: () => {
      const message = 'Registered successfully';
      toast.success(message);
      router.push('/login');
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.message || 'Failed to register';
      toast.error(errorMessage);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
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
          <p className="mt-1 text-sm text-red-600" data-testid="email-error">{errors.email.message}</p>
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
          <p className="mt-1 text-sm text-red-600" data-testid="password-error">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          data-testid="role-select"
          {...register('role')}
          className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        data-testid="register-button"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Register'}
      </button>
    </form>
  );
}
