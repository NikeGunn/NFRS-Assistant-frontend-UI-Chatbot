import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Message as MessageType, DocumentSource } from '../types/api.types';
import { FiUser, FiExternalLink, FiChevronDown, FiChevronUp, FiFileText, FiLink } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import IconWrapper from './IconWrapper';
import { useChat } from '../context/ChatContext';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

// Main container for the message list
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 15%;
  padding-bottom: 100px; /* Add padding to account for fixed input */
  background-color: white;

  @media (max-width: 1200px) {
    padding: 20px 10%;
    padding-bottom: 100px;
  }

  @media (max-width: 768px) {
    padding: 20px 5%;
    padding-bottom: 100px;
  }
`;

// Message component with messages all aligned to the left
const MessageBubble = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start; // Always align to the left
  margin-bottom: 20px;
  max-width: 100%;
  width: 100%;

  .message-row {
    display: flex;
    align-items: flex-start;
    max-width: ${props => props.isUser ? '80%' : '100%'};
    width: ${props => props.isUser ? 'auto' : '100%'};
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;

    background-color: ${props => props.isUser ? '#6366f1' : '#10A37F'};
    color: white;
  }

  .message-content {
    display: flex;
    flex-direction: column;
    width: ${props => props.isUser ? 'auto' : 'calc(100% - 48px)'};
  }

  .message-bubble {
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 15px;
    line-height: 1.5;
    word-wrap: break-word;
    width: ${props => props.isUser ? 'auto' : '100%'};
    max-width: 100%;
    overflow-x: auto; /* Add horizontal scrolling for wide tables */

    ${props => props.isUser
    ? `
        background-color: #6366f1;
        color: white;
        border-bottom-left-radius: 4px;
      ` : `
        background-color: #f3f4f6;
        color: #111827;
        border-bottom-left-radius: 4px;
      `
  }

    /* Ensure tables have adequate space */
    & > .financial-table {
      margin: 1rem 0;
      min-width: 100%;
      max-width: fit-content;
    }
  }

  .message-time {
    font-size: 11px;
    margin-top: 4px;
    color: #6b7280;
    align-self: flex-start;
  }

  .user-name {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
    color: ${props => props.isUser ? '#6366f1' : '#10A37F'};
  }
`;

// Modern FAANG-inspired Sources section
const ModernSourcesContainer = styled.div`
  margin-top: 12px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
`;

const SourcesToggleButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background-color: ${props => props.isOpen ? '#f0f6f3' : 'white'};
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  color: #444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background-color: #f0f6f3;
  }

  .toggle-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sources-count {
    background-color: ${props => props.isOpen ? '#10A37F' : '#e9ecef'};
    color: ${props => props.isOpen ? 'white' : '#495057'};
    border-radius: 16px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  svg {
    color: ${props => props.isOpen ? '#10A37F' : '#6b7280'};
    transition: all 0.2s ease;
  }
`;

const SourcesListContainer = styled.div`
  margin-top: 8px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const ModernSourceItem = styled.a`
  display: flex;
  padding: 14px 16px;
  border-bottom: 1px solid #e1e5e9;
  text-decoration: none;
  transition: background-color 0.15s ease;
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
  }

  .source-icon {
    margin-right: 12px;
    color: #10A37F;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .source-content {
    flex: 1;
    overflow: hidden;
  }

  .source-title {
    color: #202124;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .source-description {
    color: #5f6368;
    font-size: 12px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .source-meta {
    font-size: 11px;
    color: #10A37F;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .external-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    color: #10A37F;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .external-icon {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: transparent;
    transition: background-color 0.2s ease;
  }

  &:hover::after {
    background-color: #10A37F;
  }
`;

// Style for expert information
const ExpertsContainer = styled.div`
  margin-top: 12px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
`;

const ExpertsToggleButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background-color: ${props => props.isOpen ? '#f0f6f3' : 'white'};
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  color: #444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background-color: #f0f6f3;
  }

  .toggle-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .experts-count {
    background-color: ${props => props.isOpen ? '#10A37F' : '#e9ecef'};
    color: ${props => props.isOpen ? 'white' : '#495057'};
    border-radius: 16px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  svg {
    color: ${props => props.isOpen ? '#10A37F' : '#6b7280'};
    transition: all 0.2s ease;
  }
`;

const ExpertsListContainer = styled.div`
  margin-top: 8px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const ExpertItem = styled.div`
  display: flex;
  padding: 14px 16px;
  border-bottom: 1px solid #e1e5e9;
  transition: background-color 0.15s ease;
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
  }

  .expert-icon {
    margin-right: 12px;
    color: #10A37F;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .expert-content {
    flex: 1;
    overflow: hidden;
  }

  .expert-name {
    color: #202124;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .expert-title {
    color: #5f6368;
    font-size: 12px;
    line-height: 1.4;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: transparent;
    transition: background-color 0.2s ease;
  }

  &:hover::after {
    background-color: #10A37F;
  }
`;

// Typing indicator shown when the AI is "thinking"
const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #10A37F;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }

  .typing-bubble {
    background-color: #f3f4f6;
    border-radius: 18px;
    border-bottom-left-radius: 4px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
  }

  .dot {
    width: 8px;
    height: 8px;
    background-color: #6b7280;
    border-radius: 50%;
    margin: 0 2px;
    animation: typingAnimation 1.5s infinite ease-in-out;
  }

  .dot:nth-child(1) { animation-delay: 0s; }
  .dot:nth-child(2) { animation-delay: 0.3s; }
  .dot:nth-child(3) { animation-delay: 0.6s; }

  @keyframes typingAnimation {
    0%, 100% { transform: translateY(0); opacity: 0.5; }
    50% { transform: translateY(-5px); opacity: 1; }
  }
`;

// Empty state when there are no messages
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  text-align: center;

  svg {
    color: #10A37F;
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    max-width: 500px;
  }
`;

// Style for markdown content
const MarkdownContent = styled.div`
  & > * {
    margin-bottom: 0.5rem;
  }

  & > *:last-child {
    margin-bottom: 0;
  }

  p {
    margin: 0.5rem 0;
  }

  code {
    background-color: #f1f1f1;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
    white-space: pre-wrap;
  }

  pre {
    background-color: #f1f1f1;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.75rem 0;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    white-space: pre;
  }

  ul, ol {
    padding-left: 1.5rem;
  }

  blockquote {
    border-left: 4px solid #e2e8f0;
    padding-left: 1rem;
    margin-left: 0;
    color: #718096;
  }

  a {
    color: #10A37F;
    text-decoration: underline;
  }

  /* Enhanced table styling for financial data */
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
    font-size: 0.95em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    overflow: hidden;
    background-color: white;
  }

  thead {
    background-color: #f2f7f5;
    color: #2d3748;
    border-bottom: 2px solid #edf2f7;
  }

  th {
    padding: 0.75rem;
    font-weight: 600;
    text-align: left;
    border: 1px solid #e2e8f0;
    position: relative;
  }

  /* Header for balance sheets, align text to center */
  th.header, td.header {
    background-color: #f0f6f3;
    font-weight: bold;
    text-align: center;
  }

  /* For financial data, align amounts to right */
  td.amount, th.amount {
    text-align: right;
  }

  td {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }

  /* Row highlighting for balance sheets */
  tr.subtotal td {
    border-top: 1px solid #10A37F;
    border-bottom: 1px solid #10A37F;
    background-color: #f7faf9;
    font-weight: 500;
  }

  tr.total td {
    border-top: 2px solid #10A37F;
    border-bottom: 2px solid #10A37F;
    background-color: #f0f6f3;
    font-weight: 700;
  }

  /* Alternate row styling */
  tbody tr:nth-child(even) {
    background-color: #f8fafb;
  }

  tbody tr:hover {
    background-color: #f0f6f3;
  }

  /* Currency formatting for financial data */
  .currency {
    font-variant-numeric: tabular-nums;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  /* Nepalese rupee formatting */
  .npr {
    position: relative;
    padding-left: 1rem;
  }

  .npr::before {
    content: 'रू';
    position: absolute;
    left: 0;
  }

  /* Balance sheet specific */
  .bs-asset {
    color: #2c7a7b;
  }

  .bs-liability {
    color: #8c1616;
  }

  .bs-equity {
    color: #3b4f6c;
  }
`;

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingText } = useChat();
  const [sourcesOpen, setSourcesOpen] = useState<{ [key: string]: boolean }>({});
  const [expertsOpen, setExpertsOpen] = useState<{ [key: string]: boolean }>({});

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  // Format timestamp to show only time (HH:MM AM/PM)
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Toggle sources visibility
  const toggleSources = (messageId: string) => {
    setSourcesOpen(prevState => ({
      ...prevState,
      [messageId]: !prevState[messageId]
    }));
  };

  // Toggle experts visibility
  const toggleExperts = (messageId: string) => {
    setExpertsOpen(prevState => ({
      ...prevState,
      [messageId]: !prevState[messageId]
    }));
  };

  // Safely render markdown content
  const renderMessageContent = (content: string, isAssistant: boolean) => {
    if (!isAssistant) {
      return <span>{content}</span>;
    }

    try {
      return (
        <MarkdownContent>
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom rendering for tables to support financial data
              table: ({ node, ...props }) => (
                <table className="financial-table" {...props} />
              ),
              // Format numeric cells with right alignment
              td: ({ node, children, ...props }) => {
                // Check if content is numeric or money value to apply right alignment
                const text = String(children);
                const isNumeric = /^[+-]?\d+(\.\d+)?$/.test(text.replace(/,/g, ''));
                const isMoney = /^[₹रू]?\s*\d+(\.\d+)?/.test(text.replace(/,/g, '')) ||
                  /\d+(\.\d+)?\s*[₹रू]$/.test(text.replace(/,/g, ''));

                const className = isNumeric || isMoney ? 'amount' : '';
                return <td className={className} {...props}>{children}</td>;
              },
              // For table headers that contain "Amount", "Total", "Balance", etc.
              th: ({ node, children, ...props }) => {
                const text = String(children).toLowerCase();
                const isAmountHeader = text.includes('amount') ||
                  text.includes('balance') ||
                  text.includes('total') ||
                  text.includes('rs.') ||
                  text.includes('रू');
                const className = isAmountHeader ? 'amount' : '';
                return <th className={className} {...props}>{children}</th>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </MarkdownContent>
      );
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return <span>{content}</span>;
    }
  };

  // If there are no messages and nothing is loading, show empty state
  if (messages.length === 0 && !isLoading && !typingText) {
    return (
      <EmptyState>
        <IconWrapper Icon={RiRobot2Fill} />
        <h3>NFRS Assistant</h3>
        <p>I'm here to answer your questions about Nepal Financial Reporting Standards. Type a message to get started!</p>
      </EmptyState>
    );
  }

  return (
    <MessagesContainer>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          isUser={message.role === 'user'}
        >
          <div className="user-name">
            {message.role === 'user' ? 'You' : 'NFRS Assistant'}
          </div>
          <div className="message-row">
            <div className="avatar">
              <IconWrapper
                Icon={message.role === 'user' ? FiUser : RiRobot2Fill}
                size={20}
              />
            </div>
            <div className="message-content">
              <div className="message-bubble">
                {renderMessageContent(message.content, message.role === 'assistant')}
              </div>
              {/* Display sources if they exist */}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <ModernSourcesContainer>
                  <SourcesToggleButton
                    isOpen={sourcesOpen[message.id] || false}
                    onClick={() => toggleSources(message.id)}
                  >
                    <div className="toggle-left">
                      <span>Sources</span>
                      <span className="sources-count">{message.sources.length}</span>
                    </div>
                    {sourcesOpen[message.id] ?
                      <IconWrapper Icon={FiChevronUp} size={16} /> :
                      <IconWrapper Icon={FiChevronDown} size={16} />
                    }
                  </SourcesToggleButton>
                  {sourcesOpen[message.id] && (
                    <SourcesListContainer>
                      {message.sources.map((source, index) => (
                        <ModernSourceItem
                          key={index}
                          href="javascript:void(0)" // Using a placeholder since url property doesn't exist
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="source-icon">
                            <IconWrapper Icon={FiFileText} size={16} />
                          </div>
                          <div className="source-content">
                            <div className="source-title">
                              {source.title}
                            </div>
                          </div>
                          <div className="external-icon">
                            <IconWrapper Icon={FiExternalLink} size={16} />
                          </div>
                        </ModernSourceItem>
                      ))}
                    </SourcesListContainer>
                  )}
                </ModernSourcesContainer>
              )}

              {/* Display experts if they exist */}
              {message.role === 'assistant' && message.experts && message.experts.length > 0 && (
                <ExpertsContainer>
                  <ExpertsToggleButton
                    isOpen={expertsOpen[message.id] || false}
                    onClick={() => toggleExperts(message.id)}
                  >
                    <div className="toggle-left">
                      <span>{message.multi_agent ? 'Expert Panel' : 'Expert'}</span>
                      <span className="experts-count">{message.experts.length}</span>
                    </div>
                    {expertsOpen[message.id] ?
                      <IconWrapper Icon={FiChevronUp} size={16} /> :
                      <IconWrapper Icon={FiChevronDown} size={16} />
                    }
                  </ExpertsToggleButton>
                  {expertsOpen[message.id] && (
                    <ExpertsListContainer>
                      {message.experts.map((expert, index) => (
                        <ExpertItem key={index}>
                          <div className="expert-icon">
                            <IconWrapper Icon={FiUser} size={16} />
                          </div>
                          <div className="expert-content">
                            <div className="expert-name">
                              {expert.name}
                            </div>
                            <div className="expert-title">
                              {expert.title}
                            </div>
                          </div>
                        </ExpertItem>
                      ))}
                    </ExpertsListContainer>
                  )}
                </ExpertsContainer>
              )}

              <div className="message-time">
                {formatTime(message.created_at)}
              </div>
            </div>
          </div>
        </MessageBubble>
      ))}

      {/* Show the typing indicator when assistant is responding */}
      {typingText && (
        <MessageBubble isUser={false}>
          <div className="user-name">
            NFRS Assistant
          </div>
          <div className="message-row">
            <div className="avatar">
              <IconWrapper Icon={RiRobot2Fill} size={20} />
            </div>
            <div className="message-content">
              <div className="message-bubble">
                {renderMessageContent(typingText, true)}
              </div>
            </div>
          </div>
        </MessageBubble>
      )}

      {/* Show typing indicator dots when loading but no text yet */}
      {isLoading && !typingText && (
        <TypingIndicator>
          <div className="avatar">
            <IconWrapper Icon={RiRobot2Fill} size={20} />
          </div>
          <div className="typing-bubble">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </TypingIndicator>
      )}

      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default MessageList;