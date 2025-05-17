import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiUploadCloud, FiFile } from 'react-icons/fi';
import IconWrapper from './IconWrapper';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  sessionId: string;
  chatId?: string;
}

const ModalOverlay = styled.div<{ isClosing: boolean }>`
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
  opacity: ${props => props.isClosing ? 0 : 1};
  transition: opacity 0.2s ease-in-out;
`;

const ModalContainer = styled.div<{ isClosing: boolean }>`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 24px;
  transform: ${props => props.isClosing ? 'scale(0.95) translateY(10px)' : 'scale(1) translateY(0)'};
  opacity: ${props => props.isClosing ? 0 : 1};
  transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 18px;
    color: #202123;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #6e6e80;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover {
    background-color: #f7f7f8;
    color: #202123;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #202123;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #10A37F;
    box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed #e5e5e5;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #10A37F;
    background-color: rgba(16, 163, 127, 0.05);
  }

  p {
    margin: 10px 0;
    color: #6e6e80;
  }

  svg {
    color: #10A37F;
    margin-bottom: 10px;
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f7f7f8;
  border-radius: 6px;
  margin-top: 10px;

  .file-icon {
    color: #10A37F;
  }

  .file-name {
    font-size: 14px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-type {
    font-size: 12px;
    color: #6e6e80;
    padding: 2px 6px;
    background-color: #e5e5e5;
    border-radius: 4px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const SubmitButton = styled.button<{ isLoading: boolean }>`
  padding: 10px 16px;
  background-color: #10A37F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  transform: ${props => props.isLoading ? 'scale(0.98)' : 'scale(1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: #0c8a6b;
  }

  &:disabled {
    background-color: #e5e5e5;
    color: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e34c4c;
  font-size: 14px;
  margin-top: 5px;
`;

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isLoading,
  sessionId,
  chatId
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setTitle('');
      setError(null);
      setIsClosing(false);
    }
  }, [isOpen]);
  const handleClose = () => {
    if (!isLoading) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        // Reset the modal state after it's closed
        setTimeout(() => {
          setIsClosing(false);
          setFile(null);
          setTitle('');
          setError(null);
        }, 50);
      }, 200);
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      // Check if file is PDF, TXT, or DOCX
      const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Only PDF, TXT, or DOCX files are currently supported');
        return;
      }

      setFile(selectedFile);

      // Auto-fill title if not already filled
      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setTitle(fileName);
      }

      setError(null);
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('session_id', sessionId);

      // Get file extension for determining file_type
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      formData.append('file_type', fileExtension);

      // Add chat_id if it exists
      if (chatId) {
        formData.append('chat_id', chatId);
      }

      // Upload the document
      await onUpload(formData);

      // Reset form
      setFile(null);
      setTitle('');
      setError(null);

      // Close modal with animation - delay for better feedback to user
      setTimeout(() => {
        handleClose();
      }, 300);
    } catch (error: any) {
      setError(error.message || 'An error occurred while uploading the document');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isClosing={isClosing} onClick={handleClose}>
      <ModalContainer isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Upload Document</h2>
          <CloseButton onClick={handleClose} disabled={isLoading}>
            <IconWrapper Icon={FiX} size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FileUploadArea onClick={handleFileClick}>
            <IconWrapper Icon={FiUploadCloud} size={32} />
            <p>Click to select a document (PDF, TXT, DOCX)</p>
            <HiddenInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.docx"
            />
          </FileUploadArea>

          {file && (
            <FilePreview>
              <div className="file-icon">
                <IconWrapper Icon={FiFile} size={24} />
              </div>
              <div className="file-name">{file.name}</div>
              <div className="file-type">{file.name.split('.').pop()?.toUpperCase()}</div>
            </FilePreview>
          )}

          <FormGroup>
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? (
              <>
                <span>Uploading...</span>
                <span className="loading-dots">...</span>
              </>
            ) : (
              'Upload Document'
            )}
          </SubmitButton>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default DocumentUploadModal;