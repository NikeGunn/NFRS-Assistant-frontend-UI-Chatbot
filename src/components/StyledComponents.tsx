import styled from 'styled-components';

// Main layout components
export const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f7f7f8;
`;

export const Sidebar = styled.div`
  width: 260px;
  background-color: #202123;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  @media (max-width: 768px) {
    position: fixed;
    width: 80%;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

// Header components
export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  background-color: white;
  border-bottom: 1px solid #e5e5e5;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.2rem;
  color: #333;

  img {
    height: 32px;
    margin-right: 10px;
  }
`;

// Sidebar components
export const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 16px;
  margin: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    margin-right: 10px;
  }
`;

export const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const SidebarList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

export const SidebarItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  transition: background-color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  ${({ active }) => active && `
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  `}

  svg {
    margin-right: 10px;
    color: rgba(255, 255, 255, 0.5);
  }
`;

export const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #444;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
  }

  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// Chat components
export const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 10%;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    padding: 20px 5%;
  }
`;

export const Message = styled.div<{ role: 'user' | 'assistant' }>`
  display: flex;
  margin-bottom: 24px;

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
    ${({ role }) => role === 'user'
    ? `background-color: #5436DA;`
    : `background-color: #10A37F;`
  }
  }

  .content {
    flex: 1;
    line-height: 1.5;
    max-width: 100%;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
`;

export const EmptyChat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6e6e80;
  text-align: center;
  padding: 0 20px;

  h2 {
    margin-bottom: 20px;
    font-size: 32px;
    font-weight: 600;
  }

  .suggestions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    max-width: 800px;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 24px;
    }
  }
`;

export const SuggestionButton = styled.button`
  background-color: #f7f7f8;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: left;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const InputContainer = styled.div`
  position: relative;
  margin: 20px auto;
  width: 80%;
  max-width: 800px;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

export const MessageInput = styled.textarea`
  width: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px 50px 12px 16px;
  font-size: 16px;
  line-height: 1.5;
  max-height: 200px;
  outline: none;
  resize: none;
  font-family: inherit;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #10A37F;
    box-shadow: 0 2px 6px rgba(16, 163, 127, 0.2);
  }
`;

export const SendButton = styled.button`
  position: absolute;
  right: 12px;
  bottom: 12px;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  color: #10A37F;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(16, 163, 127, 0.1);
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

// Form components
export const FormContainer = styled.div`
  max-width: 400px;
  margin: 60px auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  color: #202123;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #202123;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    border-color: #10A37F;
    outline: none;
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #10A37F;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0c8a6b;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: #d9534f;
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  background-color: rgba(217, 83, 79, 0.1);
  text-align: center;
`;

// Modal components
export const Modal = styled.div`
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

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 20px;
  }

  button {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
`;

export const SecondaryButton = styled.button`
  padding: 8px 16px;
  background-color: white;
  color: #202123;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f7f7f8;
  }
`;

// Source citation components
export const SourcesContainer = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
  max-width: 100%;
`;

export const SourcesTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #6e6e80;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

export const SourceItem = styled.div`
  font-size: 14px;
  color: #6e6e80;
  margin-bottom: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f7f7f8;
  display: flex;
  flex-direction: column;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  text-align: left;

  a {
    color: #10A37F;
    text-decoration: none;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    text-align: left;

    &:hover {
      text-decoration: underline;
    }
  }

  span {
    margin-top: 4px;
    display: block;
    text-align: left;
  }

  .score {
    text-align: right;
    align-self: flex-end;
  }
`;

// Loading indicator
export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #10A37F;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Notification components
export const Notification = styled.div<{ type?: 'success' | 'error' | 'info' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  ${({ type = 'info' }) => {
    switch (type) {
      case 'success':
        return `
          background-color: #10A37F;
          color: white;
        `;
      case 'error':
        return `
          background-color: #d9534f;
          color: white;
        `;
      default:
        return `
          background-color: #f7f7f8;
          color: #202123;
          border: 1px solid #e5e5e5;
        `;
    }
  }}

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Language switcher component
export const LanguageSwitcher = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;

  button {
    padding: 5px 10px;
    border: 1px solid #e5e5e5;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:first-child {
      border-radius: 4px 0 0 4px;
    }

    &:last-child {
      border-radius: 0 4px 4px 0;
    }

    &.active {
      background-color: #10A37F;
      color: white;
      border-color: #10A37F;
    }
  }
`;