// This file is a module
import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { FiPaperclip, FiSend } from 'react-icons/fi';
import styled from 'styled-components';
import IconWrapper from './IconWrapper';
// Empty export to ensure file is treated as a module
export { };

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isLoading?: boolean;
}

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1.15rem 25%; /* Match MessageList padding */
  background-color: transparent;
  border-top: 1px solid #e1e4e8;
  position: sticky;
  bottom: 0;
  z-index: 10;

  /* Responsive adjustments to match MessageList */
  @media (max-width: 1400px) {
    padding: 0.8rem 20%;
  }

  @media (max-width: 1200px) {
    padding: 0.8rem 15%;
  }

  @media (max-width: 1024px) {
    padding: 0.8rem 10%;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 5%;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #fff; /* White background like ChatGPT */
  border-radius: 35px;
  padding: 18px 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); /* Enhanced subtle shadow like ChatGPT */
  border: 1px solid #e5e5e5;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  min-height: 45px; /* Minimum height */
  max-height: 150px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  resize: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.5;
  background-color: transparent;
  font-family: inherit;
  overflow-y: auto;

  /* Ensure vertical alignment of placeholder */
  &::placeholder {
    color: #8e8ea0;
    line-height: 24px; /* Vertically center placeholder */
  }

  &:focus {
    box-shadow: none;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; /* Slightly larger button */
  height: 36px;
  margin-left: 4px;
  border: none;
  border-radius: 8px; /* Slightly less rounded, more like ChatGPT */
  background-color: transparent;
  color: #6e6e80;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: rgba(16, 163, 127, 0.1);
    color: #10A37F;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled(ActionButton)`
  color: white;
  background-color: ${props => props.disabled ? '#8e8ea0' : '#10A37F'};

  &:hover {
    background-color: ${props => props.disabled ? '#8e8ea0' : '#0d876a'};
    color: white;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  isLoading = false
}) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Improved auto-resize textarea based on content
    const textarea = e.target;
    textarea.style.height = '24px'; // Reset to minimum height
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.min(scrollHeight, 150) + 'px';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files[0]);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <InputContainer>
      <InputWrapper>
        {onFileUpload && (
          <>
            <ActionButton
              type="button"
              onClick={handleAttachClick}
              disabled={isLoading}
              title="Attach file"
            >
              <IconWrapper Icon={FiPaperclip} size={16} />
            </ActionButton>
            <HiddenFileInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.md"
            />
          </>
        )}

        <StyledTextarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isLoading}
        />

        <SendButton
          type="button"
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          title="Send message"
        >
          <IconWrapper Icon={FiSend} size={16} />
        </SendButton>
      </InputWrapper>
    </InputContainer>
  );
};

export default ChatInput;