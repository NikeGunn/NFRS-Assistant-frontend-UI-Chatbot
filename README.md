# NFRS Assistant

A modern, AI-powered web application that provides intuitive access to Nepal Financial Reporting Standards information through a conversational interface.

![NFRS Assistant UI](https://github.com/NikeGunn/imagess/blob/main/Nepal%20Financial%20Reporting%20Standards%20(NFRS)/nfrs.png?raw=true)

## Features

- **Conversational Interface**: Interact naturally with NFRS information using a ChatGPT-like experience
- **Secure Authentication**: JWT-based login system with session management
- **Multi-Session Support**: Create and organize multiple chat conversations
- **Source Attribution**: View the original document sources for every assistant response
- **Bilingual Support**: Seamlessly switch between English and Nepali interfaces
- **Responsive Design**: Optimized experience across desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router v6, Styled Components
- **State Management**: React Context API
- **API Communication**: Axios
- **UI Components**: Custom components with React Icons
- **Authentication**: JWT token implementation

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nfrs-assistant-frontend.git

# Navigate to project directory
cd nfrs-assistant-frontend

# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:8000
```

### Development

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
```

## Usage Guide

### Authentication Flow

1. Navigate to the login page
2. Enter your credentials
3. Upon successful authentication, you'll be redirected to the chat interface

### Using the Chat Interface

- **New Conversation**: Click "New Chat" in the sidebar
- **Ask Questions**: Type your NFRS-related query and press Enter
- **View History**: Access previous conversations from the sidebar
- **Check Sources**: Expand source references below each AI response
- **Switch Language**: Toggle between English and Nepali using the language selector

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── pages/          # Main application pages
│   ├── auth/       # Login and registration
│   └── chat/       # Main chat interface
├── services/       # API integration
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## License

[MIT License](LICENSE)
