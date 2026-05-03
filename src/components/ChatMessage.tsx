import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

interface ChatMessageProps {
  content: string;
  thinking?: string;
  role: 'user' | 'assistant';
  isLoading?: boolean;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, thinking, role, isLoading, isStreaming }) => {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBlock(code);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const parseThinking = (): string => {
    if (!thinking) return '';
    // Guard: thinking may arrive as a non-string object at runtime
    if (typeof thinking !== 'string') return '';
    const trimmed = thinking.trim();
    if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return trimmed;
    try {
      const parsed = JSON.parse(trimmed);
      const items: { text?: string }[] = Array.isArray(parsed) ? parsed : [parsed];
      return items.map(item => item.text || '').join('');
    } catch {
      return trimmed;
    }
  };

  return (
    <div className={`message-enter group flex gap-3 mb-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 mt-0.5 ${
          isUser
            ? 'bg-accent-primary text-white ring-accent-primary/30'
            : 'bg-gradient-to-br from-accent-cyan to-accent-teal text-white ring-accent-cyan/20'
        }`}
      >
        {isUser ? 'Y' : 'K'}
      </div>

      {/* Message bubble */}
      <div className="relative max-w-[80%] min-w-0">
        <div
          className={`rounded-2xl px-4 py-3 leading-relaxed text-[15px] ${
            isUser
              ? 'bg-accent-primary/15 text-text-primary border border-accent-primary/10'
              : 'bg-black text-text-primary border border-border-subtle'
          }`}
          style={isUser ? { borderTopRightRadius: '6px' } : { borderTopLeftRadius: '6px' }}
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5 py-1 px-1">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <>
              {/* Thinking block */}
              {thinking && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowThinking(!showThinking)}
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors group/think"
                    aria-label={showThinking ? "Hide thinking process" : "Show thinking process"}
                  >
                    <div className="flex items-center justify-center w-4 h-4 rounded bg-surface-3 text-accent-primary">
                      <BrainCircuit size={10} />
                    </div>
                    <span>Thinking Process</span>
                    {showThinking ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  
                  {showThinking && (
                    <div className="mt-2 pl-3 border-l border-border-subtle/50 text-[13px] text-text-muted italic leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {/* { typeof thinking === 'string' ? thinking : JSON.parse(thinking).text} */}
                        {parseThinking()}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {!showThinking && (
                    <div className="h-px bg-gradient-to-r from-border-subtle/50 to-transparent mt-3 w-full" />
                  )}
                </div>
              )}
              
              {/*  Rendered Markdown for assistant messages  */}
              <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-text-primary mt-4 mb-2 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold text-text-primary mt-4 mb-2 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-text-primary mt-3 mb-1.5 first:mt-0">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-semibold text-text-primary mt-3 mb-1 first:mt-0">{children}</h4>
                  ),
                  
                  // Paragraphs
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  
                  // Bold / Italic
                  strong: ({ children }) => (
                    <strong className="font-semibold text-text-primary">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-text-secondary">{children}</em>
                  ),

                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:text-accent-secondary underline underline-offset-2 decoration-accent-primary/30 hover:decoration-accent-primary/60 transition-colors"
                    >
                      {children}
                    </a>
                  ),

                  // Lists
                  ul: ({ children }) => (
                    <ul className="mb-3 last:mb-0 space-y-1 pl-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 last:mb-0 space-y-1 pl-1 list-none counter-reset-item">{children}</ol>
                  ),
                  li: ({ children, ...props }) => {
                    // Check if this is inside an ordered list by looking for 'ordered' in props
                    const isOrdered = (props as any).ordered;
                    const index = (props as any).index;
                    return (
                      <li className="flex gap-2 leading-relaxed">
                        <span className="flex-shrink-0 mt-[3px]">
                          {isOrdered ? (
                            <span className="text-accent-primary text-xs font-semibold font-mono min-w-[1rem] inline-block">
                              {(index ?? 0) + 1}.
                            </span>
                          ) : (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-primary/60 mt-[5px]" />
                          )}
                        </span>
                        <span className="flex-1">{children}</span>
                      </li>
                    );
                  },

                  // Code blocks
                  pre: ({ children }) => (
                    <div className="relative group/code mb-3 last:mb-0">
                      <pre className="bg-surface-0 border border-border-subtle rounded-xl p-4 overflow-x-auto text-sm leading-relaxed">
                        {children}
                      </pre>
                    </div>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    const codeString = String(children).replace(/\n$/, '');
                    const language = className?.replace('language-', '') || '';

                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary text-[13px] font-mono">
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="relative group/code">
                        {/* Language label + Copy button */}
                        <div className="flex items-center justify-between px-4 py-2 bg-surface-0 border border-border-subtle border-b-0 rounded-t-xl">
                          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                            {language || 'text'}
                          </span>
                          <button
                            onClick={() => handleCopyCode(codeString)}
                            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary transition-colors"
                            aria-label="Copy code"
                          >
                            {copiedBlock === codeString ? (
                              <>
                                <Check size={11} className="text-accent-teal" />
                                <span className="text-accent-teal">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-surface-0 border border-border-subtle border-t-0 rounded-b-xl p-4 overflow-x-auto text-[13px] leading-relaxed font-mono">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  },

                  // Blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-accent-primary/40 pl-4 py-1 mb-3 last:mb-0 text-text-secondary italic">
                      {children}
                    </blockquote>
                  ),

                  // Horizontal rule
                  hr: () => (
                    <hr className="border-border-subtle my-4" />
                  ),

                  // Tables
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-3 last:mb-0 rounded-xl border border-border-subtle">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-surface-3">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2.5 text-text-primary border-b border-border-subtle last:border-b-0">
                      {children}
                    </td>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-surface-3/50 transition-colors">{children}</tr>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-accent-primary align-middle animate-[cursor-blink_0.8s_step-end_infinite]" />
              )}
            </div>
          </>
          )}
        </div>

        {/* Copy full message button — appears on hover */}
        {!isLoading && content && (
          <button
            onClick={handleCopy}
            className={`absolute -bottom-1 ${isUser ? 'left-1' : 'right-1'} 
              opacity-0 group-hover:opacity-100 translate-y-full
              flex items-center gap-1 px-2 py-1 rounded-md text-[11px]
              text-text-muted hover:text-text-primary bg-surface-3 border border-border-subtle
              transition-all duration-200 hover:shadow-glow-sm`}
            aria-label="Copy message"
          >
            {copied ? (
              <>
                <Check size={11} className="text-accent-teal" />
                <span className="text-accent-teal">Copied</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};