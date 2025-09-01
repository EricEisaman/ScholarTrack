import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import type { Student, Class, Transaction, NewStudent } from '../types';
import { apiLogger } from './logger';

// Use a simpler approach without type casting
const API_BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    apiLogger.info(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    apiLogger.error('Request Error', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    apiLogger.info(`Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    apiLogger.error('Response Error', error, { responseData: error.response?.data });
    return Promise.reject(error);
  },
);

// Students API
export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/students');
    return response.data;
  },

  create: async (student: NewStudent): Promise<Student> => {
    const response = await api.post<Student>('/students', student);
    return response.data;
  },

  update: async (id: string, student: Partial<Student>): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/students/${id}`, student);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/students/${id}`);
    return response.data;
  },
};

// Classes API
export const classesApi = {
  getAll: async (): Promise<Class[]> => {
    const response = await api.get<Class[]>('/classes');
    return response.data;
  },

  create: async (name: string): Promise<Class> => {
    const response = await api.post<Class>('/classes', { name });
    return response.data;
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (params?: {
    startDate?: string
    endDate?: string
    className?: string
    studentLabel?: string
  }): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  create: async (transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions', transaction);
    return response.data;
  },
};

// Reports API
export const reportsApi = {
  generate: async (params: {
    type: 'student' | 'teacher'
    startDate: string
    endDate: string
    className?: string
  }): Promise<Blob> => {
    const response = await api.post('/reports', params, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Sync API
export const syncApi = {
  sync: async (data: {
    students: Student[]
    classes: Class[]
    transactions: Transaction[]
  }): Promise<{ message: string; timestamp: string }> => {
    const response = await api.post<{ message: string; timestamp: string }>('/sync', data);
    return response.data;
  },
};

export default api;
