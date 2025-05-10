// API Response Types
export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  upload_date: string;
  status: 'UPLOADED' | 'PROCESSING' | 'INDEXED' | 'FAILED';
  page_count: number | null;
  category: string;
  tags: string[];
  user: number;
  chunks_count?: number;
}

export interface DocumentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentItem[];
}

export interface DocumentChunk {
  // Define this based on your actual API response
  id: string;
  content: string;
  document_id: string;
  page_number: number;
  embedding_id?: string;
}

export interface QueryResponse {
  response: string;
  sources: {
    id: string;
    title: string;
    description: string;
    category: string;
  }[];
  processing_time: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  session_id: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  user: number;
}

export interface ChatSessionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatSession[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatMessagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
}

// API Request Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface DocumentUploadRequest {
  title: string;
  description: string;
  file: File;
  category: string;
  tags: string[];
}

export interface QueryRequest {
  query: string;
  language: 'en' | 'ne';
  include_sources: boolean;
}

export interface CreateChatSessionRequest {
  title: string;
}

export interface SendMessageRequest {
  content: string;
  language: 'en' | 'ne';
  should_summarize: boolean;
}