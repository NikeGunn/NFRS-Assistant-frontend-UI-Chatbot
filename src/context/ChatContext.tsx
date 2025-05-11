import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, DocumentSource } from '../types/api.types';
import { chatService } from '../services/api.service';

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  language: 'en' | 'ne';
  setLanguage: (lang: 'en' | 'ne') => void;
  createNewConversation: (title: string) => Promise<number>;
  selectConversation: (id: number) => Promise<void>;
  updateConversation: (id: number, title: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
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
    { id: '1-1', conversation_id: 1, role: 'user', content: 'What is NFRS 15?', created_at: new Date().toISOString() },
    {
      id: '1-2',
      conversation_id: 1,
      role: 'assistant',
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
    { id: '2-1', conversation_id: 2, role: 'user', content: 'What are the disclosure requirements under NFRS?', created_at: new Date().toISOString() },
    {
      id: '2-2',
      conversation_id: 2,
      role: 'assistant',
      content: 'NFRS disclosure requirements vary by standard but generally include providing information about the recognition, measurement, presentation and disclosure of financial statement items. Key disclosures typically include accounting policies used, judgments made in applying those policies, assumptions about the future, and details about financial statement line items including their composition and changes during the reporting period.',
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
  const [isMockMode, setIsMockMode] = useState<boolean>(true); // For testing
  const [language, setLanguage] = useState<'en' | 'ne'>('en');

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!localStorage.getItem('access_token')) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        if (isMockMode) {
          // Use mock data for testing
          setConversations(MOCK_CONVERSATIONS);
        } else {
          const response = await chatService.getConversations();
          setConversations(response.results);
        }
      } catch (error: any) {
        setError('Failed to load conversations');
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [isMockMode]);

  const createNewConversation = async (title: string): Promise<number> => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        // Create a mock conversation
        const newId = Math.max(0, ...conversations.map(c => c.id)) + 1;
        const newConversation: Conversation = {
          id: newId,
          title,
          language,
          created_at: new Date().toISOString(),
          user: 1
        };

        setConversations(prevConversations => [...prevConversations, newConversation]);
        setCurrentConversation(newConversation);
        setMessages([]);

        // Add to mock data for persistence during the session
        MOCK_MESSAGES[newId] = [];

        return newId;
      } else {
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
      }
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

      if (isMockMode) {
        // Use mock messages
        setMessages(MOCK_MESSAGES[id] || []);
      } else {
        const conversationDetails = await chatService.getConversationDetails(id);
        setMessages(conversationDetails.messages || []);
      }
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
      if (isMockMode) {
        // Update mock conversation
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === id ? { ...conv, title } : conv
          )
        );

        if (currentConversation?.id === id) {
          setCurrentConversation(prev => prev ? { ...prev, title } : null);
        }
      } else {
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
      if (isMockMode) {
        // Delete mock conversation
        setConversations(prevConversations =>
          prevConversations.filter(conv => conv.id !== id)
        );

        if (currentConversation?.id === id) {
          setCurrentConversation(null);
          setMessages([]);
        }

        // Remove from mock data
        if (id in MOCK_MESSAGES) {
          delete MOCK_MESSAGES[id];
        }
      } else {
        await chatService.deleteConversation(id);

        setConversations(prevConversations =>
          prevConversations.filter(conv => conv.id !== id)
        );

        if (currentConversation?.id === id) {
          setCurrentConversation(null);
          setMessages([]);
        }
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

  const sendMessage = async (content: string): Promise<void> => {
    if (!currentConversation) {
      throw new Error('No active conversation');
    }

    // Add user message immediately for responsive UI
    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      conversation_id: currentConversation.id,
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      if (isMockMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock response based on the query
        let responseContent = '';
        let sources: DocumentSource[] = [];

        // Check for specific NFRS related terms
        if (content.toLowerCase().includes('nfrs 15')) {
          responseContent = language === 'en'
            ? 'NFRS 15 establishes principles for reporting information about the nature, amount, timing, and uncertainty of revenue and cash flows arising from contracts with customers. It follows a five-step model for revenue recognition: 1) Identify the contract with the customer, 2) Identify performance obligations, 3) Determine the transaction price, 4) Allocate the transaction price to the performance obligations, and 5) Recognize revenue when each performance obligation is satisfied.'
            : 'NFRS १५ ले ग्राहकहरूसँगको सम्झौताबाट प्राप्त हुने राजस्व र नगद प्रवाहको प्रकृति, रकम, समय र अनिश्चितताको बारेमा रिपोर्टिङको लागि सिद्धान्तहरू स्थापित गर्दछ। यसले राजस्व पहिचानको लागि पाँच-चरणको मोडेल अनुसरण गर्दछ: १) ग्राहकसँग सम्झौता पहिचान गर्नुहोस्, २) कार्यसम्पादन दायित्वहरू पहिचान गर्नुहोस्, ३) लेनदेन मूल्य निर्धारण गर्नुहोस्, ४) लेनदेन मूल्यलाई कार्यसम्पादन दायित्वहरूमा विनियोजित गर्नुहोस्, र ५) प्रत्येक कार्यसम्पादन दायित्व सन्तुष्ट भएपछि राजस्वको पहिचान गर्नुहोस्।';

          sources = [
            {
              id: 'src-' + Date.now(),
              title: 'NFRS 15 - Revenue Recognition',
              description: 'Official document for NFRS 15',
              relevance_score: 0.95
            }
          ];
        } else if (content.toLowerCase().includes('nfrs 9')) {
          responseContent = language === 'en'
            ? 'NFRS 9 addresses the accounting for financial instruments. It includes requirements for recognition and measurement, impairment, derecognition and general hedge accounting. The standard introduces an expected credit loss model for impairment that requires timely recognition of expected credit losses.'
            : 'NFRS ९ ले वित्तीय उपकरणहरूको लेखांकनलाई सम्बोधन गर्दछ। यसमा पहिचान र मापन, क्षीणता, अमान्यता र सामान्य हेज लेखांकनको लागि आवश्यकताहरू समावेश छन्। मानकले क्षीणताको लागि अपेक्षित क्रेडिट नोक्सानी मोडेल प्रस्तुत गर्दछ जसले अपेक्षित क्रेडिट नोक्सानीको समयमै पहिचानको आवश्यकता पर्दछ।';

          sources = [
            {
              id: 'src-' + Date.now(),
              title: 'NFRS 9 - Financial Instruments',
              description: 'Comprehensive guide to financial instruments',
              relevance_score: 0.92
            }
          ];
        } else if (content.toLowerCase().includes('nfrs 16')) {
          responseContent = language === 'en'
            ? 'NFRS 16 sets out the principles for the recognition, measurement, presentation and disclosure of leases. It requires lessees to recognize most leases on the balance sheet as lease liabilities, with corresponding right-of-use assets. Key disclosure requirements include detailed breakdowns of lease expenses, maturity analysis of lease liabilities, and information about variable lease payments.'
            : 'NFRS १६ ले लिजको पहिचान, मापन, प्रस्तुति र खुलासाको लागि सिद्धान्तहरू निर्धारित गर्दछ। यसले लिजहरूलाई ब्यालेन्स सिटमा लिज दायित्वहरू र सम्बन्धित प्रयोग-अधिकार सम्पत्तिहरूको रूपमा पहिचान गर्न लिजीहरूलाई आवश्यक पर्दछ। प्रमुख खुलासा आवश्यकताहरूमा लिज खर्चहरूको विस्तृत विवरण, लिज दायित्वहरूको परिपक्वता विश्लेषण, र परिवर्तनीय लिज भुक्तानीहरूको बारेमा जानकारी समावेश छन्।';

          sources = [
            {
              id: 'src-' + Date.now(),
              title: 'NFRS 16 - Leases',
              description: 'Official lease accounting standard',
              relevance_score: 0.89
            }
          ];
        } else {
          // Provide a default response for any input, including simple greetings
          responseContent = language === 'en'
            ? `Thank you for your message: "${content}". As the NFRS Assistant, I can help you with questions about Nepal Financial Reporting Standards. For example, you can ask about specific standards like NFRS 15 (Revenue Recognition), NFRS 9 (Financial Instruments), or NFRS 16 (Leases). I can also explain accounting concepts, disclosure requirements, and practical applications of these standards. How can I assist you today with your NFRS-related queries?`
            : `तपाईंको सन्देशको लागि धन्यवाद: "${content}". NFRS सहायकको रूपमा, म तपाईंलाई नेपाल वित्तीय प्रतिवेदन मानकहरू बारे प्रश्नहरूमा मद्दत गर्न सक्छु। उदाहरणका लागि, तपाईं NFRS 15 (राजस्व मान्यता), NFRS 9 (वित्तीय उपकरणहरू), वा NFRS 16 (लिजहरू) जस्ता विशिष्ट मानकहरू बारे सोध्न सक्नुहुन्छ। म लेखांकन अवधारणाहरू, प्रकटीकरण आवश्यकताहरू, र यी मानकहरूको व्यावहारिक अनुप्रयोगहरू पनि बताउन सक्छु। म तपाईंलाई NFRS-सम्बन्धित प्रश्नहरूमा आज कसरी सहयोग गर्न सक्छु?`;

          sources = [];
        }

        const assistantMessage: Message = {
          id: `assistant-msg-${Date.now()}`,
          conversation_id: currentConversation.id,
          role: 'assistant',
          content: responseContent,
          sources,
          created_at: new Date().toISOString()
        };

        // Replace the temporary message and add the assistant message
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempId),
          { ...userMessage, id: `user-msg-${Date.now()}` },
          assistantMessage
        ]);

        // Update mock data for persistence
        MOCK_MESSAGES[currentConversation.id] = [
          ...(MOCK_MESSAGES[currentConversation.id] || []),
          { ...userMessage, id: `user-msg-${Date.now()}` },
          assistantMessage
        ];
      } else {
        const response = await chatService.sendMessage({
          conversation_id: currentConversation.id,
          content,
          language
        });

        // Replace the temporary message and add the assistant message
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempId),
          {
            id: `user-msg-${Date.now()}`,
            conversation_id: currentConversation.id,
            role: 'user',
            content,
            created_at: new Date().toISOString()
          },
          {
            id: response.id,
            conversation_id: currentConversation.id,
            role: 'assistant',
            content: response.content,
            sources: response.sources,
            created_at: response.created_at || new Date().toISOString()
          }
        ]);
      }
    } catch (error: any) {
      // Keep the user message but mark it as error
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { ...userMessage, id: `user-msg-${Date.now()}` }
      ]);

      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', error);
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
      if (isMockMode) {
        // Simple mock translation (not real!)
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (sourceLang === 'en' && targetLang === 'ne') {
          return `नेपालीमा अनुवाद: ${text}`;
        } else if (sourceLang === 'ne' && targetLang === 'en') {
          return `English translation: ${text}`;
        }

        return text;
      } else {
        const response = await chatService.translateText({
          text,
          source_language: sourceLang,
          target_language: targetLang
        });

        return response.translated_text;
      }
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
      setLanguage,
      createNewConversation,
      selectConversation,
      updateConversation,
      deleteConversation,
      sendMessage,
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