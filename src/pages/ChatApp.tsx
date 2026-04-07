import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import type { AppContextType } from '@/store/types';
import { Menu, Sparkles, Code2, BookOpen, Lightbulb } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { Sidebar } from '@/components/Sidebar';
import { ChatInputPlus } from '@/components/ChatInputPlus';
import { mistralService } from '@/services/mistralService';
import logo from '@/assets/logo.png';

const SUGGESTIONS = [
  { icon: <Sparkles size={15} />, text: 'Write a creative story', prompt: 'Write me a creative short story about a time traveler who discovers music can alter reality.' },
  { icon: <Code2 size={15} />, text: 'Help me code', prompt: 'Help me write a Python function that implements a binary search tree with insert, delete, and search operations.' },
  { icon: <BookOpen size={15} />, text: 'Explain a concept', prompt: 'Explain quantum computing to me like I\'m a software developer who has never studied physics.' },
  { icon: <Lightbulb size={15} />, text: 'Brainstorm ideas', prompt: 'Brainstorm 10 unique startup ideas that combine AI with everyday problems people face.' },
];

export const ChatApp = () => {
  const store = useStore() as unknown as AppContextType;
  const {
    currentConversation,
    addMessage,
    updateMessage,
    setMessageLoading,
    setConversationTitle,
    initializeStore,
    selectedModel
  } = store;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [welcomeText, setWelcomeText] = useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages.length]);

  // Initialize store with a conversation if needed
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Fetch welcome text once on mount
  useEffect(() => {
    getIntroText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIntroText = async () => {
    try {
      const response = await mistralService.chatM(
        'Say hello using lyrics from famous rap and hiphop songs, only respond with 1 option, display like lyrics and artist, no special characters'
      );
      
      const content = response.choices?.[0]?.message?.content;
      let text = '';
      
      if (typeof content === 'string') {
        text = content;
      } else if (Array.isArray(content)) {
        text = content
          .map(chunk => ('text' in chunk ? chunk.text : ''))
          .join('');
      }
      
      setWelcomeText(text);
    } catch {
      // Silently fail — welcome text is nice-to-have
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentConversation) return;

    addMessage(currentConversation.id, text, 'user');

    // Prepare history: previous messages + current user message
    // Filters out empty loading/error messages from previous turns
    const filteredHistory = currentConversation.messages
      .filter(msg => !msg.isLoading && (msg.role === 'user' || msg.content.trim() !== ''))
      .map(msg => ({ content: msg.content, role: msg.role }));

    const conversationHistory = [
      ...filteredHistory,
      { content: text, role: 'user' as const }
    ];

    if (store.systemPrompt) {
      conversationHistory.unshift({ content: store.systemPrompt, role: 'system' });
    }

    setIsLoading(true);
    const loadingMessage = addMessage(currentConversation.id, '', 'assistant');

    try {
      const response = await mistralService.chat(
        conversationHistory,
        selectedModel || 'mistral-small-latest',
        {
          temperature: store.temperature,
          topP: store.topP,
          maxTokens: 10000,
          randomSeed: Math.floor(Math.random() * 1000000)
        }
      );

      const accumulatedResponse = response.content || '';
      updateMessage(currentConversation.id, loadingMessage.id, accumulatedResponse);
      setMessageLoading(currentConversation.id, loadingMessage.id, false);

      if (currentConversation.messages.length <= 2) {
        const title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
        setConversationTitle(currentConversation.id, title);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      updateMessage(
        currentConversation.id,
        loadingMessage.id,
        'Something went wrong. Please try again.'
      );
      setMessageLoading(currentConversation.id, loadingMessage.id, false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = currentConversation && currentConversation.messages.length > 0;

  return (
    <div className="flex h-screen bg-surface-0 text-text-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-border-subtle bg-surface-0/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar menu"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 flex items-center justify-center gap-2">
            {hasMessages && (
              <h2 className="text-sm font-medium text-text-secondary truncate max-w-[280px]">
                {currentConversation?.title}
              </h2>
            )}
          </div>

          {/* Model badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black border border-border-subtle">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-[11px] font-medium text-text-muted">
              {selectedModel?.replace('mistral-', '').replace('-latest', '') || 'small'}
            </span>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {!hasMessages ? (
              /* ─── Welcome Screen ─── */
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center animate-fade-in">
                {/* Logo */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 rounded-2xl bg-black border border-border-subtle flex items-center justify-center shadow-glow-lg overflow-hidden">
                    <img src={logo} alt="Kl.ai" className="w-12 h-12 object-contain" />
                  </div>
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-2xl opacity-30" 
                       style={{ boxShadow: '0 0 40px 8px rgba(139, 92, 246, 0.15)' }} />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold gradient-text mb-3 tracking-tight">
                  Kl.ai
                </h1>
                <p className="text-text-muted text-sm max-w-sm leading-relaxed mb-2">
                  {welcomeText || 'Your premium AI assistant. Ask anything.'}
                </p>

                {/* Suggestion chips */}
                <div className="grid grid-cols-2 gap-2.5 mt-8 w-full max-w-lg">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(s.prompt)}
                      className="suggestion-chip group flex items-center gap-2.5 px-4 py-3.5 rounded-xl
                        bg-black border border-border-subtle text-left
                        hover:border-accent-violet/30 hover:shadow-glow-sm
                        active:scale-[0.98] transition-all duration-200"
                    >
                      <span className="flex-shrink-0 text-accent-violet group-hover:text-accent-indigo transition-colors">
                        {s.icon}
                      </span>
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        {s.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ─── Messages ─── */
              <>
                {currentConversation?.messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    content={msg.content}
                    role={msg.role as 'user' | 'assistant'}
                    isLoading={msg.isLoading}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input area */}
        {currentConversation && (
          <ChatInputPlus
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};