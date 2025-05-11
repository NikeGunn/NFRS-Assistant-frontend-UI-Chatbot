import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MessagesContainer, Message, SourcesContainer, SourcesTitle, SourceItem } from './StyledComponents';
import { Message as MessageType, DocumentSource } from '../types/api.types';
import { FiUser } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import IconWrapper from './IconWrapper';
import { useChat } from '../context/ChatContext';

// Main messages container
const EnhancedMessagesContainer = styled(MessagesContainer)`
  padding: 2rem 25%;  /* Further increased padding for more space on left and right */
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  background-color: transparent; /* No background */

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  @media (max-width: 1400px) {
    padding: 2rem 20%; /* Adjusted padding for larger screens */
  }

  @media (max-width: 1200px) {
    padding: 2rem 15%; /* Adjusted padding for medium screens */
  }

  @media (max-width: 1024px) {
    padding: 2rem 10%; /* Less padding on smaller screens */
  }

  @media (max-width: 768px) {
    padding: 1.5rem 5%; /* Minimal padding on mobile */
  }
`;

// Message with clear positioning - user right, assistant left
const EnhancedMessage = styled(Message) <{ role: 'user' | 'assistant' }>`
  padding: 1.2rem;
  max-width: ${props => props.role === 'user' ? '75%' : '100%'};
  margin-bottom: 2rem;  /* Increased margin between messages */
  position: relative;
  align-self: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  box-shadow: none; /* Removed box shadow */
  width: ${props => props.role === 'assistant' ? '100%' : 'auto'};

  &:last-child {
    margin-bottom: 0;
  }

  ${props => props.role === 'user' ? `
    background-color: #10A37F;
    color: white;
    border-radius: 12px;
    border-bottom-right-radius: 4px;
  ` : `
    background-color: transparent; /* Transparent background for assistant messages */
    color: #000000; /* Black text color for assistant messages */
    padding-left: 45px; /* Add space for the icon on the left */
    border-radius: 0; /* No rounded corners for assistant messages */
  `}

  .content {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .avatar {
    position: absolute;
    ${props => props.role === 'user' ? `
      bottom: -2px;
      right: -36px; /* Increased space */
    ` : `
      left: 0px; /* Position avatar on the left */
      top: 0px;
    `}
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: ${props => props.role === 'user' ? '#0d876a' : '#ffffff'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.role === 'user' ? 'white' : '#10A37F'};
    font-size: 14px;
    top: 20px; /* Align avatar to the top */
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

// Improved typing indicator with bounce animation
const TypingIndicator = styled.div`
  display: flex;
  padding: 1.2rem;
  max-width: 90%;
  margin-bottom: 2rem;
  align-self: flex-start;
  background-color: transparent;
  position: relative;
  padding-left: 45px;

  .dots {
    display: flex;
    align-items: center;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10A37F;
      margin-right: 4px;
      animation: bounce 0.4s infinite ease-in-out both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
  }

  .avatar {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #10A37F;
    font-size: 14px;
    top: 20px; /* Align avatar to the top */
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
const MessageTime = styled.div<{ role: 'user' | 'assistant' }>`
  font-size: 0.7rem;
  color: ${props => props.role === 'user' ? 'rgba(255, 255, 255, 0.8)' : '#a9a9a9'};
  margin-top: 6px;
  text-align: right;
`;

// Improved typewriter text with smooth typing animation
const TypewriterText = styled.div`
  padding: 1.2rem;
  max-width: 90%;
  margin-bottom: 2rem;
  position: relative;
  align-self: flex-start;
  font-size: 0.95rem;
  line-height: 1.6;
  box-shadow: none;
  background-color: transparent;
  color: #000000;
  padding-left: 45px;
  border-radius: 0;
  width: 100%;

.avatar {
  position: absolute;
  left: 0px;
  top: 8px; /* slightly downward */
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10A37F;
  font-size: 14px;
  top: 20px; /* Align avatar to the top */
}


  .typewriter-text {
    display: inline;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .typewriter-cursor {
    display: inline-block;
    width: 3px;
    height: 1.2em;
    background-color: #10A37F;
    margin-left: 3px;
    vertical-align: text-bottom;
    animation: blink-and-move 0.5s infinite;
    position: relative;
    opacity: 1;
  }

  @keyframes blink-and-move {
    0%, 100% { opacity: 1; transform: scaleY(1); }
    25% { opacity: 1; transform: scaleY(1.1) translateY(-1px); }
    50% { opacity: 0.6; transform: scaleY(0.8) translateY(1px); }
    75% { opacity: 1; transform: scaleY(1.05) translateY(0); }
  }
`;

// Empty state container
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6e6e80;
  text-align: center;
  padding: 2rem;

  svg {
    font-size: 3rem;
    color: #10A37F;
    opacity: 0.5;
    margin-bottom: 1rem;
  }

  h3 {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    max-width: 400px;
  }
`;

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingText } = useChat(); // Get typing text from context

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (messages.length === 0 && !isLoading && !typingText) {
    return (
      <EmptyStateContainer>
        <IconWrapper Icon={RiRobot2Fill} />
        <h3>Start a conversation</h3>
        <p>Ask a question about NFRS or any financial reporting standard to get started.</p>
      </EmptyStateContainer>
    );
  }

  // Helper function to deduplicate messages
  const deduplicateMessages = (msgs: MessageType[]): MessageType[] => {
    const uniqueMessages: MessageType[] = [];

    msgs.forEach((message) => {
      // If the last message is from the same role and has the same content, don't add it
      const lastMessage = uniqueMessages[uniqueMessages.length - 1];

      if (lastMessage &&
        lastMessage.role === message.role &&
        lastMessage.content === message.content) {
        // Skip duplicate message
        return;
      }

      uniqueMessages.push(message);
    });

    return uniqueMessages;
  };

  // Get deduplicated messages
  const uniqueMessages = deduplicateMessages(messages);

  return (
    <EnhancedMessagesContainer>
      {uniqueMessages.map((message) => (
        <EnhancedMessage key={message.id} role={message.role}>
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

            <MessageTime role={message.role}>
              {formatTime(message.created_at)}
            </MessageTime>
          </div>
          <div className="avatar">
            {message.role === 'user' ? (
              <IconWrapper Icon={FiUser} />
            ) : (
              <IconWrapper Icon={RiRobot2Fill} />
            )}
          </div>
        </EnhancedMessage>
      ))}

      {/* Show typewriter effect for assistant's typing */}
      {typingText !== null && (
        <TypewriterText>
          <div className="content">
            <span className="typewriter-text">{typingText}</span>
            <span className="typewriter-cursor"></span>
          </div>
          <div className="avatar">
            <IconWrapper Icon={RiRobot2Fill} />
          </div>
        </TypewriterText>
      )}

      {/* Show typing indicator when loading */}
      {isLoading && !typingText && (
        <TypingIndicator>
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <div className="avatar">
            <IconWrapper Icon={RiRobot2Fill} />
          </div>
        </TypingIndicator>
      )}

      <div ref={messagesEndRef} />
    </EnhancedMessagesContainer>
  );
};

export default MessageList;