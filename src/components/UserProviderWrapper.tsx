<<<<<<< HEAD
'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function UserProviderWrapper({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
=======
import React from 'react';

export default function UserProviderWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
>>>>>>> 7eb9bfe (feat(repo): synchronize complete production codebase with TypeScript fixes and Stripe integration)
}
