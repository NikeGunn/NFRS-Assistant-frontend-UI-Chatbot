// This file is a module
import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { FiPaperclip, FiSend, FiMic, FiSmile } from 'react-icons/fi';
import styled from 'styled-components';
import IconWrapper from './IconWrapper';
import DocumentUploadModal from './DocumentUploadModal';
import { useChat } from '../context/ChatContext';
// Empty export to ensure file is treated as a module
export { };

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (formData: FormData) => Promise<void>; // Changed from File to FormData
  isLoading?: boolean;
}

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: calc(100% - 260px); /* Subtract the width of the sidebar */
  padding: 16px 0;
  background-color: white;
  border-top: none; /* Removed the top border */
  position: fixed;
  bottom: 30px; /* Increased to make room for disclaimer */
  left: 260px; /* Position after the sidebar */
  right: 0;
  z-index: 10;
  box-shadow: none; /* Removed box shadow */

  /* Responsive handling for mobile view */
  @media (max-width: 768px) {
    width: 100%;
    left: 0;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 85%;
  max-width: 768px;
  background-color: white;
  border-radius: 24px;
  padding: 10px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e5e5;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin: 0 auto;

  &:focus-within {
    border-color: #10A37F;
    box-shadow: 0 2px 12px rgba(16, 163, 127, 0.15);
  }

  @media (max-width: 1200px) {
    width: 90%;
  }

  @media (max-width: 768px) {
    width: 95%;
  }
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  height: 24px;
  min-height: 24px;
  max-height: 150px;
  padding: 8px;
  border: none;
  resize: none;
  outline: none;
  font-size: 15px;
  line-height: 1.5;
  background-color: transparent;
  font-family: inherit;

  &::placeholder {
    color: #a0aec0;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: #a0aec0;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 2px;

  &:hover {
    background-color: #f3f4f6;
    color: #10A37F;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled(ActionButton) <{ active: boolean }>`
  color: ${props => props.active ? 'white' : '#a0aec0'};
  background-color: ${props => props.active ? '#10A37F' : 'transparent'};
  width: 38px;
  height: 38px;

  &:hover {
    background-color: ${props => props.active ? '#0d8a6b' : '#f3f4f6'};
    color: ${props => props.active ? 'white' : '#10A37F'};
    transform: ${props => props.active ? 'scale(1.05)' : 'none'};
  }

  &:disabled {
    background-color: #e2e8f0;
    color: #a0aec0;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

const InputActions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CharCounter = styled.div<{ nearLimit: boolean }>`
  font-size: 11px;
  color: ${props => props.nearLimit ? '#f59e0b' : '#a0aec0'};
  margin-right: 6px;
  transition: color 0.2s;
`;

const DisclaimerText = styled.div`
  display: none; /* Hide this disclaimer to avoid duplication with the main one in ChatPage */
  position: fixed;
  bottom: 5px;
  left: 260px;
  right: 0;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #6e6e80;
  padding: 5px 0;
  background-color: white;
  z-index: 5;
  border-top: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    left: 0;
  }
`;

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  isLoading = false
}) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_LENGTH = 4000;
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const { uploadDocument, sessionId, currentConversation } = useChat();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setMessage(value);

      // Auto-resize textarea based on content
      const textarea = e.target;
      textarea.style.height = '24px';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 150) + 'px';
    }
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
    // Open the document upload modal instead of just opening file picker
    setIsDocumentModalOpen(true);
  };

  // This is kept for compatibility but we don't use it directly anymore
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileUpload) {
      // Create FormData for legacy support
      const formData = new FormData();
      formData.append('file', files[0]);

      // Call the onFileUpload with FormData instead of File
      onFileUpload(formData);
      e.target.value = '';
    }
  };

  // New handler for document uploads through the modal
  const handleDocumentUpload = async (formData: FormData) => {
    if (onFileUpload) {
      await uploadDocument(formData);
    }
  };

  const hasText = message.trim().length > 0;
  const nearLimit = message.length > MAX_LENGTH * 0.8;

  return (
    <>
      <InputContainer>
        <InputWrapper>
          <ButtonGroup>
            {onFileUpload && (
              <>
                <ActionButton
                  type="button"
                  onClick={handleAttachClick}
                  disabled={isLoading}
                  title="Attach document"
                >
                  <IconWrapper Icon={FiPaperclip} size={18} />
                </ActionButton>
                {/* Keep this for compatibility */}
                <HiddenFileInput
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </>
            )}
            <ActionButton
              type="button"
              title="Add emoji"
              disabled={isLoading}
            >
              <IconWrapper Icon={FiSmile} size={18} />
            </ActionButton>
          </ButtonGroup>

          <StyledTextarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
          />

          <InputActions>
            {message.length > 0 && (
              <CharCounter nearLimit={nearLimit}>
                {message.length}/{MAX_LENGTH}
              </CharCounter>
            )}
            <ActionButton
              type="button"
              title="Voice input"
              disabled={isLoading}
            >
              <IconWrapper Icon={FiMic} size={18} />
            </ActionButton>
            <SendButton
              type="button"
              onClick={handleSendMessage}
              disabled={!hasText || isLoading}
              active={hasText && !isLoading}
              title="Send message"
            >
              <IconWrapper Icon={FiSend} size={18} />
            </SendButton>
          </InputActions>
        </InputWrapper>
      </InputContainer>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onUpload={handleDocumentUpload}
        isLoading={isLoading}
        sessionId={sessionId}
        chatId={currentConversation?.id?.toString()}
      />

      <DisclaimerText>
        NFRS Assistant can make mistakes. Check important info.
      </DisclaimerText>
    </>
  );
};

export default ChatInput;