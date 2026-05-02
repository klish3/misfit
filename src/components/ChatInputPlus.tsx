import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Settings2, Zap, Shield, Sparkles, Bot, Cpu, X, Sliders } from 'lucide-react';
import { useStore } from '@/store';
import clsx from 'clsx';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

export const ChatInputPlus: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const { 
    selectedModel, 
    selectedAgentId,
    selectedAgentVersion,
    temperature, 
    topP, 
    systemPrompt, 
    setModelSettings 
  } = useStore();
  
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        // Only close if not clicking the toggle button
        const toggleBtn = document.getElementById('settings-toggle-btn');
        if (toggleBtn && !toggleBtn.contains(event.target as Node)) {
          setShowSettings(false);
        }
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

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
    <div className="px-4 pb-5 pt-2 relative">
      <div className="max-w-3xl mx-auto">
        {/* Settings Drawer */}
        {showSettings && (
          <div 
            ref={drawerRef}
            className="absolute bottom-full left-4 right-4 mb-3 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="max-w-3xl mx-auto bg-surface-2 border border-border-subtle rounded-2xl shadow-glow-lg overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-surface-3/50">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-accent-primary" />
                  <span className="text-sm font-semibold text-text-primary">Advanced Settings</span>
                </div>
                <button 
                  type="button"
                  title="Close settings"
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                {/* Agent Selection */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Agent</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setModelSettings({ selectedAgentId: undefined, selectedAgentVersion: undefined })}
                      className={clsx(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        !selectedAgentId
                          ? "bg-accent-primary/10 border-accent-primary/40 text-text-primary"
                          : "bg-surface-3 border-border-subtle text-text-muted hover:border-border-default"
                      )}
                    >
                      <Cpu size={18} className={!selectedAgentId ? "text-accent-primary" : ""} />
                      <div>
                        <div className="text-sm font-medium">None (Direct Model)</div>
                        <div className="text-[11px] opacity-70">Use base Mistral models</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setModelSettings({
                        selectedAgentId: 'ag_019dac56d3db769182f00597885ba0ef',
                        selectedAgentVersion: 24
                      })}
                      className={clsx(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        selectedAgentId === 'ag_019dac56d3db769182f00597885ba0ef'
                          ? "bg-accent-primary/10 border-accent-primary/40 text-text-primary"
                          : "bg-surface-3 border-border-subtle text-text-muted hover:border-border-default"
                      )}
                    >
                      <Bot size={18} className={selectedAgentId === 'ag_019dac56d3db769182f00597885ba0ef' ? "text-accent-primary" : ""} />
                      <div>
                        <div className="text-sm font-medium">Rollo</div>
                        <div className="text-[11px] opacity-70">Specialized agent (v20)</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setModelSettings({
                        selectedAgentId: 'ag_019de5190c427595b14da480e4a201e9',
                        selectedAgentVersion: undefined
                      })}
                      className={clsx(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        selectedAgentId === 'ag_019de5190c427595b14da480e4a201e9'
                          ? "bg-accent-primary/10 border-accent-primary/40 text-text-primary"
                          : "bg-surface-3 border-border-subtle text-text-muted hover:border-border-default"
                      )}
                    >
                      <Bot size={18} className={selectedAgentId === 'ag_019de5190c427595b14da480e4a201e9' ? "text-accent-primary" : ""} />
                      <div>
                        <div className="text-sm font-medium">Rollo Strict</div>
                        <div className="text-[11px] opacity-70">Strict specialized agent</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Model Selection (Hidden if agent selected) */}
                {!selectedAgentId && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Model</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'mistral-small-latest', name: 'Mistral Small', icon: <Zap size={16} /> },
                        { id: 'mistral-medium-latest', name: 'Mistral Medium', icon: <Bot size={16} /> }
                      ].map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setModelSettings({ selectedModel: model.id })}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm",
                            selectedModel === model.id 
                              ? "bg-accent-primary/10 border-accent-primary/40 text-text-primary" 
                              : "bg-surface-3 border-border-subtle text-text-muted hover:border-border-default"
                          )}
                        >
                          {model.icon}
                          {model.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Temperature</h3>
                      <span className="text-[11px] font-mono text-accent-primary">{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setModelSettings({ temperature: parseFloat(e.target.value) })}
                      aria-label="Temperature"
                      title="Temperature"
                      className="w-full accent-accent-violet"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Top P</h3>
                      <span className="text-[11px] font-mono text-accent-cyan">{topP.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={topP}
                      onChange={(e) => setModelSettings({ topP: parseFloat(e.target.value) })}
                      aria-label="Top P"
                      title="Top P"
                      className="w-full accent-accent-cyan"
                    />
                  </div>
                </div>

                {/* System Prompt */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">System Prompt</h3>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setModelSettings({ systemPrompt: e.target.value })}
                    rows={3}
                    placeholder="Set instructions for the AI behavior..."
                    className="w-full bg-surface-3 border border-border-subtle rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
                {/* Settings Toggle button */}
                <button
                  id="settings-toggle-btn"
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={clsx(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                    showSettings 
                      ? "bg-accent-primary/20 text-accent-primary" 
                      : "text-text-muted hover:text-text-secondary hover:bg-surface-3"
                  )}
                  aria-label="Toggle settings"
                >
                  <Settings2 size={16} />
                </button>

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
                      ? 'bg-accent-primary hover:bg-accent-secondary text-white shadow-glow-sm hover:shadow-glow-md active:scale-90'
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

        {/* Active settings pills */}
        <div className="flex items-center gap-1.5 mt-2 px-1 flex-wrap">
          {/* Agent / Model pill */}
          {selectedAgentId === 'ag_019dac56d3db769182f00597885ba0ef' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              <Bot size={10} />
              rollo
            </span>
          ) : selectedAgentId === 'ag_019de5190c427595b14da480e4a201e9' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield size={10} />
              rollo_strict
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
              <Cpu size={10} />
              {selectedModel?.replace('mistral-', '').replace('-latest', '') || 'small'}
            </span>
          )}

          {/* Temperature pill */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Sparkles size={10} />
            temp {temperature.toFixed(1)}
          </span>

          {/* Top P pill */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap size={10} />
            top-p {topP.toFixed(1)}
          </span>

          {/* System prompt indicator */}
          {systemPrompt?.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sliders size={10} />
              sys prompt
            </span>
          )}
        </div>
      </div>
    </div>
  );
};