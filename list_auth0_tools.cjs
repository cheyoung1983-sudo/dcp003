const { spawn } = require('child_process');

const mcp = spawn('npx', ['-y', '@auth0/auth0-mcp-server', 'run'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let outputBuffer = '';

function sendJsonRpc(method, params, id = 1) {
  const msg = JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params: params || {}
  }) + '\n';
  mcp.stdin.write(msg);
}

// 1. Initialize MCP
sendJsonRpc('initialize', {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "displaycellpros-agent", version: "1.0.0" }
}, 1);

let initialized = false;

mcp.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const json = JSON.parse(line.trim());
      console.log('RECV:', JSON.stringify(json, null, 2));
      
      if (json.id === 1) {
        // Send initialized notification and list tools
        mcp.stdin.write(JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized"
        }) + '\n');
        
        sendJsonRpc('tools/list', {}, 2);
      } else if (json.id === 2) {
        console.log('=== AUTH0 MCP TOOLS ===');
        console.log(JSON.stringify(json.result, null, 2));
        process.exit(0);
      }
    } catch (e) {
      console.log('RAW_STDOUT:', line);
    }
  }
});

mcp.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

mcp.on('close', (code) => {
  console.log('MCP Process closed with code:', code);
  process.exit(code || 0);
});

setTimeout(() => {
  console.log('Timeout waiting for tools list.');
  process.exit(1);
}, 25000);
