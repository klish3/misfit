# GPT Mistral RnD - ChatGPT-like UI

A modern, full-featured ChatGPT-like single-page application built with React, TypeScript, Vite, Tailwind CSS, and MobX State Tree.

## Features

- 💬 Real-time chat interface with message history
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Clean, modern UI inspired by ChatGPT
- 🌙 Dark mode support (ready to implement)
- 📝 Conversation management (create, delete, switch)
- ⚡ Fast development with Vite
- 🏗️ Scalable state management with MobX State Tree
- 🎯 Type-safe with TypeScript
- 🚀 Production-ready setup

## Project Structure

```
src/
├── components/
│   └── ChatApp.tsx          # Main chat component
├── store/
│   ├── RootStore.ts        # MST store definition
│   └── index.ts            # Store provider & context
├── App.tsx                  # Root app component
├── main.tsx                 # Entry point
└── index.css               # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- yarn

### Installation

```bash
cd /Users/kli/GPT/Mistral-RnD
yarn
```

### Development

```bash
yarn dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
yarn build
```

### Preview

```bash
yarn preview
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **MobX State Tree** - State management
- **Lucide React** - Icons

## Features Explained

### State Management (MobX State Tree)

- **Message Model**: Individual chat messages with metadata
- **Conversation Model**: Collections of messages with timestamps
- **RootStore**: Global app state including conversations and UI state

### Components

- **ChatApp**: Main container managing the entire UI
- **ChatMessage**: Renders individual messages with role-specific styling
- **ChatInput**: Textarea with auto-growing height and send functionality
- **Sidebar**: Navigation with conversation list (responsive)

### Styling

- Tailwind CSS utility classes
- Dark mode ready
- Responsive breakpoints
- Custom scrollbar styling
- Smooth animations and transitions

## Usage Examples

### Create a conversation

```typescript
store.createConversation(); // Auto-selected
```

### Add messages

```typescript
const conversation = store.currentConversation;
conversation.addMessage('Hello!', 'user');
conversation.addMessage('Hi there!', 'assistant');
```

### Delete conversation

```typescript
store.deleteConversation(conversationId);
```

## Next Steps

- Integrate with real API endpoints
- Add authentication
- Implement dark mode toggle
- Add export/import conversations
- Add image support in messages
- Implement voice input

## License

MIT
