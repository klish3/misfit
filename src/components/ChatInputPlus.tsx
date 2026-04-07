import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

export const ChatInputPlus: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <div className="px-4 pb-5 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* Floating input container */}
        <div
          className={`relative rounded-2xl transition-all duration-300 
            ${hasContent || isLoading 
              ? 'shadow-glow-sm' 
              : 'shadow-surface'
            }`}
        >
          {/* Gradient border effect */}
          <div
            className="absolute inset-0 rounded-2xl gradient-border pointer-events-none"
            style={{ zIndex: 1 }}
          />
          
          <div className="relative rounded-2xl bg-black border border-border-subtle overflow-hidden"
               style={{ zIndex: 2 }}>
            <div className="flex items-end">
              {/* Textarea */}
              <div className="flex-1 px-4 pt-3 pb-3">
                <label htmlFor="prompt-input" className="sr-only">
                  Message Kl.ai
                </label>
                <textarea
                  ref={textareaRef}
                  id="prompt-input"
                  rows={1}
                  className="w-full border-0 bg-transparent text-[15px] text-text-primary placeholder-text-muted 
                    focus:outline-none focus:ring-0 resize-none leading-relaxed"
                  placeholder="Message Kl.ai..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  style={{ maxHeight: '160px' }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 pr-3 pb-3">
                {/* Attach button */}
                <button
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-lg 
                    text-text-muted hover:text-text-secondary hover:bg-surface-3 
                    transition-all duration-200"
                  onClick={() => {
                    console.log('File attachment clicked');
                  }}
                  aria-label="Attach file"
                >
                  <Paperclip size={16} />
                </button>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  type="button"
                  disabled={isLoading || !hasContent}
                  aria-label="Send message"
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                    ${hasContent && !isLoading
                      ? 'bg-accent-violet hover:bg-accent-indigo text-white shadow-glow-sm hover:shadow-glow-md active:scale-90'
                      : 'bg-surface-3 text-text-muted cursor-not-allowed'
                    }`}
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Bottom hint bar */}
            <div className="px-4 pb-2 flex items-center justify-between">
              <p className="text-[11px] text-text-muted">
                <kbd className="px-1 py-0.5 rounded bg-surface-3 text-text-muted text-[10px] font-mono">Shift</kbd>
                {' + '}
                <kbd className="px-1 py-0.5 rounded bg-surface-3 text-text-muted text-[10px] font-mono">Enter</kbd>
                {' for new line'}
              </p>
              {input.length > 0 && (
                <p className={`text-[11px] ${input.length > 4000 ? 'text-red-400' : 'text-text-muted'}`}>
                  {input.length.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};