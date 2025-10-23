import { MCPClient } from "./MCPClient";

async function main() {
//   if (process.argv.length < 3) {
//     console.log("Usage: node index.ts <path_to_server_script>");
//     return;
//   }
  const mcpClient = new MCPClient();
  try {
    // await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.connectToServer("/Users/I540371/CAP/Example/mcp-quick-start-ts/srv/server.js");
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main();