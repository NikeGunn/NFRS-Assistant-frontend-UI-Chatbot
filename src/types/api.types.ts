// API Response Types

// Authentication & User Types
export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  preferred_language: 'en' | 'ne';
}

export interface UserProfile extends User {
  date_joined: string;
  last_login?: string;
}

export interface ApiKey {
  id: number;
  key: string;
  name: string;
  description?: string;
  created_at: string;
  last_used?: string;
}

// Chat Types
export interface Conversation {
  id: number;
  title: string;
  language: 'en' | 'ne';
  created_at: string;
  user: number;
  message_count?: number;
}

export interface ConversationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversation[];
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface Message {
  id: string;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: DocumentSource[];
}

export interface MessagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

export interface DocumentSource {
  id: string;
  title: string;
  description: string;
  relevance_score: number;
}

export interface TranslationResponse {
  translated_text: string;
}

// Knowledge Types
export interface Document {
  id: number;
  title: string;
  description: string;
  file_url: string;
  upload_date: string;
  status: 'UPLOADED' | 'PROCESSING' | 'INDEXED' | 'FAILED';
  page_count: number | null;
  language: 'en' | 'ne';
  is_public: boolean;
  user: number;
}

export interface DocumentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Document[];
}

export interface DocumentChunk {
  id: number;
  document_id: number;
  content: string;
  page_number: number;
  chunk_number: number;
  created_at: string;
}

export interface SearchResult {
  document_chunk: DocumentChunk;
  document_title: string;
  document_description: string;
  similarity_score: number;
}

export interface VectorSearchResponse {
  results: SearchResult[];
  query: string;
  processing_time: number;
}

export interface VectorIndex {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: string;
  vector_count: number;
  dimension: number;
}

// API Request Types

// Authentication & User Requests
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  preferred_language: 'en' | 'ne';
}

export interface UpdateProfileRequest {
  preferred_language?: 'en' | 'ne';
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
}

// Chat Requests
export interface CreateConversationRequest {
  title: string;
  language: 'en' | 'ne';
}

export interface UpdateConversationRequest {
  title?: string;
  language?: 'en' | 'ne';
}

export interface SendMessageRequest {
  conversation_id: number;
  content: string;
  message: string;  // Adding this field to match backend API expectations
  role: 'user' | 'assistant';
  language?: 'en' | 'ne';
}

export interface TranslationRequest {
  text: string;
  source_language: 'en' | 'ne';
  target_language: 'en' | 'ne';
}

// Knowledge Requests
export interface DocumentUploadRequest {
  file: File;
  title: string;
  description: string;
  language: 'en' | 'ne';
  is_public: boolean;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  is_public?: boolean;
}

export interface VectorSearchRequest {
  query: string;
  top_k?: number;
  filter_document_ids?: number[];
}