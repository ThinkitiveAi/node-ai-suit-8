import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  ProviderRegistrationForm,
  PatientRegistrationForm,
  LoginForm,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URI || 'http://localhost:3000';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't redirect for authentication endpoints (login/register)
          const isAuthEndpoint = error.config?.url?.includes('/login') || 
                                error.config?.url?.includes('/register') ||
                                error.config?.url?.includes('/auth/refresh');
          
          if (isAuthEndpoint) {
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            this.isRefreshing = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';
            return Promise.reject(error);
          }

          try {
            const response = await this.refreshToken(refreshToken);
            if (response.success && response.data) {
              localStorage.setItem('accessToken', response.data.tokens.accessToken);
              localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
              
              // Retry failed requests
              this.failedQueue.forEach(({ resolve }) => {
                resolve();
              });
              this.failedQueue = [];
              
              return this.api(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            this.failedQueue = [];
            
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Provider Authentication
  async providerRegister(data: ProviderRegistrationForm): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/api/v1/provider/register', data);
    return response.data;
  }

  async providerLogin(data: LoginForm): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/api/v1/provider/login', data);
    return response.data;
  }

  // Patient Authentication
  async patientRegister(data: PatientRegistrationForm): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/api/v1/patient/register', data);
    return response.data;
  }

  async patientLogin(data: LoginForm): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/api/v1/patient/login', data);
    return response.data;
  }

  // Token Management
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/api/v1/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    const response = await this.api.post('/api/v1/auth/logout', { refreshToken });
    return response.data;
  }

  async debugToken(): Promise<ApiResponse> {
    const response = await this.api.get('/api/v1/auth/debug');
    return response.data;
  }

  // System Health
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }

  async readinessCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health/ready');
    return response.data;
  }

  async livenessCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health/live');
    return response.data;
  }

  async getMetrics(): Promise<ApiResponse> {
    const response = await this.api.get('/health/metrics');
    return response.data;
  }

  // Provider Availability Management
  async createAvailability(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/api/v1/provider/availability', data);
    return response.data;
  }

  async createBulkAvailability(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/api/v1/provider/availability/bulk', data);
    return response.data;
  }

  async getMyAvailability(params: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const response = await this.api.get(`/api/v1/provider/availability/my?${queryParams}`);
    return response.data;
  }

  async getProviderAvailability(
    providerId: string,
    params: any
  ): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const response = await this.api.get(`/api/v1/provider/${providerId}/availability?${queryParams}`);
    return response.data;
  }

  async updateAvailability(slotId: string, data: any): Promise<ApiResponse> {
    const response = await this.api.put(`/api/v1/provider/availability/${slotId}`, data);
    return response.data;
  }

  async deleteAvailability(slotId: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/api/v1/provider/availability/${slotId}`);
    return response.data;
  }

  // Enhanced Availability
  async createComprehensiveAvailability(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/api/v1/provider/availability/comprehensive', data);
    return response.data;
  }

  async getProviderSettings(): Promise<ApiResponse> {
    const response = await this.api.get('/api/v1/provider/settings/availability');
    return response.data;
  }

  async updateProviderSettings(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/api/v1/provider/settings/availability', data);
    return response.data;
  }

  async getBlockDays(params: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const response = await this.api.get(`/api/v1/provider/block-days?${queryParams}`);
    return response.data;
  }

  async createBlockDay(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/api/v1/provider/block-days', data);
    return response.data;
  }

  async createBulkBlockDays(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/api/v1/provider/block-days/bulk', data);
    return response.data;
  }

  async getEnhancedProviderAvailability(providerId: string, params: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const response = await this.api.get(`/api/v1/providers/${providerId}/availability/enhanced?${queryParams}`);
    return response.data;
  }

  async getProviderCalendar(providerId: string, month: string): Promise<ApiResponse> {
    const response = await this.api.get(`/api/v1/availability/calendar/${providerId}?month=${month}`);
    return response.data;
  }

  // Patient Search and Booking
  async searchAppointments(params: any): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const response = await this.api.get(`/api/v1/availability/search?${queryParams}`);
    return response.data;
  }

  async bookAppointment(appointmentData: any): Promise<ApiResponse> {
    const response = await this.api.post(`/api/v1/appointments`, appointmentData);
    return response.data;
  }

  // User Profile Management
  async getProviderProfile(): Promise<ApiResponse> {
    const response = await this.api.get('/api/v1/provider/profile');
    return response.data;
  }

  async getPatientProfile(): Promise<ApiResponse> {
    const response = await this.api.get('/api/v1/patient/profile');
    return response.data;
  }

  async updateProviderProfile(data: any): Promise<ApiResponse> {
    const response = await this.api.patch('/api/v1/provider/profile', data);
    return response.data;
  }

  async updatePatientProfile(data: any): Promise<ApiResponse> {
    const response = await this.api.patch('/api/v1/patient/profile', data);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 