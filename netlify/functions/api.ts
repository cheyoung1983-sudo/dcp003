import serverless from 'serverless-http';
import { createAppInstance } from '../../server';

let cachedHandler: any;

export const handler = async (event: any, context: any) => {
  if (!cachedHandler) {
    // Forensic Audit initialization: Wrapping Express for Serverless execution
    const app = await createAppInstance();
    cachedHandler = serverless(app);
  }
  return cachedHandler(event, context);
};
