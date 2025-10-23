"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MCPClient_1 = require("./MCPClient");
async function main() {
    //   if (process.argv.length < 3) {
    //     console.log("Usage: node index.ts <path_to_server_script>");
    //     return;
    //   }
    const mcpClient = new MCPClient_1.MCPClient();
    try {
        // await mcpClient.connectToServer(process.argv[2]);
        await mcpClient.connectToServer("/Users/I540371/CAP/Example/mcp-quick-start-ts/srv/server.js");
        await mcpClient.chatLoop();
    }
    finally {
        await mcpClient.cleanup();
        process.exit(0);
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFdpdGhNQ1AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjaGF0V2l0aE1DUC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUF3QztBQUV4QyxLQUFLLFVBQVUsSUFBSTtJQUNuQixtQ0FBbUM7SUFDbkMsbUVBQW1FO0lBQ25FLGNBQWM7SUFDZCxNQUFNO0lBQ0osTUFBTSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUM7SUFDbEMsSUFBSSxDQUFDO1FBQ0gsb0RBQW9EO1FBQ3BELE1BQU0sU0FBUyxDQUFDLGVBQWUsQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7WUFBUyxDQUFDO1FBQ1QsTUFBTSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0FBQ0gsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTUNQQ2xpZW50IH0gZnJvbSBcIi4vTUNQQ2xpZW50XCI7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4vLyAgIGlmIChwcm9jZXNzLmFyZ3YubGVuZ3RoIDwgMykge1xuLy8gICAgIGNvbnNvbGUubG9nKFwiVXNhZ2U6IG5vZGUgaW5kZXgudHMgPHBhdGhfdG9fc2VydmVyX3NjcmlwdD5cIik7XG4vLyAgICAgcmV0dXJuO1xuLy8gICB9XG4gIGNvbnN0IG1jcENsaWVudCA9IG5ldyBNQ1BDbGllbnQoKTtcbiAgdHJ5IHtcbiAgICAvLyBhd2FpdCBtY3BDbGllbnQuY29ubmVjdFRvU2VydmVyKHByb2Nlc3MuYXJndlsyXSk7XG4gICAgYXdhaXQgbWNwQ2xpZW50LmNvbm5lY3RUb1NlcnZlcihcIi9Vc2Vycy9JNTQwMzcxL0NBUC9FeGFtcGxlL21jcC1xdWljay1zdGFydC10cy9zcnYvc2VydmVyLmpzXCIpO1xuICAgIGF3YWl0IG1jcENsaWVudC5jaGF0TG9vcCgpO1xuICB9IGZpbmFsbHkge1xuICAgIGF3YWl0IG1jcENsaWVudC5jbGVhbnVwKCk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG59XG5cbm1haW4oKTsiXX0=