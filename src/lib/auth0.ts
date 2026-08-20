import { handleAuth, getSession, getAccessToken } from '@auth0/nextjs-auth0';

export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'V2A0bHGbJeY1JlYSmXJoHLts1atshZYn',
};

export const auth0 = {
  handleAuth: () => handleAuth(),
  getSession: async (req: any, res: any) => {
    try {
      return await getSession(req, res);
    } catch {
      return null;
    }
  },
  getAccessToken: async (req: any, res: any) => {
    try {
      return await getAccessToken(req, res);
    } catch {
      return null;
    }
  }
};

export default auth0Config;

