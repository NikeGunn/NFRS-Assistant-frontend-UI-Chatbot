import React, { useEffect, useRef } from 'react';
import { MessagesContainer, Message, SourcesContainer, SourcesTitle, SourceItem } from './StyledComponents';
import { ChatMessage } from '../types/api.types';
import { FiUser } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import IconWrapper from './IconWrapper';

interface MessageListProps {
  messages: ChatMessage[];
  sources?: {
    id: string;
    title: string;
    description: string;
    category: string;
  }[];
}

const MessageList: React.FC<MessageListProps> = ({ messages, sources }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <MessagesContainer>
      {messages.map((message) => (
        <Message key={message.id} role={message.role}>
          <div className="avatar">
            {message.role === 'user' ? (
              <IconWrapper Icon={FiUser} />
            ) : (
              <IconWrapper Icon={RiRobot2Fill} />
            )}
          </div>
          <div className="content">
            {message.content}

            {/* Show sources only for the last assistant message if sources are provided */}
            {message.role === 'assistant' &&
              sources &&
              message.id === messages[messages.length - 1].id &&
              messages[messages.length - 1].role === 'assistant' && (
                <SourcesContainer>
                  <SourcesTitle>Sources:</SourcesTitle>
                  {sources.map((source) => (
                    <SourceItem key={source.id}>
                      {source.title} - {source.category}
                    </SourceItem>
                  ))}
                </SourcesContainer>
              )}
          </div>
        </Message>
      ))}
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default MessageList;