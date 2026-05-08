'use client';

import { useOptimistic, useRef, useTransition } from 'react';
import { saveChatAction, clearChatsAction, deleteChatAction } from './chat-actions';

type Chat = {
  id: string;
  title: string;
  created_at: string;
};

type OptimisticAction =
  | { type: 'add'; chat: Chat }
  | { type: 'delete'; id: string }
  | { type: 'clear' };

export function ChatForm({ initialChats }: { initialChats: Chat[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  
  // Set up the optimistic state. 
  // Update the reducer to handle different actions (add, delete, clear)
  const [optimisticChats, dispatchOptimistic] = useOptimistic(
    initialChats,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case 'add':
          return [action.chat, ...state];
        case 'delete':
          return state.filter((chat) => chat.id !== action.id);
        case 'clear':
          return [];
        default:
          return state;
      }
    }
  );

  const formAction = async (formData: FormData) => {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    
    if (!title || !content) return;

    // 1. Instantly update the UI with a temporary ID
    dispatchOptimistic({
      type: 'add',
      chat: {
        id: Math.random().toString(), // Temporary ID for React keys
        title,
        created_at: new Date().toISOString(),
      }
    });

    // Clear the form instantly so the user can keep typing
    formRef.current?.reset();

    // 2. Perform the actual Server Action in the background
    const result = await saveChatAction(formData);
    
    if (result?.error) {
      // Next.js will automatically roll back the optimistic UI if this fails
      alert(`Failed to save chat: ${result.error}`);
    }
  };

  const handleClearHistory = () => {
    startTransition(async () => {
      // Instantly clear the UI
      dispatchOptimistic({ type: 'clear' });
      
      const result = await clearChatsAction();
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  const handleDeleteChat = (id: string) => {
    startTransition(async () => {
      // Instantly remove the chat from the UI
      dispatchOptimistic({ type: 'delete', id });
      
      const result = await deleteChatAction(id);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form ref={formRef} action={formAction} className="space-y-4 mb-8 flex flex-col">
        <input 
          type="text" 
          name="title" 
          placeholder="Chat Title" 
          required 
          className="border border-gray-300 p-2 rounded" 
        />
        <textarea 
          name="content" 
          placeholder="What's on your mind?" 
          required 
          className="border border-gray-300 p-2 rounded h-24"
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors self-start"
        >
          Save Chat
        </button>
      </form>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat History</h2>
        <button 
          onClick={handleClearHistory}
          disabled={isPending || optimisticChats.length === 0}
          className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-semibold transition-colors"
        >
          {isPending ? 'Clearing...' : 'Clear History'}
        </button>
      </div>

      <ul className="space-y-4">
        {optimisticChats.map((chat) => (
          <li key={chat.id} className="border border-gray-200 p-4 rounded shadow-sm bg-white flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{chat.title}</h3>
              <span className="text-sm text-gray-500">
                {new Date(chat.created_at).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => handleDeleteChat(chat.id)}
              className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}