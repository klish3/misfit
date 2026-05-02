import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { StoreProvider, useStore } from '@/store';
import { ChatApp } from '@/pages/ChatApp';
import { ModelSettings } from '@/pages/ModelSettings';
import '@/index.css';

const ROLLO_STRICT_ID = 'ag_019de5190c427595b14da480e4a201e9';

const ThemeSync: React.FC = () => {
  const { selectedAgentId } = useStore();
  useEffect(() => {
    const html = document.documentElement;
    if (selectedAgentId === ROLLO_STRICT_ID) {
      html.dataset.theme = 'amber';
    } else if (!selectedAgentId) {
      html.dataset.theme = 'cyan';
    } else {
      delete html.dataset.theme;
    }
  }, [selectedAgentId]);
  return null;
};

export default function App() {
  return (
    <StoreProvider>
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <div className="p-4 bg-red-100 text-red-800">
            <h2 className="font-bold mb-2">Something went wrong:</h2>
            <pre className="whitespace-pre-wrap mb-4">{(error as Error).message}</pre>
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}
      >
        <ThemeSync />
        <BrowserRouter>
          <Routes>
            <Route path="/chat" element={<ChatApp />} />
            <Route path="/settings" element={<ModelSettings />} />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </StoreProvider>
  );
}
