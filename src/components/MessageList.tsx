import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MessagesContainer, Message, SourcesContainer, SourcesTitle, SourceItem } from './StyledComponents';
import { Message as MessageType, DocumentSource } from '../types/api.types';
import { FiUser } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import IconWrapper from './IconWrapper';

// Enhanced message container
const EnhancedMessagesContainer = styled(MessagesContainer)`
  background-color: white;
  padding: 1rem 0;
`;

// Enhanced message component
const EnhancedMessage = styled(Message)`
  padding: 1rem 1.5rem;
  max-width: 900px;
  margin: 0 auto 1.5rem;
  border-radius: 0;

  &:last-child {
    margin-bottom: 0;
  }

  ${props => props.role === 'user' ? `
    background-color: #f7f7f8;
  ` : `
    background-color: white;
  `}

  .content {
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

// Enhanced sources container
const EnhancedSourcesContainer = styled(SourcesContainer)`
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
`;

const EnhancedSourcesTitle = styled(SourcesTitle)`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6e6e80;
  margin-bottom: 0.5rem;

  svg {
    margin-right: 6px;
  }
`;

const EnhancedSourceItem = styled(SourceItem)`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #f7f7f8;
  border-radius: 6px;
  font-size: 0.85rem;

  .title {
    font-weight: 500;
    color: #10A37F;
  }

  .description {
    color: #6e6e80;
    margin-left: 6px;
    font-size: 0.8rem;
  }

  .score {
    margin-left: auto;
    font-size: 0.75rem;
    color: #6e6e80;
    background-color: rgba(16, 163, 127, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
  }
`;

// Typing indicator
const TypingIndicator = styled.div`
  display: flex;
  padding: 1rem 1.5rem;
  max-width: 900px;
  margin: 0 auto 1rem;

  .dots {
    display: flex;
    align-items: center;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10A37F;
      margin-right: 4px;
      animation: bounce 1.4s infinite ease-in-out both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

// Message time display
const MessageTime = styled.div`
  font-size: 0.7rem;
  color: #a9a9a9;
  margin-top: 6px;
  text-align: right;
`;

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (messages.length === 0 && !isLoading) {
    return null;
  }

  return (
    <EnhancedMessagesContainer>
      {messages.map((message) => (
        <EnhancedMessage key={message.id} role={message.role}>
          <div className="avatar">
            {message.role === 'user' ? (
              <IconWrapper Icon={FiUser} />
            ) : (
              <IconWrapper Icon={RiRobot2Fill} />
            )}
          </div>
          <div className="content">
            {message.content}

            {/* Show sources if available */}
            {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
              <EnhancedSourcesContainer>
                <EnhancedSourcesTitle>
                  Sources:
                </EnhancedSourcesTitle>
                {message.sources.map((source) => (
                  <EnhancedSourceItem key={source.id}>
                    <span className="title">{source.title}</span>
                    <span className="description">- {source.description}</span>
                    {source.relevance_score && (
                      <span className="score">
                        {Math.round(source.relevance_score * 100)}% relevant
                      </span>
                    )}
                  </EnhancedSourceItem>
                ))}
              </EnhancedSourcesContainer>
            )}

            <MessageTime>
              {formatTime(message.created_at)}
            </MessageTime>
          </div>
        </EnhancedMessage>
      ))}

      {isLoading && (
        <TypingIndicator>
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </TypingIndicator>
      )}

      <div ref={messagesEndRef} />
    </EnhancedMessagesContainer>
  );
};

export default MessageList;