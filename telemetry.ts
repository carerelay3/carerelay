import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function logAiUsage(data: {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  finishReason: string;
}) {
  const supabase = await createClient();

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fire-and-forget insert into the telemetry table
  const { error } = await supabase
    .from('telemetry')
    .insert([{
      user_id: user?.id || null, // Allow null if an unauthenticated user triggered this
      prompt_tokens: data.promptTokens,
      completion_tokens: data.completionTokens,
      total_tokens: data.totalTokens,
      model: data.model,
      finish_reason: data.finishReason
    }]);

  if (error) {
    console.error('Failed to log AI telemetry:', error);
  }
}

export async function getAdminTokenUsage() {
  const supabase = await createClient();

  // 1. Verify Authentication & Admin Role (Placeholder check)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');
  
  // Note: Add your own admin verification logic here (e.g., checking a user role table)

  // 2. Fetch all telemetry records
  const { data, error } = await supabase
    .from('telemetry')
    .select('user_id, total_tokens, prompt_tokens, completion_tokens');

  if (error) throw new Error(error.message);

  // 3. Aggregate token usage by user_id
  const usageByUser = data.reduce((acc, row) => {
    const uid = row.user_id || 'anonymous';
    if (!acc[uid]) acc[uid] = { total: 0, prompt: 0, completion: 0 };
    
    acc[uid].total += row.total_tokens;
    acc[uid].prompt += row.prompt_tokens;
    acc[uid].completion += row.completion_tokens;
    return acc;
  }, {} as Record<string, { total: number; prompt: number; completion: number }>);

  return usageByUser;
}