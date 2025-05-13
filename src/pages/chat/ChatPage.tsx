import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiMenu, FiSend, FiPlus, FiUser, FiMessageSquare, FiLogOut, FiChevronDown, FiEdit, FiTrash2 } from 'react-icons/fi';
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

const ChatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .edit-actions {
    display: flex;
    gap: 8px;
    margin-left: 10px;
  }

  .action-button {
    background: transparent;
    border: none;
    color: #6e6e80;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      background-color: #f7f7f8;
      color: #10A37F;
    }
  }
`;

const TitleInput = styled.input`
  font-size: 1rem;
  padding: 4px 8px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  margin-right: 8px;
  width: 250px;
`;

const ErrorMessage = styled.div`
  color: #e34c4c;
  background-color: rgba(227, 76, 76, 0.1);
  padding: 12px;
  border-radius: 6px;
  margin: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    margin-top: 8px;
    padding: 6px 12px;
    background-color: #10A37F;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #0c8a6b;
    }
  }
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

const DeleteConfirmation = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmationModal = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  max-width: 90%;

  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #202123;
  }

  p {
    margin-bottom: 24px;
    color: #6e6e80;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    button {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;

      &.cancel {
        background-color: white;
        border: 1px solid #e5e5e5;
        color: #6e6e80;

        &:hover {
          background-color: #f7f7f8;
        }
      }

      &.delete {
        background-color: #e34c4c;
        border: none;
        color: white;

        &:hover {
          background-color: #d43e3e;
        }
      }
    }
  }
`;

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const {
    messages,
    conversations,
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
    uploadDocument
  } = useChat();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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
      if (conversationId) {
        try {
          await selectConversation(Number(conversationId));
          setTitleInput(currentConversation?.title || '');
        } catch (error) {
          console.error('Error selecting conversation:', error);
        }
      }
    };

    initializeChat();
  }, [conversationId, selectConversation]);

  useEffect(() => {
    if (currentConversation) {
      setTitleInput(currentConversation.title);
    }
  }, [currentConversation]);

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
      if (!currentConversation) {
        // Create a descriptive title based on the user's message
        const title = content.length > 30
          ? `${content.substring(0, 30)}...`
          : content;
        
        console.log("Creating new conversation with title:", title);
        
        // Create a new conversation
        const newConversationId = await createNewConversation(title);
        
        // Navigate to the new conversation URL
        navigate(`/chat/${newConversationId}`, { replace: true });
        
        // Important: Send the message with the new conversation ID
        // This ensures we can send the message even before currentConversation is updated
        await sendMessage(content, newConversationId);
        
        return; // Exit early since we've handled the message
      }
      
      // If we already have a conversation, just send the message directly
      await sendMessage(content);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
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

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (currentConversation && titleInput.trim() !== currentConversation.title) {
      try {
        await updateConversation(currentConversation.id, titleInput.trim());
        setIsEditingTitle(false);
      } catch (error) {
        console.error('Error updating conversation title:', error);
      }
    } else {
      setIsEditingTitle(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentConversation) {
      try {
        await deleteConversation(currentConversation.id);
        setShowDeleteConfirmation(false);
        navigate('/chat');
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      if (currentConversation) {
        setTitleInput(currentConversation.title);
      }
    }
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
                  {user?.username || 'User'}
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

        {error && (
          <ErrorMessage>
            {error}
            <button onClick={() => window.location.reload()}>Retry</button>
          </ErrorMessage>
        )}

        {!error && messages.length === 0 && !currentConversation ? (
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
              <p>Hello {user?.username || 'there'}! I'm your intelligent companion for navigating Nepal Financial Reporting Standards. Type a message below to start a conversation.</p>

              <div style={{
                marginTop: '30px',
                textAlign: 'center',
                color: '#6e6e80'
              }}>
                <p>You can ask questions about:</p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <li>• NFRS standards and implementation</li>
                  <li>• Financial reporting requirements</li>
                  <li>• Accounting treatments and disclosures</li>
                  <li>• Comparative analysis with IFRS</li>
                  <li>• Best practices for compliance</li>
                </ul>
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
                onFileUpload={uploadDocument}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <EnhancedChatContainer>
            <ChatHeader>
              <ChatTitle>
                {isEditingTitle ? (
                  <>
                    <TitleInput
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={handleTitleKeyDown}
                      autoFocus
                    />
                  </>
                ) : (
                  <>
                    {/* No title or buttons here for a cleaner interface */}
                  </>
                )}
              </ChatTitle>
            </ChatHeader>

            <MessageList messages={messages} />

            <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <ChatInput
                onSendMessage={handleSendMessage}
                onFileUpload={uploadDocument}
                isLoading={isLoading}
              />
            </div>
          </EnhancedChatContainer>
        )}
      </MainContent>

      {showDeleteConfirmation && (
        <DeleteConfirmation>
          <ConfirmationModal>
            <h3>Delete Conversation</h3>
            <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
            <div className="actions">
              <button className="cancel" onClick={handleDeleteCancel}>Cancel</button>
              <button className="delete" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </ConfirmationModal>
        </DeleteConfirmation>
      )}
    </EnhancedContainer>
  );
};

export default ChatPage;