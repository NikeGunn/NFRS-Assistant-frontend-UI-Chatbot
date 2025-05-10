import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import {
  Sidebar as SidebarContainer,
  NewChatButton,
  SidebarList,
  SidebarItem,
  SidebarFooter,
  UserInfo
} from './StyledComponents';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { ChatSession } from '../types/api.types';
import IconWrapper from './IconWrapper';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { sessions, currentSession, createNewSession, selectSession } = useChat();

  const [isCreating, setIsCreating] = useState(false);

  const handleNewChat = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const sessionId = await createNewSession(`New Chat ${new Date().toLocaleString()}`);
      navigate(`/chat/${sessionId}`);
    } catch (error) {
      console.error('Failed to create new chat session', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectSession = async (session: ChatSession) => {
    await selectSession(session.id);
    navigate(`/chat/${session.id}`);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarContainer className={isOpen ? 'open' : ''}>
      <NewChatButton onClick={handleNewChat} disabled={isCreating}>
        <IconWrapper Icon={FiPlus} />
        {isCreating ? 'Creating...' : 'New chat'}
      </NewChatButton>

      <SidebarList>
        {sessions.map((session) => (
          <SidebarItem
            key={session.id}
            active={currentSession?.id === session.id}
            onClick={() => handleSelectSession(session)}
          >
            <IconWrapper Icon={FiMessageSquare} />
            {session.title}
          </SidebarItem>
        ))}
      </SidebarList>

      <SidebarFooter>
        <UserInfo onClick={handleLogout}>
          <div className="avatar">U</div>
          <div className="name">User</div>
          <IconWrapper Icon={FiLogOut} />
        </UserInfo>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;