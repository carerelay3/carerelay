'use server';

import { createChat, deleteAllUserChats, deleteUserChat } from '@/lib/data/chat';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/rate-limit'; // Adjust import based on where you placed it

export async function saveChatAction(formData: FormData) {
  // 1. Securely check rate limit before processing (e.g., 5 req per minute)
  const { rateLimited } = await checkRateLimit(5, 60000);
  if (rateLimited) {
    return { error: 'Rate limit exceeded. Please try again in a minute.' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // Basic validation
  if (!title || !content) {
    return { error: 'Title and content are required' };
  }

  try {
    // The DAL strictly guarantees the user is logged in 
    // and attaches the correct user_id to the database row.
    const chat = await createChat(title, content);
    
    revalidatePath('/chats');
    return { success: true, chat };
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export async function clearChatsAction() {
  try {
    await deleteAllUserChats();
    revalidatePath('/chats'); // Adjust path to match your route
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to clear chat history' };
  }
}

export async function deleteChatAction(id: string) {
  try {
    await deleteUserChat(id);
    revalidatePath('/chats'); // Adjust path to match your route
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete chat message' };
  }
}