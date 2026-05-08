import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { experimental_taintObjectReference } from 'react';
import { unstable_cache } from 'next/cache';

export async function getUserChats() {
  const supabase = await createClient();
  
  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  experimental_taintObjectReference(
    'Do not pass the Supabase user object to the client.',
    user
  );

  // 2. Safely fetch data scoped ONLY to this user
  const { data, error } = await supabase
    .from('chats')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    throw new Error('Failed to fetch user chats');
  }

  return data;
}

export async function createChat(title: string, content: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  experimental_taintObjectReference(
    'Do not pass the Supabase user object to the client.',
    user
  );

  const { data, error } = await supabase
    .from('chats')
    .insert([{ user_id: user.id, title, content }])
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    throw new Error('Failed to create chat');
  }

  return data;
}

export async function deleteAllUserChats() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', user.id); // Security: Only delete their own chats

  if (error) {
    console.error('Error deleting chats:', error);
    throw new Error('Failed to clear chat history');
  }
}

export async function deleteUserChat(chatId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id); // Security: Only delete if they own the chat

  if (error) {
    console.error('Error deleting chat:', error);
    throw new Error('Failed to delete chat message');
  }
}

// ============================================================================
// SCALING & PERFORMANCE: Globally cached queries
// ============================================================================

// Uses Next.js unstable_cache to cache this expensive aggregate query 
// globally for all users. It only hits Supabase once every hour!
export const getGlobalChatStats = unstable_cache(
  async () => {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true });

    if (error) return { totalChats: 0 };
    return { totalChats: count || 0 };
  },
  ['global-chat-stats'], // Cache key
  { revalidate: 3600 } // Cache lifespan in seconds (1 hour)
);