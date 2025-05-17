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

export interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface UserProfile {
  user: UserDetails;
  preferred_language: 'en' | 'ne';
  organization: any | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
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
export interface UserInfo {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface LastMessage {
  id: number;
  role: 'user' | 'assistant';
  content_preview: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  language: 'en' | 'ne';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  message_count: number;
  user: UserInfo;
  last_message: LastMessage;
  last_activity: string;
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
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  parent_message?: string | null;
  conversation?: number;
  sources?: DocumentSource[];
  experts_used?: {
    name: string;
    title: string;
    description?: string;
  }[];
  thinkingStage?: number;  // Add optional thinking stage for animated responses
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
// Legacy Document type - keeping for backward compatibility
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

// New Session Document types
export interface SessionDocumentChunk {
  id: number;
  session_document: number;
  content: string;
  chunk_index: number;
  page_number: number;
  created_at: string;
}

export interface Expert {
  name: string;
  title: string;
  description?: string;
}

export interface SessionDocument {
  id: number;
  title: string;
  content_preview: string;
  session_id: string;
  chat_id: string | null;
  file_type: string;
  uploaded_by: number;
  created_at: string;
  chunks?: SessionDocumentChunk[];
  status?: string;
  message?: string;
  summary?: string;
  document_summary?: string;
  experts_used?: Expert[];
}

export interface SessionDocumentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SessionDocument[];
}

// Legacy document responses - keeping for backward compatibility
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

// New Session Document search result
export interface SessionSearchResult {
  chunk: SessionDocumentChunk;
  document_title: string;
  similarity_score: number;
}

export interface SessionSearchResponse {
  results: SessionSearchResult[];
  query: string;
  processing_time: number;
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
  confirm_password: string;  // Updated to match API expectations
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
  session_id?: string; // Optional session ID for linking with documents
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
// Legacy document upload - keeping for backward compatibility
export interface DocumentUploadRequest {
  file: File;
  title: string;
  description: string;
  language: 'en' | 'ne';
  is_public: boolean;
  file_type: string;
  conversation_id?: number;
}

// New Session Document requests
export interface SessionDocumentUploadRequest {
  file: File;
  session_id: string;
  chat_id?: string;
  title?: string;
  file_type?: string;
}

export interface SessionDocumentSearchRequest {
  query: string;
  session_id: string;
  chat_id?: string;
  top_k?: number;
}

export interface SessionDocumentCleanupRequest {
  session_id?: string;
  chat_id?: string;
  older_than_days?: number;
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
  use_fusion?: boolean;
}