import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Message as MessageType, DocumentSource } from '../types/api.types';
import { FiUser, FiExternalLink, FiChevronDown, FiChevronUp, FiFileText, FiLink, FiUsers, FiAward } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import IconWrapper from './IconWrapper';
import { useChat } from '../context/ChatContext';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

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
    padding: 14px 18px;
    border-radius: 18px;
    font-size: 15px;
    line-height: 1.5;
    word-wrap: break-word;
    width: ${props => props.isUser ? 'auto' : '100%'};
    max-width: 100%;
    overflow: hidden;

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

// Expert Panel component styling
const ExpertPanelContainer = styled.div`
  margin-top: 8px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
`;

const ExpertPanelToggleButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background-color: ${props => props.isOpen ? '#f0f4f9' : 'white'};
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  color: #444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background-color: #f0f4f9;
  }

  .toggle-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .expert-label {
    background-color: ${props => props.isOpen ? '#4a6bdc' : '#e9ecef'};
    color: ${props => props.isOpen ? 'white' : '#495057'};
    border-radius: 16px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  svg {
    color: ${props => props.isOpen ? '#4a6bdc' : '#6b7280'};
    transition: all 0.2s ease;
  }
`;

const ExpertPanelContent = styled.div`
  margin-top: 8px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const ExpertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ExpertItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ExpertAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4a6bdc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ExpertInfo = styled.div`
  flex: 1;
`;

const ExpertName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;

  .expert-badge {
    display: flex;
    align-items: center;
    color: #4a6bdc;
  }
`;

const ExpertTitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;

const ExpertComment = styled.div`
  font-size: 13px;
  color: #333;
  line-height: 1.5;
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
    margin-bottom: 0.8rem;
  }

  & > *:last-child {
    margin-bottom: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5rem;
    margin-bottom: 0.8rem;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 1.5rem;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.3rem;
    color: #0f172a;
  }

  /* Special styling for financial document section headings */
  // In the MarkdownContent styled component, replace the problematic CSS selectors

  /* Special styling for financial document section headings */
  h2[id*="financial"],
  h2[id*="balance"],
  h2[id*="income"],
  h2[id*="cash-flow"] {
    margin-top: 2rem;
    color: #1e40af;
    border-bottom: 1px solid #dbeafe;
    padding-bottom: 0.4rem;
    font-weight: 700;
  }

  /* The :contains pseudo-selector isn't standard CSS, so we need to use a different approach */
  h2 {
    &[data-content*="Financial"],
    &[data-content*="Balance Sheet"],
    &[data-content*="Income Statement"],
    &[data-content*="Cash Flow"] {
      margin-top: 2rem;
      color: #1e40af;
      border-bottom: 1px solid #dbeafe;
      padding-bottom: 0.4rem;
      font-weight: 700;
    }
  }

  /* Special styling for Executive Summary sections */
  h1, h2 {
    &[data-content*="Executive Summary"] {
      color: #0f766e;
      border-bottom: 1px solid #99f6e4;
      padding-bottom: 0.4rem;
    }
  }

  /* Special styling for Executive Summary sections */
  h1:contains("Executive Summary"),
  h2:contains("Executive Summary") {
    color: #0f766e;
    border-bottom: 1px solid #99f6e4;
    padding-bottom: 0.4rem;
  }

  h3 {
    font-size: 1.15rem;
    margin-top: 1.2rem;
  }

  h4, h5, h6 {
    font-size: 1rem;
  }
  p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }

  /* Enhanced styling for paragraphs in document summaries */
  .message-bubble p strong {
    color: #334155;
  }

  /* Financial metrics styling outside tables */
  p:contains("Ratio:"),
  p:contains("Total Assets:"),
  p:contains("Total Liabilities:"),
  p:contains("Revenue:"),
  p:contains("Net Income:"),
  p:contains("Profit:"),
  p:contains("EBITDA:") {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background-color: #f8fafc;
    border-left: 3px solid #93c5fd;
    padding: 0.5rem 0.75rem;
    margin: 0.7rem 0;
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
    max-width: 100%;
    position: relative;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    white-space: pre;
    font-size: 0.9rem;
    display: block;
    overflow-x: auto;
  }

  pre::before {
    content: attr(data-language);
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    background: rgba(0,0,0,0.1);
    border-bottom-left-radius: 4px;
    opacity: 0.7;
  }

  ul, ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0 0.5rem 1rem;
  }

  li {
    margin-bottom: 0.25rem;
  }

  li > ul, li > ol {
    margin: 0.25rem 0 0.5rem 1rem;
  }
  blockquote {
    border-left: 4px solid #e2e8f0;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #718096;
    font-style: italic;
  }

  /* Special styling for summary blockquotes in financial documents */
  blockquote:first-of-type {
    background-color: #f8fafc;
    border-left: 4px solid #3b82f6;
    padding: 0.75rem 1rem;
    color: #1e293b;
    font-style: normal;
    font-size: 0.95rem;
    margin: 1.25rem 0;
    border-radius: 0 4px 4px 0;
  }

  /* Special styling for Executive Summary sections */
  h2:contains("Executive Summary") + blockquote,
  h2:contains("Key Findings") + blockquote {
    background-color: #f0f9ff;
    border-left: 4px solid #0ea5e9;
    padding: 0.75rem 1rem;
    color: #0f172a;
    font-style: normal;
    font-weight: 400;
    line-height: 1.7;
  }

  a {
    color: #10A37F;
    text-decoration: underline;
  }

  a:hover {
    text-decoration: underline;
    opacity: 0.8;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 0.8rem 0;
  }  .table-container {
    width: 100%;
    overflow-x: auto;
    margin: 1rem 0;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    position: relative;
  }
  /* Enhanced styles for financial tables from document summaries */
  .financial-table {
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    border: 1px solid #dbeafe;
    background-color: #f8fafc;
    margin: 1.5rem 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }

  .table-container::before {
    content: attr(data-debug);
    display: ${process.env.NODE_ENV === 'development' ? 'block' : 'none'};
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 12px;
    color: #666;
    background: #f8f9fa;
    padding: 2px 4px;
    border-radius: 4px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0;
    table-layout: fixed;
    font-size: 0.9rem;
  }

  th, td {
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
    text-align: left;
    min-width: 120px;
    word-break: break-word;
  }

  th {
    background-color: #f0f4f8;
    font-weight: 600;
    color: #334155;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  /* Enhanced styles for financial tables with professional financial statement look */
  .financial-table th {
    background-color: #dbeafe;
    color: #1e40af;
    font-weight: 700;
    text-align: center;
    border-bottom: 2px solid #93c5fd;
    padding: 0.9rem 0.75rem;
    font-size: 0.95rem;
  }

  .financial-table td {
    padding: 0.8rem;
    line-height: 1.5;
  }

  /* Special handling for financial tables - right-align numeric cells */
  .financial-table td:not(:first-child) {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  /* First column in financial tables is usually labels - make them stand out */
  .financial-table td:first-child {
    font-weight: 500;
    color: #334155;
  }

  /* Handle grouping rows (like subtotals) */
  .financial-table tr:has(td:first-child:contains("Total")),
  .financial-table tr:has(td:first-child:contains("Subtotal")) {
    background-color: #f0f9ff;
    font-weight: 600;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .financial-table tr:nth-child(even) {
    background-color: #f1f5f9; /* Slightly darker alternating rows for financial tables */
  }

  tr:hover {
    background-color: #f1f5f9;
  }

  .financial-table tr:hover {
    background-color: #e0f2fe; /* Distinct hover state for financial tables */
  }

  /* Specific styles for different financial table types */
  .balance-sheet-table th {
    background-color: #dbeafe; /* Blue theme for balance sheets */
  }

  .income-statement-table th {
    background-color: #dcfce7; /* Green theme for income statements */
    color: #166534;
    border-bottom: 2px solid #86efac;
  }

  .cash-flow-table th {
    background-color: #fef3c7; /* Amber theme for cash flow statements */
    color: #92400e;
    border-bottom: 2px solid #fcd34d;
  }

  .document-summary-table th {
    background-color: #f3e8ff; /* Purple theme for summary tables */
    color: #6b21a8;
    border-bottom: 2px solid #d8b4fe;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.5rem 0;
  }
`;

interface Expert {
  id?: number;
  name: string;
  title: string;
  comment?: string;
  description?: string;
}

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

// Default expert data for messages without specific experts attached
const defaultExperts: Expert[] = [
  {
    id: 1,
    name: "Dr. Rajendra Sharma",
    title: "Financial Reporting Specialist, ICAN",
    comment: "This interpretation correctly applies NFRS 9 guidelines for financial instrument classification based on the business model and contractual cash flow characteristics."
  },
  {
    id: 2,
    name: "Maya Pradhan",
    title: "Senior Accountant, Nepal Rastra Bank",
    comment: "The explanation aligns with Nepal Rastra Bank's directives on financial instrument disclosure requirements for banking institutions."
  }
];

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingText } = useChat();
  const [sourcesOpen, setSourcesOpen] = useState<{ [key: string]: boolean }>({});
  const [expertPanelOpen, setExpertPanelOpen] = useState<{ [key: string]: boolean }>({});

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

  // Toggle expert panel visibility
  const toggleExpertPanel = (messageId: string) => {
    setExpertPanelOpen(prevState => ({
      ...prevState,
      [messageId]: !prevState[messageId]
    }));
  };
  // Safely render markdown content
  const renderMessageContent = (content: string, isAssistant: boolean) => {
    if (!isAssistant) {
      return <span>{content}</span>;
    }

    // Simple helper to convert key-value pairs to tables in financial sections
    const convertMetricsToTables = (text: string): string => {
      let formattedText = text;

      // Add special formatting for financial metrics sections that might contain key-value pairs
      if (formattedText.includes('## Financial Metrics') || formattedText.includes('## Key Financial Data')) {
        // Find the section content
        const metricsMatch = formattedText.match(/(## Financial Metrics|## Key Financial Data)[^\n]*\n\n?([\s\S]*?)(?=\n##|$)/);

        if (metricsMatch && metricsMatch[2]) {
          const metricsContent = metricsMatch[2];

          // If metrics aren't already in a table format, convert them
          if (!metricsContent.includes('|') && (metricsContent.match(/[\w\s]+:\s*[\d.,]+%?/g) || []).length > 0) {
            // Extract metrics in key-value format
            const metrics = metricsContent.match(/([^:\n]+):\s*([\d.,]+%?[^\n]*)/g) || [];

            if (metrics.length > 0) {
              // Create a table from the key-value pairs
              let tableContent = '\n| Metric | Value |\n| :--- | ---: |\n';

              metrics.forEach(metric => {
                const parts = metric.split(':');
                if (parts.length >= 2) {
                  const key = parts[0].trim();
                  const value = parts.slice(1).join(':').trim();
                  tableContent += `| ${key} | ${value} |\n`;
                }
              });

              // Replace the original metrics content with the table
              formattedText = formattedText.replace(metricsContent, tableContent);
            }
          }
        }
      }

      return formattedText;
    };

    // Ensure section headers are properly formatted
    const formatDocumentSections = (text: string): string => {
      let formattedText = text;

      // Ensure standard document structure sections have proper markdown formatting
      const sectionHeaders = [
        'Executive Summary',
        'Financial Metrics',
        'Financial Highlights',
        'Key Financial Data',
        'Balance Sheet',
        'Income Statement',
        'Statement of Financial Position',
        'Statement of Cash Flows',
        'Notes to Financial Statements',
        'Financial Analysis',
        'Risk Assessment',
        'Conclusion'
      ];

      // Ensure section headers are properly formatted as markdown headings
      sectionHeaders.forEach(header => {
        // Convert plain text sections to markdown headers if they're not already
        const plainTextPattern = new RegExp(`(^|\\n)${header}[\\s]*:\\s*(?!#)`, 'g');
        formattedText = formattedText.replace(plainTextPattern, `$1## ${header}:\n`);

        // Ensure there's spacing after section headers for better readability
        const headerPattern = new RegExp(`(## ${header}[^\\n]*\\n)(?!\\s*\\n)`, 'g');
        formattedText = formattedText.replace(headerPattern, '$1\n');
      });

      return formattedText;
    };

    // Pre-process content to properly format document sections and convert metrics to tables
    const processedContent = convertMetricsToTables(formatDocumentSections(content));

    try {
      return (
        <MarkdownContent>
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            skipHtml={false}
            remarkPlugins={[]}
            components={{
              // Handle links to open in a new tab
              a: (props) => (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              // Add data-content attributes to headings for CSS targeting
              h1: ({ node, ...props }) => <h1 data-content={props.children?.toString()} {...props} />, h2: ({ node, ...props }) => <h2 data-content={props.children?.toString()} {...props} />, h3: ({ node, ...props }) => <h3 data-content={props.children?.toString()} {...props} />,              // Ensure code blocks render properly
              code: ({ className, children, ...props }: React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = props.inline;
                return isInline ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className={match ? `language-${match[1]}` : ''}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              // Simple table component that applies financial styling based on content
              table: (props) => {
                // Get table content as string for keyword detection
                const tableContent = props.children?.toString()?.toLowerCase() || "";

                // Define financial keywords for detection
                const financialKeywords = [
                  'asset', 'assets', 'liability', 'liabilities', 'equity',
                  'revenue', 'revenues', 'expense', 'expenses', 'income',
                  'profit', 'loss', 'balance', 'sheet', 'statement',
                  'cash', 'flow', 'ratio', 'ebitda', 'roi', 'roe', 'roa',
                  'total', 'net', 'gross', 'current', 'non-current',
                  'inventory', 'receivable', 'payable', 'capital',
                  'depreciation', 'amortization', 'interest', 'tax',
                  'fiscal', 'quarter', 'annual', 'year', 'financial',
                  'metric', 'indicator', 'dividend', 'earnings', 'share'
                ];

                // Check for currency symbols and codes
                const currencyIndicators = ['$', '₹', '₨', 'rs.', 'npr', 'usd', 'eur', 'gbp', 'jpy', 'cny'];

                // Detect if this is a financial table based on contained keywords
                const hasFinancialKeyword = financialKeywords.some(keyword => tableContent.includes(keyword));
                const hasCurrencyIndicator = currencyIndicators.some(currency => tableContent.includes(currency));
                const hasNumericData = (tableContent.match(/\d{1,3}(,\d{3})+(\.\d+)?/g) || []).length >= 2;
                const hasPercentages = (tableContent.match(/\d+(\.\d+)?%/g) || []).length >= 2;

                const isFinancialTable = hasFinancialKeyword || hasCurrencyIndicator || (hasNumericData && hasPercentages);

                // Determine the specific financial table type
                let tableClassName = '';
                if (isFinancialTable) {
                  tableClassName = 'financial-table';

                  if (tableContent.includes('balance sheet') || tableContent.includes('financial position')) {
                    tableClassName += ' balance-sheet-table';
                  } else if (tableContent.includes('income') || tableContent.includes('profit') || tableContent.includes('loss')) {
                    tableClassName += ' income-statement-table';
                  } else if (tableContent.includes('cash flow') || tableContent.includes('cashflow')) {
                    tableClassName += ' cash-flow-table';
                  } else if (tableContent.includes('summary') || tableContent.includes('metrics') || tableContent.includes('highlight')) {
                    tableClassName += ' document-summary-table';
                  }
                }

                return (
                  <div className={`table-container ${tableClassName}`}>
                    <table {...props} />
                  </div>
                );
              },
            }}
          >
            {processedContent}
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
              {message.role === 'assistant' && (
                <>
                  {/* Display sources if they exist */}
                  {message.sources && message.sources.length > 0 && (
                    <ModernSourcesContainer>
                      <SourcesToggleButton
                        isOpen={sourcesOpen[message.id] || false}
                        onClick={() => toggleSources(message.id)}
                      >
                        <div className="toggle-left">
                          <IconWrapper Icon={FiLink} size={16} />
                          Sources
                          <span className="sources-count">{message.sources.length}</span>
                        </div>
                        <IconWrapper Icon={sourcesOpen[message.id] ? FiChevronUp : FiChevronDown} size={16} />
                      </SourcesToggleButton>
                      {sourcesOpen[message.id] && (
                        <SourcesListContainer>
                          {message.sources.map((source: DocumentSource) => (
                            <ModernSourceItem key={source.id} href="#">
                              <div className="source-icon">
                                <IconWrapper Icon={FiFileText} size={16} />
                              </div>
                              <div className="source-content">
                                <div className="source-title">{source.title}</div>
                                <div className="source-description">{source.description}</div>
                                <div className="source-meta">
                                  Relevance: {(source.relevance_score * 100).toFixed(0)}%
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

                  {/* Display Expert Panel */}
                  <ExpertPanelContainer>
                    <ExpertPanelToggleButton
                      isOpen={expertPanelOpen[message.id] || false}
                      onClick={() => toggleExpertPanel(message.id)}
                    >
                      <div className="toggle-left">
                        <IconWrapper Icon={FiUsers} size={16} />
                        Expert Panel
                        <span className="expert-label">2 Experts</span>
                      </div>
                      <IconWrapper Icon={expertPanelOpen[message.id] ? FiChevronUp : FiChevronDown} size={16} />
                    </ExpertPanelToggleButton>
                    {expertPanelOpen[message.id] && (
                      <ExpertPanelContent>
                        <ExpertList>
                          {defaultExperts.map(expert => (
                            <ExpertItem key={expert.id}>
                              <ExpertAvatar>
                                <IconWrapper Icon={FiUser} size={16} />
                              </ExpertAvatar>
                              <ExpertInfo>
                                <ExpertName>
                                  {expert.name}
                                  <span className="expert-badge">
                                    <IconWrapper Icon={FiAward} size={14} />
                                  </span>
                                </ExpertName>
                                <ExpertTitle>{expert.title}</ExpertTitle>
                                {expert.comment && (
                                  <ExpertComment>{expert.comment}</ExpertComment>
                                )}
                              </ExpertInfo>
                            </ExpertItem>
                          ))}
                        </ExpertList>
                      </ExpertPanelContent>
                    )}
                  </ExpertPanelContainer>
                </>
              )}
              <div className="message-time">
                {formatTime(message.created_at)}
              </div>
            </div>
          </div>
        </MessageBubble>
      ))}      {/* Show the typing indicator when assistant is responding with text */}
      {typingText && (
        <MessageBubble isUser={false} key="typing-animation">
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

      {/* Show typing indicator dots only when loading and there's no typingText yet */}
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
