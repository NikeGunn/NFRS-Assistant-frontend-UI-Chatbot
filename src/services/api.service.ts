// api.service.ts

import axios, { AxiosRequestConfig } from 'axios';
import {
  TokenResponse,
  UserProfile,
  Document,
  DocumentsResponse,
  Conversation,
  ConversationsResponse,
  ConversationDetail,
  Message,
  ApiKey,
  VectorSearchResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  CreateApiKeyRequest,
  CreateConversationRequest,
  SendMessageRequest,
  TranslationRequest,
  TranslationResponse,
  DocumentUploadRequest,
  VectorSearchRequest,
  VectorIndex,
  UpdateConversationRequest,
  SessionDocumentsResponse,
  SessionDocument,
  SessionDocumentSearchRequest,
  SessionSearchResponse,
  SessionDocumentCleanupRequest
} from '../types/api.types';

// Configure the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL + API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials for CORS requests with credentials
  withCredentials: true
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
    if (error.response?.status === 401 && !originalRequest._retry) {
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
    const response = await apiClient.post<TokenResponse>('/users/token/', credentials);
    return response.data;
  },

  refreshToken: async (refreshData: RefreshTokenRequest): Promise<{ access: string }> => {
    const response = await apiClient.post<{ access: string }>('/users/token/refresh/', refreshData);
    return response.data;
  },

  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await apiClient.post('/users/token/verify/', { token });
      return true;
    } catch (error) {
      return false;
    }
  },

  register: async (userData: RegisterRequest): Promise<any> => {
    // Updated return type to match the API response that only returns a message
    const response = await apiClient.post('/users/register/', userData);
    return response.data; // { message: "User registered successfully" }
  },

  getUserProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/profile/');
    return response.data;
  },

  updateProfile: async (profileData: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/users/profile/', profileData);
    return response.data;
  },

  changePassword: async (passwordData: ChangePasswordRequest): Promise<any> => {
    const response = await apiClient.post('/users/change-password/', passwordData);
    return response.data;
  },

  listApiKeys: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get<ApiKey[]>('/users/api-keys/');
    return response.data;
  },

  createApiKey: async (keyData: CreateApiKeyRequest): Promise<ApiKey> => {
    const response = await apiClient.post<ApiKey>('/users/api-keys/', keyData);
    return response.data;
  },

  getApiKeyDetails: async (keyId: number): Promise<ApiKey> => {
    const response = await apiClient.get<ApiKey>(`/users/api-keys/${keyId}/`);
    return response.data;
  },

  deleteApiKey: async (keyId: number): Promise<void> => {
    await apiClient.delete(`/users/api-keys/${keyId}/`);
  }
};

// Chat API Service
export const chatService = {
  getUserConversations: async (): Promise<ConversationsResponse> => {
    const response = await apiClient.get<ConversationsResponse>('/chat/user-conversations/');
    return response.data;
  },

  getConversations: async (): Promise<ConversationsResponse> => {
    const response = await apiClient.get<ConversationsResponse>('/chat/conversations/');
    return response.data;
  },

  createConversation: async (conversationData: CreateConversationRequest): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>('/chat/conversations/', conversationData);
    return response.data;
  },

  getConversationDetails: async (conversationId: number): Promise<ConversationDetail> => {
    const response = await apiClient.get<ConversationDetail>(`/chat/conversations/${conversationId}/`);
    return response.data;
  },

  updateConversation: async (conversationId: number, updates: Partial<UpdateConversationRequest>): Promise<Conversation> => {
    const response = await apiClient.put<Conversation>(`/chat/conversations/${conversationId}/`, updates);
    return response.data;
  },

  deleteConversation: async (conversationId: number): Promise<void> => {
    await apiClient.delete(`/chat/conversations/${conversationId}/`);
  },

  sendMessage: async (messageData: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post<Message>('/chat/messages/', messageData);
    return response.data;
  },

  getMessageDetails: async (messageId: string): Promise<Message> => {
    const response = await apiClient.get<Message>(`/chat/messages/${messageId}/`);
    return response.data;
  },

  translateText: async (translateData: TranslationRequest): Promise<TranslationResponse> => {
    const response = await apiClient.post<TranslationResponse>('/chat/translate/', translateData);
    return response.data;
  }
};

