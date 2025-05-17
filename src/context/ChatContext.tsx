import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Conversation,
  Message,
  DocumentSource,
  SessionDocument,
  VectorSearchResponse,
  VectorSearchRequest,
  SendMessageRequest
} from '../types/api.types';
import { chatService, knowledgeService } from '../services/api.service';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install uuid package if not already present

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  language: 'en' | 'ne';
  typingText: string | null; // Add typing text state for typewriter effect
  isMockMode: boolean; // Add isMockMode to the interface
  mockMessages: Record<number, Message[]>; // Add mockMessages to the interface
  sessionId: string;
  sessionDocuments: SessionDocument[];
  setLanguage: (lang: 'en' | 'ne') => void;
  createNewConversation: (title: string) => Promise<number>;
  selectConversation: (id: number) => Promise<void>;
  updateConversation: (id: number, title: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  sendMessage: (content: string, newConversationId?: number) => Promise<void>;
  uploadDocument: (formData: FormData) => Promise<void>; // Change from File to FormData
  translateMessage: (text: string, sourceLang: 'en' | 'ne', targetLang: 'en' | 'ne') => Promise<string>;
  refreshConversations: () => Promise<void>; // Add refreshConversations function to interface
  getSessionDocuments: () => Promise<void>;
  generateNewSessionId: () => string;
  performVectorSearch: (query: string, topK?: number, useFusion?: boolean) => Promise<VectorSearchResponse[]>; // Add performVectorSearch to interface
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock data for testing
const MOCK_CONVERSATIONS: Conversation[] = [];
const MOCK_MESSAGES: Record<number, Message[]> = {};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(false); // Setting to false to disable mock mode
  const [language, setLanguage] = useState<'en' | 'ne'>('en');
  const [typingText, setTypingText] = useState<string | null>(null); // Typewriter effect state
  const [sessionId, setSessionId] = useState<string>(() => {
    // Try to get session ID from localStorage or create a new one
    const storedSessionId = localStorage.getItem('chat_session_id');
    if (storedSessionId) return storedSessionId;

    const newSessionId = uuidv4();
    localStorage.setItem('chat_session_id', newSessionId);
    return newSessionId;
  });
  const [sessionDocuments, setSessionDocuments] = useState<SessionDocument[]>([]);

  // Generate a new session ID - useful when starting a new conversation
  const generateNewSessionId = (): string => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem('chat_session_id', newSessionId);
    return newSessionId;
  };

  // Load user conversations when user changes
  useEffect(() => {
    const fetchUserConversations = async () => {
      // Only fetch if user is logged in
      if (!user || !localStorage.getItem('access_token')) {
        setConversations([]);
        setCurrentConversation(null);
        setMessages([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Use the user-conversations endpoint which automatically filters by current user
        const response = await chatService.getUserConversations();

        // Sort conversations by last activity (newest first)
        const sortedConversations = [...response.results].sort(
          (a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
        );

        setConversations(sortedConversations);
      } catch (error: any) {
        setError('Failed to load conversations');
        console.error('Error fetching user conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserConversations();
  }, [user]);

  // Load session documents
  useEffect(() => {
    if (sessionId) {
      getSessionDocuments();
    }
  }, [sessionId]);

  // Helper function to generate a unique string ID
  const generateId = (prefix: string = '') => {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  };
  // Helper function to ensure message ID is always a string
  const ensureStringId = (id: number | string | undefined): string => {
    if (id === null || typeof id === 'undefined') return generateId();
    return typeof id === 'string' ? id : id.toString();
  };
  // Enhanced thinking message generator
  const generateThinkingMessage = (conversationId: number): Message => ({
    id: generateId('thinking-'),
    conversation: conversationId,
    role: 'assistant',
    content: "🤔 Analyzing document...\n[===>          ]",
    created_at: new Date().toISOString(),
    thinkingStage: 0
  });

  // Create an array of thinking stages with more variation for smoother animation
  const thinkingStages = [
    "🤔 Analyzing document...\n[===>          ]",
    "🤔 Analyzing document...\n[=====>        ]",
    "🧠 Processing content...\n[=======>      ]",
    "🧠 Processing content...\n[========>     ]",
    "✨ Generating summary...\n[==========>   ]",
    "✨ Generating summary...\n[===========>  ]",
    "📝 Preparing response...\n[============> ]",
    "📝 Preparing response...\n[=============>]"
  ];
    // Helper function to cleanup thinking/typing messages
  const cleanupThinkingMessages = () => {
    setMessages(prev => prev.filter(msg => {
      const id = msg.id;
      // Safe check: ensure id is a string before calling startsWith
      return !(typeof id === 'string' &&
        (id.startsWith('thinking-') || id.startsWith('typing-')));
    }));
  };  // Improved and fixed typewriter effect that updates a single message in-place
  const typewriterEffect = (text: string, onComplete: (fullText: string) => void, updateThinking?: (stage: number) => void) => {
    // Clear any existing typing text to avoid duplication issues
    setTypingText(null);

    // Clean up any existing typing/thinking messages first
    cleanupThinkingMessages();

    let currentIndex = 0;
    const totalLength = text.length;
    let isAborted = false;

    // Safety timeout - ensure completion even if animation breaks
    const safetyTimeout = setTimeout(() => {
      if (!isAborted && currentIndex < totalLength) {
        isAborted = true;
        console.log('Typewriter effect timed out - forcing completion');
        // Final update with complete text
        setTypingText(null);
        onComplete(text);
      }
    }, 10000); // 10 second timeout as safety

    // Adaptive typing speed - faster for longer content
    const getTypingDelay = () => {
      // Base the typing speed on content length - faster for longer content
      const baseSpeed = Math.max(2, 10 - Math.floor(totalLength / 300));

      // Add slight natural pauses at punctuation
      if (currentIndex < totalLength && /[.,!?;:]/.test(text[currentIndex])) {
        return Math.random() * 50 + 20; // Pause at punctuation
      }

      // Slight randomness for natural feel
      return baseSpeed + (Math.random() * 2);
    };

    // Create typing indicator with initial character
    const initializeTyping = () => {
      // Small delay before starting to type
      setTimeout(() => {
        // Set the typing text state instead of adding a new message
        setTypingText(text.substring(0, 1));

        // Start typing the rest
        typeNextChar();
      }, 200);
    };

    const typeNextChar = () => {
      if (isAborted) return;

      if (currentIndex < totalLength) {
        const progress = currentIndex / totalLength;

        // Update thinking stage based on progress
        if (updateThinking) {
          const stageIndex = Math.min(Math.floor(progress * thinkingStages.length), thinkingStages.length - 1);
          updateThinking(stageIndex);        }

        // Dynamically adjust chunk size based on content length
        // For longer content, type faster by using larger chunks
        const chunkSize = Math.max(
          1,
          Math.min(
            5, // Max chunk size
            Math.floor(totalLength / 300) // Adaptive chunk size
          )
        );

        currentIndex = Math.min(currentIndex + chunkSize, totalLength);

        // Update the typing text state
        setTypingText(text.substring(0, currentIndex));

        // Only schedule next update if not at the end
        if (currentIndex < totalLength) {
          setTimeout(typeNextChar, getTypingDelay());
        } else {
          // Typing complete
          clearTimeout(safetyTimeout);
          isAborted = true;
          // Small delay before removing typing text to ensure UI smoothness
          setTimeout(() => {
            setTypingText(null);
            onComplete(text);
          }, 50);
        }
      } else {
        // Typing complete
        clearTimeout(safetyTimeout);
        isAborted = true;
        setTypingText(null);
        onComplete(text);
      }
    };

    // Start the typing effect
    initializeTyping();

    // Return an abort function
    return () => {
      if (!isAborted) {
        isAborted = true;
        clearTimeout(safetyTimeout);
        setTypingText(null);
        onComplete(text);
      }
    };
  };

  const createNewConversation = async (title: string): Promise<number> => {
    setIsLoading(true);
    setError(null);
    try {
      // Generate new session ID for a new conversation
      const newSessionId = generateNewSessionId();

      // Always use the real API endpoint
      const response = await chatService.createConversation({
        title,
        language,
        session_id: newSessionId // Pass session_id to link conversation with documents
      });

      // Create a properly structured conversation object with all required properties
      const newConversation: Conversation = {
        id: response.id,
        title: response.title,
        language: response.language,
        created_at: response.created_at,
        updated_at: response.created_at, // Initially same as created_at
        is_active: true,
        message_count: 0,
        user: {
          id: user?.user?.id || 0,
          username: user?.user?.username || '',
          first_name: user?.user?.first_name || '',
          last_name: user?.user?.last_name || '',
          email: user?.user?.email || ''
        },
        last_message: {
          id: 0,
          role: 'user',
          content_preview: '',
          created_at: response.created_at
        },
        last_activity: response.created_at
      };

      setConversations(prevConversations => [newConversation, ...prevConversations]);
      setCurrentConversation(newConversation);
      setMessages([]);

      // Reset session documents for the new conversation
      setSessionDocuments([]);

      return response.id;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to create new conversation';
      setError(errorMessage);
      console.error('Error creating conversation:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const conversation = conversations.find(c => c.id === id);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      setCurrentConversation(conversation);

      // Always fetch conversation details from API
      const conversationDetails = await chatService.getConversationDetails(id);
      setMessages(conversationDetails.messages || []);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to load conversation';
      setError(errorMessage);
      console.error('Error selecting conversation:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversation = async (id: number, title: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Always use the real API
      const updatedConversation = await chatService.updateConversation(id, {
        title,
        language: currentConversation?.language || language
      });

      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === id ? updatedConversation : conv
        )
      );

      if (currentConversation?.id === id) {
        setCurrentConversation(updatedConversation);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to update conversation';
      setError(errorMessage);
      console.error('Error updating conversation:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Always use the real API
      await chatService.deleteConversation(id);

      setConversations(prevConversations =>
        prevConversations.filter(conv => conv.id !== id)
      );

      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to delete conversation';
      setError(errorMessage);
      console.error('Error deleting conversation:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (content: string, newConversationId?: number): Promise<void> => {
    // Check if we have a current conversation or a new conversation ID was provided
    if (!currentConversation && !newConversationId) {
      setError('No active conversation');
      return;
    }

    // Use the provided conversation ID or fall back to the current conversation's ID
    const conversationId = newConversationId || currentConversation!.id;

    setIsLoading(true);
    setError(null);

    try {
      // Generate a temporary ID for optimistic UI update
      const tempId = `temp-${Date.now()}`;

      // Add user message to UI immediately for better UX
      const userMessage: Message = {
        id: tempId,
        conversation: conversationId, // CHANGE THIS LINE
        role: 'user',
        content,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Send the message to the API endpoint
      console.log(`Sending message to API: ${content}`);
      const response = await chatService.sendMessage({
        conversation_id: conversationId,
        content,
        message: content, // Add message field that matches content
        role: 'user',
        language: language
      });      if (response) {
        // Replace the temporary message with a properly formatted user message
        setMessages(prev =>
          prev.map(msg => msg.id === tempId ? {
            ...msg,
            id: generateId('user-') // Use our consistent ID generator
          } : msg)
        );        // Format the assistant's response as a Message
        const assistantMessage: Message = {
          id: generateId('assistant-'),
          conversation: conversationId,
          role: 'assistant',
          content: (response as any).message || response.content, // Type assertion for message property
          created_at: new Date().toISOString(),
          sources: response.sources ? response.sources.map(source => ({
            id: ensureStringId(source.id) || generateId('src-'),
            title: source.title || "Document Reference",
            description: source.description || source.title || "Referenced content",
            relevance_score: source.relevance_score || 1.0
          })) : undefined,
          experts_used: response.experts_used || undefined
        };

        // First, add the placeholder message (will be shown as typing)        // First, clean up any existing thinking/typing messages
        cleanupThinkingMessages();

        // Use the improved typewriter effect directly without creating a placeholder message first
        const abortTyping = typewriterEffect(
          assistantMessage.content,
          (fullText) => {
            // After typing animation completes, add the final message
            setMessages(prev => [
              // Keep all regular messages (filter out any temporary ones)
              ...prev.filter(msg => {
                const id = msg.id;
                return !(typeof id === 'string' &&
                  (id.startsWith('thinking-') || id.startsWith('typing-') || id.startsWith('temp-'))
                );
              }),
              // Add final message with complete content
              { ...assistantMessage, content: fullText }
            ]);
            setIsLoading(false);
          }
        );

        // Set a safety timeout
        setTimeout(() => {
          abortTyping();
        }, 15000); // Increased timeout for longer responses
      }    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', error);

      // Clean up any temporary messages using our helper
      cleanupThinkingMessages();

      // Also remove any specific temp- messages
      setMessages(prev => prev.filter(msg => {
        const id = msg.id;
        return !(typeof id === 'string' && id.startsWith('temp-'));
      }));

      // Add a more informative error message to the chat
      const errorAssistantMessage: Message = {
        id: generateId('error-'),
        conversation: conversationId,
        role: 'assistant',
        content: `⚠️ Sorry, I encountered an issue processing your message: ${errorMessage.slice(0, 100)}${errorMessage.length > 100 ? '...' : ''}. Please try again.`,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);      // Final cleanup - ensure no thinking/typing messages remain
      cleanupThinkingMessages();
      // Clear typing text state to prevent any leftover typing indicators
      setTimeout(() => {
        setTypingText(null);
      }, 100);
    }
  };
  // Simulate a response for demo mode
  const simulateResponse = async (userMessage: string, tempId: string) => {
    // Replace the temporary message with a "real" one (in a real app, this would come from the server)
    const realUserMessage: Message = {
      id: generateId('user-'),
      conversation: currentConversation!.id,
      role: 'user' as const,
      content: userMessage,
      created_at: new Date().toISOString()
    };

    // Replace the temporary message with the real one
    setMessages(prev =>
      prev.map(msg => msg.id === tempId ? realUserMessage : msg)
    );

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create mock response based on user message
    let responseContent = "I don't have a specific response for that.";

    if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
      responseContent = "Hello! How can I assist you today?";
    } else if (userMessage.toLowerCase().includes("weather")) {
      responseContent = "I don't have access to real-time weather data, but I'd be happy to discuss weather patterns or climate in general.";
    } else if (userMessage.toLowerCase().includes("name")) {
      responseContent = "I'm Neural, your friendly AI assistant.";
    } else if (userMessage.toLowerCase().includes("help")) {
      responseContent = "I'm here to help! You can ask me questions, have a conversation, or request information on various topics.";
    }

    // Add the assistant's response
    const assistantMessage: Message = {
      id: generateId('assistant-'),
      conversation: currentConversation!.id,
      role: 'assistant' as const,
      content: responseContent,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);
  };


  // Replace the existing uploadDocument function with this fixed version
  const uploadDocument = async (formData: FormData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (currentConversation && !formData.has('chat_id')) {
        formData.append('chat_id', currentConversation.id.toString());
      }

      const document = await knowledgeService.uploadSessionDocument(formData);
      await getSessionDocuments();

      if (currentConversation) {
        // Add user message for document upload
        const userMessageContent = `📄 Uploaded document: ${document.title}`;
        const userMessageRequest: SendMessageRequest = {
          role: 'user',
          content: userMessageContent,
          message: userMessageContent,
          conversation_id: currentConversation.id,
        };

        // Create the user message in the backend
        const createMessageResponse = await chatService.createMessage(userMessageRequest);

        // Add the user message to the UI
        const userMessage: Message = {
          id: ensureStringId(createMessageResponse.id || generateId('upload-')),
          conversation: currentConversation.id,
          role: 'user',
          content: userMessageContent,
          created_at: document.created_at || new Date().toISOString()
        };        // Add to messages without keeping any temporary messages
        setMessages(prev => [
          ...prev.filter(msg => {
            const id = msg.id;
            return !(typeof id === 'string' &&
              (id.startsWith('thinking-') || id.startsWith('typing-') || id.startsWith('temp-')));
          }),
          userMessage
        ]);        // First clean up any existing thinking messages
        cleanupThinkingMessages();

        // Add enhanced thinking message
        const thinkingMessage = generateThinkingMessage(currentConversation.id);
        setMessages(prev => [...prev, thinkingMessage]);

        // Handle document summary if available
        const summary = document.document_summary || document.summary;
        if (summary) {
          // Create source metadata
          const documentSource: DocumentSource = {
            id: ensureStringId(document.id),
            title: document.title,
            description: document.content_preview || 'Document preview',
            relevance_score: 1.0
          };

          // Create the assistant message in the backend
          const summaryRequest: SendMessageRequest = {
            role: 'assistant',
            content: summary,
            message: summary,
            conversation_id: currentConversation.id,
          };

          const createSummaryResponse = await chatService.createMessage(summaryRequest);

          // Prepare the assistant message for UI
          const assistantMessage: Message = {
            id: ensureStringId(createSummaryResponse.id || generateId('summary-')),
            conversation: currentConversation.id,
            role: 'assistant',
            content: summary,
            created_at: new Date().toISOString(),
            sources: [documentSource],
            experts_used: document.experts_used
          };          // Clean up any thinking/typing messages before starting the typewriter effect
          cleanupThinkingMessages();

          // Use the improved typewriter effect directly without creating a placeholder message first
          const abortTyping = typewriterEffect(
            summary,
            (fullText) => {
              // After typing animation completes, add the final message
              setMessages(prev => [
                // Keep all regular messages (filter out any temporary ones)
                ...prev.filter(msg => {
                  const id = msg.id;
                  return !(typeof id === 'string' &&
                    (id.startsWith('thinking-') || id.startsWith('typing-')));
                }),
                // Add final message with complete content
                { ...assistantMessage, content: fullText }
              ]);
            }
          );

          // Set safety timeout with slightly longer duration for document summaries
          setTimeout(() => {
            abortTyping();
          }, 15000);
        } else {
          // If no summary is available, clean up thinking messages anyway
          setMessages(prev => prev.filter(msg =>
            !(typeof msg.id === 'string' && msg.id.startsWith('thinking-'))
          ));

          // Add a default response
          const assistantMessage: Message = {
            id: generateId('summary-'),
            conversation: currentConversation.id,
            role: 'assistant',
            content: "Document was uploaded successfully. I'll reference it when answering your questions.",
            created_at: new Date().toISOString(),
          };

          setMessages(prev => [...prev, assistantMessage]);
        }
      }    } catch (error: any) {
      // Clean up any thinking/typing messages on error
      cleanupThinkingMessages();

      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to upload document';
      setError(errorMessage);
      console.error('Error uploading document:', error);

      // Add error message to the chat if we have an active conversation
      if (currentConversation) {
        const errorAssistantMessage: Message = {
          id: generateId('error-'),
          conversation: currentConversation.id,
          role: 'assistant',
          content: `⚠️ Error uploading document: ${errorMessage}. Please try again or contact support if this issue persists.`,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [
          ...prev.filter(msg => {
            const id = msg.id;
            return !(typeof id === 'string' &&
              (id.startsWith('thinking-') || id.startsWith('typing-') || id.startsWith('temp-')));
          }),
          errorAssistantMessage
        ]);
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionDocuments = async (): Promise<void> => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Fetch documents for the current session
      const chatId = currentConversation?.id?.toString();
      const response = await knowledgeService.getSessionDocuments(sessionId, chatId);
      setSessionDocuments(response.results || []);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to fetch session documents';
      setError(errorMessage);
      console.error('Error fetching session documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const translateMessage = async (
    text: string,
    sourceLang: 'en' | 'ne',
    targetLang: 'en' | 'ne'
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      // Always use the real API for translations
      const response = await chatService.translateText({
        text,
        source_language: sourceLang,
        target_language: targetLang
      });

      return response.translated_text;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to translate message';
      setError(errorMessage);
      console.error('Error translating message:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConversations = async (): Promise<void> => {
    if (!user || !localStorage.getItem('access_token')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.getUserConversations();

      // Sort conversations by last activity (newest first)
      const sortedConversations = [...response.results].sort(
        (a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      );

      setConversations(sortedConversations);
    } catch (error: any) {
      setError('Failed to refresh conversations');
      console.error('Error refreshing conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vector search with fusion capability
  const performVectorSearch = async (query: string, topK: number = 5, useFusion: boolean = true): Promise<VectorSearchResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await knowledgeService.vectorSearch({
        query,
        top_k: topK,
        use_fusion: useFusion
      });
      return result;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to perform vector search';
      setError(errorMessage);
      console.error('Error during vector search:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ChatContext.Provider value={{
      conversations,
      messages,
      currentConversation,
      isLoading,
      error,
      language,
      typingText, // Add typing text to context
      isMockMode, // Add isMockMode to context
      mockMessages: MOCK_MESSAGES, // Add mockMessages to context
      sessionId,
      sessionDocuments,
      setLanguage,
      createNewConversation,
      selectConversation,
      updateConversation,
      deleteConversation,
      sendMessage, uploadDocument,
      translateMessage,
      refreshConversations,
      getSessionDocuments,
      generateNewSessionId,
      performVectorSearch // Add performVectorSearch to context
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};