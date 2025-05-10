import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatSession, ChatMessage } from '../types/api.types';
import { chatService } from '../services/api.service';

interface ChatContextType {
  sessions: ChatSession[];
  messages: ChatMessage[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  language: 'en' | 'ne';
  setLanguage: (lang: 'en' | 'ne') => void;
  createNewSession: (title: string) => Promise<string>;
  selectSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, shouldSummarize?: boolean) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock data for testing
const MOCK_SESSIONS: ChatSession[] = [
  { id: 'session-1', title: 'NFRS 15 Discussion', created_at: new Date().toISOString(), user: 1 },
  { id: 'session-2', title: 'Financial Reporting Guidelines', created_at: new Date().toISOString(), user: 1 }
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'session-1': [
    { id: 'msg-1-1', session_id: 'session-1', role: 'user', content: 'What is NFRS 15?', created_at: new Date().toISOString() },
    { id: 'msg-1-2', session_id: 'session-1', role: 'assistant', content: 'NFRS 15 is the Nepal Financial Reporting Standard for Revenue from Contracts with Customers. It establishes a comprehensive framework for determining when and how much revenue to recognize. The standard is based on a core principle that an entity should recognize revenue to depict the transfer of promised goods or services to customers in an amount that reflects the consideration to which the entity expects to be entitled in exchange for those goods or services.', created_at: new Date().toISOString() }
  ],
  'session-2': [
    { id: 'msg-2-1', session_id: 'session-2', role: 'user', content: 'What are the disclosure requirements under NFRS?', created_at: new Date().toISOString() },
    { id: 'msg-2-2', session_id: 'session-2', role: 'assistant', content: 'NFRS disclosure requirements vary by standard but generally include providing information about the recognition, measurement, presentation and disclosure of financial statement items. Key disclosures typically include accounting policies used, judgments made in applying those policies, assumptions about the future, and details about financial statement line items including their composition and changes during the reporting period.', created_at: new Date().toISOString() }
  ]
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(true); // For testing
  const [language, setLanguage] = useState<'en' | 'ne'>('en');

  // Load chat sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!localStorage.getItem('access_token')) {
        return;
      }

      setIsLoading(true);
      try {
        if (isMockMode) {
          // Use mock data for testing
          setSessions(MOCK_SESSIONS);
        } else {
          const response = await chatService.getChatSessions();
          setSessions(response.results);
        }
      } catch (error: any) {
        setError('Failed to load chat sessions');
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [isMockMode]);

  const createNewSession = async (title: string): Promise<string> => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        // Create a mock session
        const newSessionId = `session-${Date.now()}`;
        const newSession: ChatSession = {
          id: newSessionId,
          title,
          created_at: new Date().toISOString(),
          user: 1
        };

        setSessions((prevSessions) => [...prevSessions, newSession]);
        setCurrentSession(newSession);
        setMessages([]);

        // Add to mock data for persistence during the session
        MOCK_MESSAGES[newSessionId] = [];

