# NFRS Assistant Frontend

A modern, ChatGPT-like web application that connects to the NFRS Assistant backend API to provide easy access to Nepal Financial Reporting Standards information.

## Features

- **User Authentication**: Secure login system using JWT tokens
- **Chat Interface**: Conversational UI similar to ChatGPT
- **Chat Sessions**: Create and manage multiple chat sessions
- **Document Sources**: View document sources for each assistant response
- **Responsive Design**: Works on desktop and mobile devices
- **Language Support**: Support for both English and Nepali languages

## Tech Stack

- React 18
- TypeScript
- React Router v6
- Styled Components
- Axios for API requests
- React Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:8000
```

Replace the URL with your backend API endpoint.

### Running the App

Start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
```

## Usage

### Authentication

1. Access the application and you will be redirected to the login page
2. Enter your username and password to authenticate
3. After successful login, you will be redirected to the chat interface

### Chat Interface

- **Create New Chat**: Click on "New Chat" button in the sidebar
- **Send Message**: Type your question in the input field and press Enter or click the send icon
- **Chat History**: View previous chat sessions in the sidebar
- **Sources**: View document sources under each assistant response when available

## API Integration

The frontend integrates with the NFRS Assistant backend API, which provides:

- Authentication services (JWT tokens)
- Document management
- Query processing
- Chat session management

The API endpoints are defined in `src/services/api.service.ts`.

## Folder Structure

```
public/             # Public assets
src/
  components/       # Reusable components
  context/          # React context providers
  pages/            # Page components
    auth/           # Authentication pages
    chat/           # Chat interface pages
  services/         # API service layer
  types/            # TypeScript type definitions
  utils/            # Utility functions
  App.tsx           # Main application component
  index.tsx         # Application entry point
```

## License

[MIT License](LICENSE)
