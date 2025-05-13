import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, DocumentSource } from '../types/api.types';
import { chatService, knowledgeService } from '../services/api.service';

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
  setLanguage: (lang: 'en' | 'ne') => void;
  createNewConversation: (title: string) => Promise<number>;
  selectConversation: (id: number) => Promise<void>;
  updateConversation: (id: number, title: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  sendMessage: (content: string, newConversationId?: number) => Promise<void>;
  uploadDocument: (formData: FormData) => Promise<void>; // Change from File to FormData
  translateMessage: (text: string, sourceLang: 'en' | 'ne', targetLang: 'en' | 'ne') => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock data for testing
const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, title: 'NFRS 15 Discussion', created_at: new Date().toISOString(), language: 'en', user: 1 },
  { id: 2, title: 'Financial Reporting Guidelines', created_at: new Date().toISOString(), language: 'en', user: 1 }
];

const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: '1-1', conversation_id: 1, role: 'user' as const, content: 'What is NFRS 15?', created_at: new Date().toISOString() },
    {
      id: '1-2',
      conversation_id: 1,
      role: 'assistant' as const,
      content: 'NFRS 15 is the Nepal Financial Reporting Standard for Revenue from Contracts with Customers. It establishes a comprehensive framework for determining when and how much revenue to recognize. The standard is based on a core principle that an entity should recognize revenue to depict the transfer of promised goods or services to customers in an amount that reflects the consideration to which the entity expects to be entitled in exchange for those goods or services.',
      created_at: new Date().toISOString(),
      sources: [
        {
          id: 'src-1',
          title: 'NFRS 15 - Revenue Recognition',
          description: 'Official document for NFRS 15',
          relevance_score: 0.95
        }
      ]
    }
  ],
  2: [
    { id: '2-1', conversation_id: 2, role: 'user' as const, content: 'What are the disclosure requirements under NFRS?', created_at: new Date().toISOString() },
    {
      id: '2-2',
      conversation_id: 2,
      role: 'assistant' as const,
      content: 'NFRS disclosure requirements vary by standard but generally include providing information about the recognition, measurement, presentation and disclosure of financial statement items. Key disclosures typically include providing information about the recognition, measurement, presentation and disclosure of financial statement items. Key disclosures typically include accounting policies used, judgments made in applying those policies, assumptions about the future, and details about financial statement line items including their composition and changes during the reporting period.',
      created_at: new Date().toISOString(),
      sources: [
        {
          id: 'src-2',
          title: 'NFRS Disclosure Guide',
          description: 'Comprehensive guide to NFRS disclosures',
          relevance_score: 0.88
        }
      ]
    }
  ]
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(false); // Setting to false to disable mock mode
  const [language, setLanguage] = useState<'en' | 'ne'>('en');
  const [typingText, setTypingText] = useState<string | null>(null); // Typewriter effect state

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!localStorage.getItem('access_token')) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await chatService.getConversations();
        setConversations(response.results);
      } catch (error: any) {
        setError('Failed to load conversations');
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Enhanced typewriter effect function with fast hacker-style typing
  const typewriterEffect = (text: string, onComplete: (fullText: string) => void) => {
    let currentIndex = 0;
    setTypingText("");

    // Create variable typing speeds for a more hacker-like effect
    const getTypingDelay = () => {
      // Very rarely add a tiny pause (simulating network lag or processing)
      if (Math.random() < 0.01) return 20 + Math.random() * 30;

      // Super fast typing for most characters (hacker speed)
      return Math.random() < 0.7 ? 1 : 2 + Math.random() * 3;
    };

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        // Type larger chunks of characters for rapid typing effect
        const chunkSize = Math.floor(Math.random() * 8) + 3; // Type 3-10 characters at once
        const chunk = text.substr(currentIndex, Math.min(chunkSize, text.length - currentIndex));

        setTypingText(prev => prev + chunk);
        currentIndex += chunk.length;

        // Schedule the next chunk with variable delay
        setTimeout(typeNextChar, getTypingDelay());
      } else {
        // Typing complete
        onComplete(text);
        setTypingText(null);
      }
    };

    // Start the typing effect
    typeNextChar();
  };

  const createNewConversation = async (title: string): Promise<number> => {
    setIsLoading(true);
    setError(null);
    try {
      // Always use the real API endpoint
      const response = await chatService.createConversation({
        title,
        language
      });

      const newConversation: Conversation = {
        id: response.id,
        title: response.title,
        language: response.language,
        created_at: response.created_at,
        user: response.user
      };

      setConversations(prevConversations => [...prevConversations, newConversation]);
      setCurrentConversation(newConversation);
      setMessages([]);

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
        conversation_id: conversationId,
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
      });

      if (response) {
        // Replace the temporary message with a properly formatted user message
        setMessages(prev =>
          prev.map(msg => msg.id === tempId ? {
            ...msg,
            id: `user-${Date.now()}` // Since backend might not return ID for user message
          } : msg)
        );

        // Format the assistant's response as a Message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: (response as any).message || response.content, // Type assertion for message property
          created_at: new Date().toISOString(),
          sources: response.sources ? response.sources.map(source => ({
            id: source.id.toString(),
            title: source.title,
            description: source.title, // Use title as description if not available
            relevance_score: 1.0
          })) : undefined
        };

        // Use the typewriter effect
        typewriterEffect(assistantMessage.content, (fullText) => {
          // Replace with actual message once typing is complete
          setTypingText(null);
          setMessages(prev => [...prev, {
            ...assistantMessage,
            content: fullText
          }]);
          setIsLoading(false);
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', error);

      // Remove the temporary message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate a response for demo mode
  const simulateResponse = async (userMessage: string, tempId: string) => {
    // Replace the temporary message with a "real" one (in a real app, this would come from the server)
    const realUserMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      conversation_id: currentConversation!.id,
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
      id: Math.random().toString(36).substring(2, 15),
      conversation_id: currentConversation!.id,
      role: 'assistant' as const,
      content: responseContent,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const uploadDocument = async (formData: FormData): Promise<void> => {
    if (!currentConversation) {
      throw new Error('No active conversation');
    }

    setIsLoading(true);
    setError(null);
    try {
      // Make sure conversation_id is added to the form data if not already present
      if (!formData.has('conversation_id')) {
        formData.append('conversation_id', currentConversation.id.toString());
      }

      // Always use the real API for document uploads
      const document = await knowledgeService.uploadDocument(formData);

      // Add a user message indicating document upload
      const userMessage: Message = {
        id: `user-doc-${Date.now()}`,
        conversation_id: currentConversation.id,
        role: 'user' as const,
        content: `Uploaded document: ${document.title || formData.get('title') || 'Document'}`,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to upload document';
      setError(errorMessage);
      console.error('Error uploading document:', error);
      throw new Error(errorMessage);
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
      setLanguage,
      createNewConversation,
      selectConversation,
      updateConversation,
      deleteConversation,
      sendMessage,
      uploadDocument,
      translateMessage
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