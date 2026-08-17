'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function UserProviderWrapper({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
