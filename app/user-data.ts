import 'server-only';
import { cache } from 'react';

// This is a placeholder for your actual user type
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * A placeholder function to simulate fetching the current user.
 * In a real application, this would involve checking cookies or session
 * and querying a database.
 *
 * The `cache` function from React dedupes requests for the same data
 * within a single render pass.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  // In a real app, you'd get a session token and validate it.
  // For this demo, we'll return a mock user after a delay.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { id: '1', name: 'Dustin', email: 'dustin@example.com' };
});