// Knowledge API Service
export const knowledgeService = {
  // Legacy document methods - keeping for backward compatibility
  getDocuments: async (): Promise<DocumentsResponse> => {
    const response = await apiClient.get<DocumentsResponse>('/knowledge/documents/');
    return response.data;
  },

  getDocumentDetails: async (documentId: number): Promise<Document> => {
    const response = await apiClient.get<Document>(`/knowledge/documents/${documentId}/`);
    return response.data;
  },

  uploadDocument: async (documentData: FormData): Promise<Document> => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await apiClient.post<Document>(
      '/knowledge/documents/upload/',
      documentData,
      config
    );

    return response.data;
  },

  adminUploadDocument: async (documentData: FormData): Promise<Document> => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await apiClient.post<Document>(
      '/knowledge/documents/admin-upload/',
      documentData,
      config
    );

    return response.data;
  },

  updateDocument: async (documentId: number, updates: Partial<Document>): Promise<Document> => {
    const response = await apiClient.put<Document>(`/knowledge/documents/${documentId}/`, updates);
    return response.data;
  },

  deleteDocument: async (documentId: number): Promise<void> => {
    await apiClient.delete(`/knowledge/documents/${documentId}/`);
  },

  // Vector search methods
  vectorSearch: async (searchData: VectorSearchRequest): Promise<VectorSearchResponse[]> => {
    const response = await apiClient.post<VectorSearchResponse[]>('/knowledge/search/', searchData);
    return response.data;
  },

  getVectorIndices: async (): Promise<VectorIndex[]> => {
    const response = await apiClient.get<VectorIndex[]>('/knowledge/indices/');
    return response.data;
  },

  getVectorIndexDetails: async (indexId: number): Promise<VectorIndex> => {
    const response = await apiClient.get<VectorIndex>(`/knowledge/indices/${indexId}/`);
    return response.data;
  },

  rebuildVectorIndex: async (): Promise<void> => {
    await apiClient.post('/knowledge/indices/rebuild/');
  },

  // New Session Document API methods
  getSessionDocuments: async (sessionId: string, chatId?: string): Promise<SessionDocumentsResponse> => {
    let url = `/knowledge/session-documents/?session_id=${sessionId}`;
    if (chatId) {
      url += `&chat_id=${chatId}`;
    }
    const response = await apiClient.get<SessionDocumentsResponse>(url);
    return response.data;
  },

  getSessionDocumentDetails: async (documentId: number): Promise<SessionDocument> => {
    const response = await apiClient.get<SessionDocument>(`/knowledge/session-documents/${documentId}/`);
    return response.data;
  },

  uploadSessionDocument: async (documentData: FormData): Promise<SessionDocument> => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await apiClient.post<SessionDocument>(
      '/knowledge/session-documents/',
      documentData,
      config
    );

    return response.data;
  },

  deleteSessionDocument: async (documentId: number): Promise<void> => {
    await apiClient.delete(`/knowledge/session-documents/${documentId}/`);
  },

  searchSessionDocuments: async (searchData: SessionDocumentSearchRequest): Promise<SessionSearchResponse> => {
    const response = await apiClient.post<SessionSearchResponse>('/knowledge/session-documents/search/', searchData);
    return response.data;
  },

  cleanupSessionDocuments: async (cleanupData: SessionDocumentCleanupRequest): Promise<void> => {
    await apiClient.post('/knowledge/session-documents/cleanup/', cleanupData);
  }
};

// Create an API service object before exporting as default
const apiService = {
  auth: authService,
  chat: chatService,
  knowledge: knowledgeService
};

export default apiService;