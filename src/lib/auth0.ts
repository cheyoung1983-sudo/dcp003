<<<<<<< HEAD
import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();
=======
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN || 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID || 'iHyCQzrHYenv4lrkCFy4v9528jtJUUHl',
};

>>>>>>> 7eb9bfe (feat(repo): synchronize complete production codebase with TypeScript fixes and Stripe integration)