        return newSessionId;
      } else {
        const response = await chatService.createChatSession({ title });

        setSessions((prevSessions) => [...prevSessions, {
          id: response.id,
          title: response.title,
          created_at: response.created_at,
          user: response.user
        }]);

        setCurrentSession({
          id: response.id,
          title: response.title,
          created_at: response.created_at,
          user: response.user
        });

        setMessages([]);

        return response.id;
      }
    } catch (error: any) {
      setError('Failed to create new chat session');
      console.error('Error creating session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = async (sessionId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      setCurrentSession(session);

      if (isMockMode) {
        // Use mock messages
        setMessages(MOCK_MESSAGES[sessionId] || []);
      } else {
        const response = await chatService.getChatMessages(sessionId);
        setMessages(response.results);
      }
    } catch (error: any) {
      setError('Failed to load chat messages');
      console.error('Error selecting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated sendMessage function to use current language
  const sendMessage = async (content: string, shouldSummarize: boolean = false): Promise<void> => {
    if (!currentSession) {
      throw new Error('No active chat session');
    }

    // Add user message immediately for responsive UI
    const userMessage: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      session_id: currentSession.id,
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (isMockMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock response based on the query
        let responseContent = '';

        // Check for specific NFRS related terms
        if (content.toLowerCase().includes('nfrs 15')) {
          responseContent = language === 'en'
            ? 'NFRS 15 establishes principles for reporting information about the nature, amount, timing, and uncertainty of revenue and cash flows arising from contracts with customers. It follows a five-step model for revenue recognition: 1) Identify the contract with the customer, 2) Identify performance obligations, 3) Determine the transaction price, 4) Allocate the transaction price to the performance obligations, and 5) Recognize revenue when each performance obligation is satisfied.'
            : 'NFRS १५ ले ग्राहकहरूसँगको सम्झौताबाट प्राप्त हुने राजस्व र नगद प्रवाहको प्रकृति, रकम, समय र अनिश्चितताको बारेमा रिपोर्टिङको लागि सिद्धान्तहरू स्थापित गर्दछ। यसले राजस्व पहिचानको लागि पाँच-चरणको मोडेल अनुसरण गर्दछ: १) ग्राहकसँग सम्झौता पहिचान गर्नुहोस्, २) कार्यसम्पादन दायित्वहरू पहिचान गर्नुहोस्, ३) लेनदेन मूल्य निर्धारण गर्नुहोस्, ४) लेनदेन मूल्यलाई कार्यसम्पादन दायित्वहरूमा विनियोजित गर्नुहोस्, र ५) प्रत्येक कार्यसम्पादन दायित्व सन्तुष्ट भएपछि राजस्वको पहिचान गर्नुहोस्।';
        } else if (content.toLowerCase().includes('nfrs 9')) {
          responseContent = language === 'en'
            ? 'NFRS 9 addresses the accounting for financial instruments. It includes requirements for recognition and measurement, impairment, derecognition and general hedge accounting. The standard introduces an expected credit loss model for impairment that requires timely recognition of expected credit losses.'
            : 'NFRS ९ ले वित्तीय उपकरणहरूको लेखांकनलाई सम्बोधन गर्दछ। यसमा पहिचान र मापन, क्षीणता, अमान्यता र सामान्य हेज लेखांकनको लागि आवश्यकताहरू समावेश छन्। मानकले क्षीणताको लागि अपेक्षित क्रेडिट नोक्सानी मोडेल प्रस्तुत गर्दछ जसले अपेक्षित क्रेडिट नोक्सानीको समयमै पहिचानको आवश्यकता पर्दछ।';
        } else if (content.toLowerCase().includes('nfrs 16')) {
          responseContent = language === 'en'
            ? 'NFRS 16 sets out the principles for the recognition, measurement, presentation and disclosure of leases. It requires lessees to recognize most leases on the balance sheet as lease liabilities, with corresponding right-of-use assets. Key disclosure requirements include detailed breakdowns of lease expenses, maturity analysis of lease liabilities, and information about variable lease payments.'
            : 'NFRS १६ ले लिजको पहिचान, मापन, प्रस्तुति र खुलासाको लागि सिद्धान्तहरू निर्धारित गर्दछ। यसले लिजहरूलाई ब्यालेन्स सिटमा लिज दायित्वहरू र सम्बन्धित प्रयोग-अधिकार सम्पत्तिहरूको रूपमा पहिचान गर्न लिजीहरूलाई आवश्यक पर्दछ। प्रमुख खुलासा आवश्यकताहरूमा लिज खर्चहरूको विस्तृत विवरण, लिज दायित्वहरूको परिपक्वता विश्लेषण, र परिवर्तनीय लिज भुक्तानीहरूको बारेमा जानकारी समावेश छन्।';
        } else if (content.toLowerCase().includes('five-step') || content.toLowerCase().includes('revenue recognition')) {
          responseContent = language === 'en'
            ? 'The five-step model in revenue recognition under NFRS 15 consists of: 1) Identify the contract with the customer, 2) Identify performance obligations in the contract, 3) Determine the transaction price, 4) Allocate the transaction price to the performance obligations, and 5) Recognize revenue when each performance obligation is satisfied. This model ensures that entities recognize revenue in a consistent manner that depicts the transfer of promised goods or services to customers.'
            : 'NFRS १५ अन्तर्गत राजस्व पहिचानमा पाँच-चरण मोडेल यस प्रकार छ: १) ग्राहकसँग सम्झौता पहिचान गर्नुहोस्, २) सम्झौतामा कार्यसम्पादन दायित्वहरू पहिचान गर्नुहोस्, ३) लेनदेन मूल्य निर्धारण गर्नुहोस्, ४) लेनदेन मूल्यलाई कार्यसम्पादन दायित्वहरूमा विनियोजित गर्नुहोस्, र ५) प्रत्येक कार्यसम्पादन दायित्व सन्तुष्ट भएपछि राजस्वको पहिचान गर्नुहोस्। यस मोडेलले निकायहरूले ग्राहकहरूलाई प्रतिज्ञा गरिएका सामान वा सेवाहरूको हस्तान्तरणलाई प्रतिबिम्बित गर्ने सुसंगत तरिकामा राजस्व पहिचान गर्छन् भन्ने सुनिश्चित गर्दछ।';
        } else if (content.toLowerCase().includes('disclosure') || content.toLowerCase().includes('requirements')) {
          responseContent = language === 'en'
            ? 'Disclosure requirements under NFRS vary by standard. Generally, they require entities to provide information about the recognition, measurement, presentation of financial items and risk management. Key disclosure requirements include accounting policies, significant judgments, estimation uncertainties, and detailed breakdowns of financial statement line items. The objective is to enable users to understand the financial statements and assess the entity\'s financial position and performance.'
            : 'NFRS अन्तर्गत प्रकटीकरण आवश्यकताहरू मानक अनुसार भिन्न हुन्छन्। सामान्यतया, तिनीहरूले संस्थाहरूलाई वित्तीय वस्तुहरूको पहिचान, मापन, प्रस्तुति र जोखिम व्यवस्थापनको बारेमा जानकारी प्रदान गर्न आवश्यक छ। प्रमुख प्रकटीकरण आवश्यकताहरूमा लेखांकन नीतिहरू, महत्त्वपूर्ण निर्णयहरू, अनुमान अनिश्चितताहरू, र वित्तीय विवरण लाइन आइटमहरूको विस्तृत विवरण समावेश छन्। उद्देश्य प्रयोगकर्ताहरूलाई वित्तीय विवरणहरू बुझ्न र संस्थाको वित्तीय स्थिति र प्रदर्शनको मूल्यांकन गर्न सक्षम बनाउनु हो।';
        } else {
          // Provide a default response for any input, including simple greetings like "hello"
          responseContent = language === 'en'
            ? `Thank you for your message: "${content}". As the NFRS Assistant, I can help you with questions about Nepal Financial Reporting Standards. For example, you can ask about specific standards like NFRS 15 (Revenue Recognition), NFRS 9 (Financial Instruments), or NFRS 16 (Leases). I can also explain accounting concepts, disclosure requirements, and practical applications of these standards. How can I assist you today with your NFRS-related queries?`
            : `तपाईंको सन्देशको लागि धन्यवाद: "${content}". NFRS सहायकको रूपमा, म तपाईंलाई नेपाल वित्तीय प्रतिवेदन मानकहरू बारे प्रश्नहरूमा मद्दत गर्न सक्छु। उदाहरणका लागि, तपाईं NFRS 15 (राजस्व मान्यता), NFRS 9 (वित्तीय उपकरणहरू), वा NFRS 16 (लिजहरू) जस्ता विशिष्ट मानकहरू बारे सोध्न सक्नुहुन्छ। म लेखांकन अवधारणाहरू, प्रकटीकरण आवश्यकताहरू, र यी मानकहरूको व्यावहारिक अनुप्रयोगहरू पनि बताउन सक्छु। म तपाईंलाई NFRS-सम्बन्धित प्रश्नहरूमा आज कसरी सहयोग गर्न सक्छु?`;
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-msg-${Date.now()}`,
          session_id: currentSession.id,
          role: 'assistant',
          content: responseContent,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update mock data for persistence
        MOCK_MESSAGES[currentSession.id] = [
          ...(MOCK_MESSAGES[currentSession.id] || []),
          userMessage,
          assistantMessage
        ];
      } else {
        const response = await chatService.sendMessage(currentSession.id, {
          content,
          language,
          should_summarize: shouldSummarize
        });

        const assistantMessage: ChatMessage = {
          id: response.session_id ? response.session_id : `assistant-msg-${Date.now()}`,
          session_id: currentSession.id,
          role: 'assistant',
          content: response.response,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      sessions,
      messages,
      currentSession,
      isLoading,
      error,
      language,
      setLanguage,
      createNewSession,
      selectSession,
      sendMessage
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