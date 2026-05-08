'use client';

import { createContext, useContext, use, type ReactNode } from 'react';
import type { User } from './user-data';

// We are passing a promise down, not the resolved user object.
type UserContextType = {
  userPromise: Promise<User | null>;
};

const UserContext = createContext<UserContextType | null>(null);

/**
 * A custom hook to access the user promise from the context.
 * It uses React's `use()` hook to suspend while the promise is pending.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  // The `use` hook unwraps the promise. Components using this hook will
  // suspend until the data is available.
  return use(context.userPromise);
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<User | null>;
}) {
  return (
    <UserContext.Provider value={{ userPromise }}>{children}</UserContext.Provider>
  );
}