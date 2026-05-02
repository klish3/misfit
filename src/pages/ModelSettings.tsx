import React from 'react';
import { useStore } from '@/store';
import { ArrowLeft, Zap, Shield, Sparkles, Bot, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface ModelCardProps {
  name: string;
  description: string;
  isSelected?: boolean;
  capabilities: string[];
  icon: React.ReactNode;
  onClick?: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ name, description, isSelected, capabilities, icon, onClick }) => (
  <div
    onClick={onClick}
    className={clsx(
      'p-5 rounded-2xl cursor-pointer transition-all duration-300 group',
      isSelected 
        ? 'bg-surface-3 border-accent-primary/40 shadow-glow-sm gradient-border' 
        : 'bg-surface-2 border-border-subtle hover:border-border-default hover:bg-surface-3'
    )}
    style={{ border: isSelected ? undefined : '1px solid rgba(255,255,255,0.06)' }}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className={clsx(
          'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
          isSelected 
            ? 'bg-accent-primary/20 text-accent-primary' 
            : 'bg-surface-3 text-text-muted group-hover:text-text-secondary'
        )}>
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            {name}
            {isSelected && <Sparkles className="w-4 h-4 text-accent-primary" />}
          </h3>
          <p className="mt-0.5 text-sm text-text-muted">{description}</p>
        </div>
      </div>
      <div className={clsx(
        'w-5 h-5 rounded-full border-2 transition-all flex-shrink-0 mt-0.5',
        isSelected 
          ? 'border-accent-primary bg-accent-primary shadow-glow-sm' 
          : 'border-border-default'
      )}>
        {isSelected && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </div>
    </div>
    
    <div className="mt-4 space-y-1.5 ml-[52px]">
      {capabilities.map((capability, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm text-text-muted">
          <div className={clsx(
            'w-1 h-1 rounded-full flex-shrink-0',
            isSelected ? 'bg-accent-primary' : 'bg-text-muted'
          )} />
          {capability}
        </div>
      ))}
    </div>
  </div>
);

const ParameterSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  icon?: React.ReactNode;
  description?: string;
}> = ({ label, value, onChange, min = 0, max = 1, step = 0.1, icon, description }) => (
  <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle space-y-3">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
        {icon}
        {label}
      </label>
      <span className="text-sm font-mono text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-md">
        {value.toFixed(1)}
      </span>
    </div>
    {description && <p className="text-xs text-text-muted">{description}</p>}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full"
      aria-label={label}
    />
  </div>
);

export const ModelSettings: React.FC = () => {
  const { 
    selectedModel: currentModel, 
    temperature: currentTemp, 
    topP: currentTopP,
    systemPrompt: currentSystemPrompt,
    setModelSettings 
  } = useStore();
  const [selectedModel, setSelectedModel] = React.useState(currentModel);
  const [temperature, setTemperature] = React.useState(currentTemp);
  const [topP, setTopP] = React.useState(currentTopP);
  const [systemPrompt, setSystemPrompt] = React.useState(currentSystemPrompt);
  
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setModelSettings({ selectedModel: model });
  };

  const handleTemperatureChange = (temp: number) => {
    setTemperature(temp);
    setModelSettings({ temperature: temp });
  };

  const handleTopPChange = (topP: number) => {
    setTopP(topP);
    setModelSettings({ topP });
  };

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to chat
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-accent-primary/10">
            <Cpu className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Model Settings</h1>
            <p className="text-sm text-text-muted">Choose a model and customize its behavior</p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-4 mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">Choose Model</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <ModelCard
              name="Mistral Small"
              description="Fast and efficient for everyday tasks"
              icon={<Zap size={20} />}
              isSelected={selectedModel === 'mistral-small-latest'}
              onClick={() => handleModelChange('mistral-small-latest')}
              capabilities={[
                'Quick response generation',
                'General knowledge tasks',
                'Basic coding assistance',
                'Cost-efficient processing'
              ]}
            />
            <ModelCard
              name="Mistral Medium"
              description="Best for complex reasoning and analysis"
              icon={<Bot size={20} />}
              isSelected={selectedModel === 'mistral-medium-latest'}
              onClick={() => handleModelChange('mistral-medium-latest')}
              capabilities={[
                'Advanced reasoning',
                'Complex task solving',
                'Nuanced content creation',
                'Code generation & review'
              ]}
            />
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4 mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">Parameters</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <ParameterSlider
              label="Temperature"
              value={temperature}
              onChange={handleTemperatureChange}
              icon={<Zap className="w-4 h-4 text-accent-primary" />}
              description="Higher values = more creative, lower = more focused"
            />
            <ParameterSlider
              label="Top P"
              value={topP}
              onChange={handleTopPChange}
              icon={<Shield className="w-4 h-4 text-accent-cyan" />}
              description="Controls diversity of token selection"
            />
          </div>
        </div>
          
        {/* System Prompt */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">System Prompt</h2>
          <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle">
            <textarea
              rows={5}
              placeholder="Enter a system prompt to guide the model's behavior..."
              className="w-full bg-transparent border-0 text-sm text-text-primary placeholder:text-text-muted 
                focus:outline-none focus:ring-0 resize-none leading-relaxed"
              value={systemPrompt}
              onChange={(e) => {
                const newPrompt = e.target.value;
                setSystemPrompt(newPrompt);
                setModelSettings({ systemPrompt: newPrompt });
              }}
            />
            <div className="flex justify-end mt-2">
              <span className="text-[11px] text-text-muted">
                {systemPrompt.length} characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}