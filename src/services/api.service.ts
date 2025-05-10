import axios, { AxiosRequestConfig } from 'axios';
import {
  TokenResponse,
  DocumentsResponse,
  QueryResponse,
  ChatSessionsResponse,
  ChatMessagesResponse,
  LoginRequest,
  RefreshTokenRequest,
  QueryRequest,
  DocumentItem,
  CreateChatSessionRequest,
  SendMessageRequest
} from '../types/api.types';

// Configure the API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we have a refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await authService.refreshToken({ refresh: refreshToken });
          localStorage.setItem('access_token', response.access);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${response.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh token might be expired, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API Service
export const authService = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/token/', credentials);
    return response.data;
  },

  refreshToken: async (refreshData: RefreshTokenRequest): Promise<{ access: string }> => {
    const response = await apiClient.post<{ access: string }>('/api/token/refresh/', refreshData);
    return response.data;
  },

  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await apiClient.post('/api/token/verify/', { token });
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Documents API Service
export const documentsService = {
  getDocuments: async (
    category?: string,
    status?: string,
    userId?: number
  ): Promise<DocumentsResponse> => {
    let url = '/api/v1/documents/';
    const params: Record<string, string | number> = {};

    if (category) params.category = category;
    if (status) params.status = status;
    if (userId) params.user_id = userId;

    const response = await apiClient.get<DocumentsResponse>(url, { params });
    return response.data;
  },

  getDocument: async (id: string): Promise<DocumentItem> => {
    const response = await apiClient.get<DocumentItem>(`/api/v1/documents/${id}/`);
    return response.data;
  },

  uploadDocument: async (formData: FormData): Promise<DocumentItem> => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await apiClient.post<DocumentItem>(
      '/api/v1/documents/upload/',
      formData,
      config
    );

    return response.data;
  },

  getDocumentChunks: async (documentId: string) => {
    const response = await apiClient.get(`/api/v1/documents/${documentId}/chunks/`);
    return response.data;
  },

  reprocessDocument: async (documentId: string) => {
    const response = await apiClient.post(`/api/v1/documents/${documentId}/reprocess/`, {});
    return response.data;
  }
};

// Queries API Service
export const queriesService = {
  askQuestion: async (queryData: QueryRequest): Promise<QueryResponse> => {
    const response = await apiClient.post<QueryResponse>('/api/v1/queries/ask/', queryData);
    return response.data;
  },

  getQueryHistory: async () => {
    const response = await apiClient.get('/api/v1/queries/');
    return response.data;
  }
};

// Chat Sessions API Service
export const chatService = {
  createChatSession: async (sessionData: CreateChatSessionRequest) => {
    const response = await apiClient.post<{ id: string; title: string; created_at: string; user: number }>(
      '/api/v1/chat-sessions/',
      sessionData
    );
    return response.data;
  },

  getChatSessions: async (): Promise<ChatSessionsResponse> => {
    const response = await apiClient.get<ChatSessionsResponse>('/api/v1/chat-sessions/');
    return response.data;
  },

  getChatMessages: async (sessionId: string): Promise<ChatMessagesResponse> => {
    const response = await apiClient.get<ChatMessagesResponse>(
      `/api/v1/chat-sessions/${sessionId}/messages/`
    );
    return response.data;
  },

  sendMessage: async (sessionId: string, messageData: SendMessageRequest): Promise<QueryResponse> => {
    const response = await apiClient.post<QueryResponse>(
      `/api/v1/chat-sessions/${sessionId}/send_message/`,
      messageData
    );
    return response.data;
  }
};

// Create an API service object before exporting as default
const apiService = {
  auth: authService,
  documents: documentsService,
  queries: queriesService,
  chat: chatService
};

export default apiService;