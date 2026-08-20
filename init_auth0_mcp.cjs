const { execSync, spawnSync } = require('child_process');

const domain = process.env.AUTH0_DOMAIN || 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com';
const clientId = process.env.AUTH0_CLIENT_ID || 'V2A0bHGbJeY1JlYSmXJoHLts1atshZYn';
const clientSecret = process.env.AUTH0_CLIENT_SECRET;

console.log('Initializing Auth0 MCP Server with domain:', domain, 'and Client ID:', clientId);

const clients = ['cursor', 'windsurf', 'vscode', 'claude'];

for (const client of clients) {
  console.log(`\n--- Running Auth0 MCP init for ${client} ---`);
  try {
    const args = [
      '-y',
      '@auth0/auth0-mcp-server',
      'init',
      '--client', client,
      '--auth0-domain', domain,
      '--auth0-client-id', clientId,
      ...(clientSecret ? ['--auth0-client-secret', clientSecret] : []),
      '--no-interaction'
    ];
    
    const result = spawnSync('npx', args, {
      encoding: 'utf8',
      env: process.env
    });
    
    console.log('STDOUT:', result.stdout);
    if (result.stderr) console.log('STDERR:', result.stderr);
    console.log('STATUS:', result.status);
  } catch (err) {
    console.error(`Error initializing for ${client}:`, err);
  }
}
