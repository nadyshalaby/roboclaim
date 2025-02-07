import axios from 'axios';
import { useAuth } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  role: 'user' | 'admin';
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export const auth = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
};

export interface FileUploadResponse {
  id: string;
  originalName: string;
  type: 'pdf' | 'image' | 'csv' | 'excel';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  extractedData?: {
    text?: string;
    records?: Array<Record<string, string | number>>;
  };
  errorMessage?: string;
}

export const files = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<{files: FileUploadResponse[]}>('/files');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<FileUploadResponse>(`/files/${id}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },
};

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const users = {
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  updatePassword: async (data: UpdatePasswordData) => {
    const response = await api.put('/users/password', data);
    return response.data;
  },
};

export default api;
