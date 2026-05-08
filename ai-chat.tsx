'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AiChat() {
  // useChat automatically calls POST /api/chat by default
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom as the AI streams its response
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-[600px] border border-gray-200 rounded-lg shadow-sm bg-gray-50">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`p-4 rounded-lg shadow-sm w-3/4 ${
              m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-white border border-gray-200 mr-auto text-gray-800'
            }`}
          >
            <span className="font-bold text-xs uppercase tracking-wider block mb-1 opacity-75">
              {m.role === 'user' ? 'You' : 'AI'}
            </span>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            </div>
          
          {/* Render Tool Invocations for Loading States */}
          {m.toolInvocations?.map((toolInvocation) => {
            const isFinished = toolInvocation.state === 'result';
            const toolName = toolInvocation.toolName;
            
            return (
              <div key={toolInvocation.toolCallId} className={`text-sm mt-2 flex items-center gap-2 ${isFinished ? 'text-green-600' : 'text-blue-500 animate-pulse'}`}>
                {!isFinished ? (
                  <span>{toolName === 'searchDocuments' ? '🔍 Searching your documents...' : '⚙️ Running tool...'}</span>
                ) : (
                  <span>✓ {toolName === 'searchDocuments' ? 'Documents searched' : 'Done'}</span>
                )}
              </div>
            );
          })}
          </div>
        ))}
        {/* Loading Indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="text-gray-500 text-sm italic p-2">AI is thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 bg-white p-2 border border-gray-200 rounded-lg">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask the AI something..."
          className="flex-1 p-2 focus:outline-none"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors" 
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}