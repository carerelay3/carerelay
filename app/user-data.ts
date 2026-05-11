import 'server-only';
import { cache } from 'react';
import { getCurrentSupabaseUser } from '@/lib/supabase/auth';
import { getPlatformRole } from '@/lib/admin/platform';

export interface User {
  id: string;
  name?: string;
  email?: string;
  platformRole?: "user" | "admin" | "founder";
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const user = await getCurrentSupabaseUser();
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email,
    email: user.email,
    platformRole: await getPlatformRole(user.id),
  };
});
