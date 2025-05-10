import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import styled from 'styled-components';
import { FiSend, FiMic, FiPaperclip } from 'react-icons/fi';
import { InputContainer, MessageInput, SendButton, LoadingSpinner } from './StyledComponents';
import IconWrapper from './IconWrapper';

// Enhanced styled components for ChatInput
const EnhancedInputContainer = styled(InputContainer)`
  margin: 1.5rem auto;
  width: 90%;
  max-width: 900px;
  position: relative;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e5e5;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #10A37F;
    box-shadow: 0 3px 10px rgba(16, 163, 127, 0.1);
  }

  @media (max-width: 768px) {
    margin: 1rem auto;
  }
`;

const EnhancedMessageInput = styled(MessageInput)`
  padding: 1rem 4rem 1rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  box-shadow: none;
  resize: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &::placeholder {
    color: #a9a9a9;
  }
`;

const EnhancedSendButton = styled(SendButton)`
  position: absolute;
  right: 10px;
  bottom: 10px;
  background-color: #10A37F;
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #0c8a6b;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #e5e5e5;
    color: #a9a9a9;
    cursor: not-allowed;
    transform: none;
  }
`;

const InputActions = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6e6e80;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #10A37F;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MessageLengthIndicator = styled.div<{ isApproachingLimit: boolean; isOverLimit: boolean }>`
  position: absolute;
  right: 60px;
  bottom: 10px;
  font-size: 12px;
  color: ${props => (props.isOverLimit ? '#e34c4c' : props.isApproachingLimit ? '#e69744' : '#a9a9a9')};
  padding: 4px;
  border-radius: 4px;
  pointer-events: none;
`;

const TypingIndicator = styled.div`
  position: absolute;
  top: -30px;
  left: 16px;
  font-size: 0.85rem;
  color: #6e6e80;
  font-style: italic;
`;

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // For demo purposes
  const MAX_MESSAGE_LENGTH = 2000;
  const isApproachingLimit = message.length > MAX_MESSAGE_LENGTH * 0.8;
  const isOverLimit = message.length > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading && !isOverLimit) {
      onSendMessage(message.trim());
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // If user starts typing, show actions
    setShowActions(true);
  };

  const handleMicClick = () => {
    // Placeholder for voice input functionality
    alert("Voice input functionality would be implemented here");
  };

  const handleAttachClick = () => {
    // Placeholder for file attachment functionality
    alert("File attachment functionality would be implemented here");
  };

  return (
    <EnhancedInputContainer>
      {isLoading && <TypingIndicator>NFRS Assistant is typing...</TypingIndicator>}

      <EnhancedMessageInput
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowActions(true)}
        onBlur={() => setShowActions(message.length > 0)}
        placeholder="Ask anything about NFRS..."
        rows={1}
        disabled={isLoading}
      />

      {message.length > 0 && (message.length > MAX_MESSAGE_LENGTH * 0.8) && (
        <MessageLengthIndicator
          isApproachingLimit={isApproachingLimit && !isOverLimit}
          isOverLimit={isOverLimit}
        >
          {message.length}/{MAX_MESSAGE_LENGTH}
        </MessageLengthIndicator>
      )}

      <EnhancedSendButton
        onClick={handleSend}
        disabled={!message.trim() || isLoading || isOverLimit}
        aria-label="Send message"
      >
        {isLoading ? <LoadingSpinner /> : <IconWrapper Icon={FiSend} size={18} />}
      </EnhancedSendButton>
    </EnhancedInputContainer>
  );
};

export default ChatInput;