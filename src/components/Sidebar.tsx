import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiMessageSquare, FiLogOut, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
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
import { Conversation } from '../types/api.types';
import IconWrapper from './IconWrapper';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: none;
  padding: 8px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const ConversationItem = styled(SidebarItem)`
  padding-right: 8px;
  justify-content: space-between;

  .conversation-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 8px;
  }

  .actions {
    display: none;
    margin-left: 8px;
  }

  &:hover .actions {
    display: flex;
  }

  .action-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 4px;
    margin-left: 2px;
    border-radius: 3px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }
`;

const EditInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  input {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  .edit-actions {
    display: flex;
    margin-left: 4px;

    button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      padding: 4px;
      border-radius: 3px;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.save {
        color: rgba(16, 163, 127, 0.7);

        &:hover {
          color: #10A37F;
        }
      }

      &.cancel {
        color: rgba(227, 76, 76, 0.7);

        &:hover {
          color: #e34c4c;
        }
      }
    }
  }
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
  width: 320px;
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

const EmptyConversations = styled.div`
  padding: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    conversations,
    currentConversation,
    createNewConversation,
    selectConversation,
    updateConversation,
    deleteConversation
  } = useChat();

  const [isCreating, setIsCreating] = useState(false);
  const [editingConversation, setEditingConversation] = useState<number | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<number | null>(null);

  const handleNewChat = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const conversationId = await createNewConversation(`New Chat ${new Date().toLocaleTimeString()}`);
      navigate(`/chat/${conversationId}`);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to create new chat conversation', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      await selectConversation(conversation.id);
      navigate(`/chat/${conversation.id}`);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleEditClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConversation(conversation.id);
    setTitleInput(conversation.title);
  };

  const handleDeleteClick = (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirmation(conversationId);
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingConversation && titleInput.trim()) {
      try {
        await updateConversation(editingConversation, titleInput.trim());
        setEditingConversation(null);
      } catch (error) {
        console.error('Error updating conversation:', error);
      }
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConversation(null);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && editingConversation && titleInput.trim()) {
      updateConversation(editingConversation, titleInput.trim())
        .then(() => setEditingConversation(null))
        .catch(error => console.error('Error updating conversation:', error));
    } else if (e.key === 'Escape') {
      setEditingConversation(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirmation) {
      try {
        await deleteConversation(showDeleteConfirmation);
        setShowDeleteConfirmation(null);

        // If we deleted the current conversation, navigate to home
        if (currentConversation && currentConversation.id === showDeleteConfirmation) {
          navigate('/chat');
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <SidebarContainer className={isOpen ? 'open' : ''}>
        {onClose && (
          <CloseButton onClick={onClose}>
            <IconWrapper Icon={FiX} size={20} />
          </CloseButton>
        )}

        <NewChatButton onClick={handleNewChat} disabled={isCreating}>
          <IconWrapper Icon={FiPlus} />
          {isCreating ? 'Creating...' : 'New chat'}
        </NewChatButton>

        <SidebarList>
          {conversations.length === 0 ? (
            <EmptyConversations>
              No conversations yet
            </EmptyConversations>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                active={currentConversation?.id === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
              >
                {editingConversation === conversation.id ? (
                  <EditInputContainer onClick={e => e.stopPropagation()}>
                    <input
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button className="save" onClick={handleSaveEdit}>
                        <IconWrapper Icon={FiEdit} size={14} />
                      </button>
                      <button className="cancel" onClick={handleCancelEdit}>
                        <IconWrapper Icon={FiX} size={14} />
                      </button>
                    </div>
                  </EditInputContainer>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <IconWrapper Icon={FiMessageSquare} />
                      <div className="conversation-title">{conversation.title}</div>
                    </div>
                    <div className="actions">
                      <button
                        className="action-btn"
                        onClick={(e) => handleEditClick(conversation, e)}
                      >
                        <IconWrapper Icon={FiEdit} size={14} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={(e) => handleDeleteClick(conversation.id, e)}
                      >
                        <IconWrapper Icon={FiTrash2} size={14} />
                      </button>
                    </div>
                  </>
                )}
              </ConversationItem>
            ))
          )}
        </SidebarList>

        <SidebarFooter>
          <UserInfo onClick={handleLogout}>
            <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="name">{user?.username || 'User'}</div>
            <IconWrapper Icon={FiLogOut} />
          </UserInfo>
        </SidebarFooter>
      </SidebarContainer>

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
    </>
  );
};

export default Sidebar;