import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiMenu, FiSend, FiPlus, FiUser, FiMessageSquare, FiLogOut, FiChevronDown } from 'react-icons/fi';
import {
  Container,
  MainContent,
  Header,
  Logo,
  ChatContainer,
  EmptyChat,
  SuggestionButton,
  LanguageSwitcher
} from '../../components/StyledComponents';
import Sidebar from '../../components/Sidebar';
import MessageList from '../../components/MessageList';
import ChatInput from '../../components/ChatInput';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import IconWrapper from '../../components/IconWrapper';

// Enhanced styled components for a more modern look
const EnhancedContainer = styled(Container)`
  background-color: #fafafa;
`;

const EnhancedHeader = styled(Header)`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const EnhancedLogo = styled(Logo)`
  font-size: 1.4rem;
  font-weight: 700;
  color: #10A37F;
  display: flex;
  align-items: center;

  svg {
    margin-right: 8px;
    color: #10A37F;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f7f7f8;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #10A37F;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    font-size: 16px;
    font-weight: 500;
  }

  .name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #202123;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    margin-left: 6px;
    color: #6e6e80;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #10A37F;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0c8a6b;
  }

  svg {
    margin-right: 6px;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;

    span {
      display: none;
    }

    svg {
      margin-right: 0;
    }
  }
`;

const EnhancedEmptyChat = styled(EmptyChat)`
  background-color: white;
  border-radius: 12px;
  margin: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 3rem 2rem;

  h2 {
    color: #10A37F;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    color: #6e6e80;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 600px;
  }

  .suggestions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
    width: 100%;
    max-width: 800px;
  }
`;

const EnhancedSuggestionButton = styled(SuggestionButton)`
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  text-align: left;
  transition: all 0.2s;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;

  &:hover {
    border-color: #10A37F;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const EnhancedChatContainer = styled(ChatContainer)`
  background-color: white;
  border-radius: 12px;
  margin: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);

  @media (max-width: 768px) {
    margin: 0.5rem;
    height: calc(100vh - 70px);
  }
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 1rem;
  font-weight: 600;
  color: #202123;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transform: ${props => props.isOpen ? 'translateY(8px)' : 'translateY(0)'};
  transition: all 0.2s;
`;

const UserMenuItem = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #202123;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f7f7f8;
  }

  svg {
    margin-right: 8px;
    color: #6e6e80;
  }

  &.logout {
    border-top: 1px solid #e5e5e5;
    color: #d9534f;

    svg {
      color: #d9534f;
    }
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    messages,
    currentSession,
    isLoading,
    language,
    setLanguage,
    createNewSession,
    selectSession,
    sendMessage
  } = useChat();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastResponseSources, setLastResponseSources] = useState<any[] | undefined>(undefined);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sample suggestions for empty state
  const suggestions = [
    "What is NFRS 15?",
    "Explain the five-step model in revenue recognition",
    "How do I account for financial instruments under NFRS 9?",
    "What are the disclosure requirements for NFRS 16 leases?",
    "Compare NFRS and IFRS differences",
    "Explain impairment testing under NFRS"
  ];

  useEffect(() => {
    const initializeChat = async () => {
      if (sessionId) {
        await selectSession(sessionId);
      }
    };

    initializeChat();
  }, [sessionId, selectSession]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    try {
      if (!currentSession) {
        const newSessionId = await createNewSession(`Chat about ${content.substring(0, 20)}...`);
        navigate(`/chat/${newSessionId}`, { replace: true });
      }

      await sendMessage(content, true);

      // For demo purposes, we're setting mock sources
      setLastResponseSources([
        {
          id: "1",
          title: "NFRS 15 - Revenue Recognition",
          description: "Official document for NFRS 15",
          category: "Revenue Standards"
        },
        {
          id: "2",
          title: "NFRS Implementation Guide",
          description: "Implementation guidance for NFRS standards",
          category: "Guidelines"
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <EnhancedContainer>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <MainContent>
        <EnhancedHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '15px', cursor: 'pointer' }} onClick={toggleSidebar}>
              <IconWrapper Icon={FiMenu} size={24} />
            </span>
            <EnhancedLogo>
              <IconWrapper Icon={FiMessageSquare} size={20} />
              NFRS Assistant
            </EnhancedLogo>
          </div>

          <HeaderControls>
            <LanguageSwitcher>
              <button
                className={language === 'en' ? 'active' : ''}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                className={language === 'ne' ? 'active' : ''}
                onClick={() => setLanguage('ne')}
              >
                नेपाली
              </button>
            </LanguageSwitcher>

            <NewChatButton onClick={handleNewChat}>
              <IconWrapper Icon={FiPlus} size={16} />
              <span>New Chat</span>
            </NewChatButton>

            <UserMenuContainer ref={userMenuRef}>
              <UserProfile onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="avatar">
                  <IconWrapper Icon={FiUser} size={16} />
                </div>
                <div className="name">
                  User
                </div>
                <IconWrapper Icon={FiChevronDown} size={16} />
              </UserProfile>

              <UserMenu isOpen={userMenuOpen}>
                <UserMenuItem>
                  <IconWrapper Icon={FiUser} size={16} />
                  Profile
                </UserMenuItem>
                <UserMenuItem className="logout" onClick={handleLogout}>
                  <IconWrapper Icon={FiLogOut} size={16} />
                  Sign Out
                </UserMenuItem>
              </UserMenu>
            </UserMenuContainer>
          </HeaderControls>
        </EnhancedHeader>

        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)',
            position: 'relative'
          }}>
            <EnhancedEmptyChat style={{
              flex: 1,
              overflow: 'auto',
              marginBottom: '90px',
              paddingBottom: '20px'
            }}>
              <h2>Welcome to NFRS Assistant</h2>
              <p>Your intelligent companion for navigating Nepal Financial Reporting Standards. Ask me anything about NFRS.</p>
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <EnhancedSuggestionButton
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </EnhancedSuggestionButton>
                ))}
              </div>
            </EnhancedEmptyChat>

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1rem',
              backgroundColor: 'white',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
              zIndex: 10
            }}>
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <EnhancedChatContainer>
            <ChatHeader>
              {currentSession?.title || 'New Conversation'}
            </ChatHeader>
            <MessageList messages={messages} sources={lastResponseSources} />
            <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </EnhancedChatContainer>
        )}
      </MainContent>
    </EnhancedContainer>
  );
};

export default ChatPage;