"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const client_1 = require("@modelcontextprotocol/sdk/client");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
const SAPAICoreAdapter_1 = require("./SAPAICoreAdapter");
const promises_1 = __importDefault(require("readline/promises"));
class MCPClient {
    _mcpClient;
    _transport = null;
    _tools = [];
    constructor() {
        this._mcpClient = new client_1.Client({ name: "mcp-client-cli", version: "1.0.0" });
    }
    async connectToServer(serverScriptPath) {
        try {
            const isJs = serverScriptPath.endsWith(".js");
            const isPy = serverScriptPath.endsWith(".py");
            if (!isJs && !isPy) {
                throw new Error("Server script must be a .js or .py file");
            }
            const command = isPy
                ? process.platform === "win32"
                    ? "python"
                    : "python3"
                : process.execPath;
            this._transport = new stdio_js_1.StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            await this._mcpClient.connect(this._transport);
            const toolsResult = await this._mcpClient.listTools();
            // toolsResult.tools already matches the Tool interface (uses inputSchema)
            this._tools = toolsResult.tools;
            console.log("Connected to server with tools:", this._tools.map(({ name }) => name));
        }
        catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }
    async processQuery(query) {
        // const convertTemperatureTool: ChatCompletionTool = {
        //     type: 'function',
        //     function: {
        //         name: 'convert_temperature_to_fahrenheit',
        //         description: 'Converts temperature from Celsius to Fahrenheit',
        //         parameters: {
        //             type: 'object',
        //             properties: {
        //                 temperature: {
        //                     type: 'number',
        //                     description: 'The temperature value in Celsius to convert.'
        //                 }
        //             },
        //             required: ['temperature']
        //         }
        //     }
        // };
        // this._tools.push(convertTemperatureTool);
        // Convert MCP Tools to ChatCompletionTools
        const toolFromMCP = this._tools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description || '',
                parameters: tool.inputSchema || {
                    type: 'object',
                    properties: {},
                }
            }
        }));
        const orchestrationClient = SAPAICoreAdapter_1.SAPAICoreAdapter._getOrchestrationClient({ tools: [...toolFromMCP] });
        const messages = [
            { role: 'user', content: query }
        ];
        const response = await orchestrationClient.chatCompletion({
            messages: messages
        });
        console.log(response.getContent());
        console.log(response.getFinishReason());
        console.log(JSON.stringify(response.getTokenUsage()));
        const initialResponse = response.getAssistantMessage();
        let toolMessage;
        if (initialResponse && Array.isArray(initialResponse.tool_calls) && initialResponse.tool_calls.length > 0) {
            const toolCall = initialResponse.tool_calls[0];
            const name = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            // Execute the function with the provided arguments
            // const toolResult = callFunction(name, args);
            const result = await this._mcpClient.callTool({
                name: name,
                arguments: args,
            });
            toolMessage = {
                role: 'tool',
                content: result.content,
                tool_call_id: toolCall.id
            };
            const finalResponse = await orchestrationClient.chatCompletion({
                messages: [toolMessage],
                messagesHistory: response.getAllMessages()
            });
            console.log(finalResponse.getContent());
        }
    }
    async chatLoop() {
        const rl = promises_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        try {
            console.log("\nMCP Client Started!");
            console.log("Type your queries or 'quit' to exit.");
            while (true) {
                const message = await rl.question("\nQuery: ");
                if (message.toLowerCase() === "quit") {
                    break;
                }
                const response = await this.processQuery(message);
                console.log("\n" + response);
            }
        }
        finally {
            rl.close();
        }
    }
    async cleanup() {
        await this._mcpClient.close();
    }
}
exports.MCPClient = MCPClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTUNQQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTUNQQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDZEQUEwRDtBQUMxRCx3RUFBaUY7QUFHakYseURBQXNEO0FBRXRELGlFQUF5QztBQUV6QyxNQUFhLFNBQVM7SUFDVixVQUFVLENBQVM7SUFDbkIsVUFBVSxHQUFnQyxJQUFJLENBQUM7SUFDL0MsTUFBTSxHQUFXLEVBQUUsQ0FBQztJQUU1QjtRQUNJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxlQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlLENBQUMsZ0JBQXdCO1FBQzFDLElBQUksQ0FBQztZQUNELE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUNELE1BQU0sT0FBTyxHQUFHLElBQUk7Z0JBQ2hCLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU87b0JBQzFCLENBQUMsQ0FBQyxRQUFRO29CQUNWLENBQUMsQ0FBQyxTQUFTO2dCQUNmLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBRXZCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSwrQkFBb0IsQ0FBQztnQkFDdkMsT0FBTztnQkFDUCxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQzthQUMzQixDQUFDLENBQUM7WUFDSCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMs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LE9BQU8sQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQztZQUNqQyxDQUFDO1FBQ0wsQ0FBQztnQkFBUyxDQUFDO1lBQ1AsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2YsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTztRQUNULE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0NBR0o7QUF0SkQsOEJBc0pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAnQG1vZGVsY29udGV4dHByb3RvY29sL3Nkay9jbGllbnQnO1xuaW1wb3J0IHsgU3RkaW9DbGllbnRUcmFuc3BvcnQgfSBmcm9tIFwiQG1vZGVsY29udGV4dHByb3RvY29sL3Nkay9jbGllbnQvc3RkaW8uanNcIjtcbmltcG9ydCB7IFRvb2wgfSBmcm9tICdAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2RrL3R5cGVzLmpzJztcbmltcG9ydCB7IENoYXRDb21wbGV0aW9uVG9vbCwgVG9vbENoYXRNZXNzYWdlIH0gZnJvbSBcIkBzYXAtYWktc2RrL29yY2hlc3RyYXRpb25cIjtcbmltcG9ydCB7IFNBUEFJQ29yZUFkYXB0ZXIgfSBmcm9tIFwiLi9TQVBBSUNvcmVBZGFwdGVyXCI7XG5pbXBvcnQgeyBDaGF0TWVzc2FnZSwgSW5wdXRGaWx0ZXJDb25maWcgfSBmcm9tIFwiQHNhcC1haS1zZGsvb3JjaGVzdHJhdGlvbi9kaXN0L2NsaWVudC9hcGkvc2NoZW1hXCI7XG5pbXBvcnQgcmVhZGxpbmUgZnJvbSBcInJlYWRsaW5lL3Byb21pc2VzXCI7XG5cbmV4cG9ydCBjbGFzcyBNQ1BDbGllbnQge1xuICAgIHByaXZhdGUgX21jcENsaWVudDogQ2xpZW50O1xuICAgIHByaXZhdGUgX3RyYW5zcG9ydDogU3RkaW9DbGllbnRUcmFuc3BvcnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF90b29sczogVG9vbFtdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fbWNwQ2xpZW50ID0gbmV3IENsaWVudCh7IG5hbWU6IFwibWNwLWNsaWVudC1jbGlcIiwgdmVyc2lvbjogXCIxLjAuMFwiIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGNvbm5lY3RUb1NlcnZlcihzZXJ2ZXJTY3JpcHRQYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGlzSnMgPSBzZXJ2ZXJTY3JpcHRQYXRoLmVuZHNXaXRoKFwiLmpzXCIpO1xuICAgICAgICAgICAgY29uc3QgaXNQeSA9IHNlcnZlclNjcmlwdFBhdGguZW5kc1dpdGgoXCIucHlcIik7XG4gICAgICAgICAgICBpZiAoIWlzSnMgJiYgIWlzUHkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXJ2ZXIgc2NyaXB0IG11c3QgYmUgYSAuanMgb3IgLnB5IGZpbGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb21tYW5kID0gaXNQeVxuICAgICAgICAgICAgICAgID8gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiXG4gICAgICAgICAgICAgICAgICAgID8gXCJweXRob25cIlxuICAgICAgICAgICAgICAgICAgICA6IFwicHl0aG9uM1wiXG4gICAgICAgICAgICAgICAgOiBwcm9jZXNzLmV4ZWNQYXRoO1xuXG4gICAgICAgICAgICB0aGlzLl90cmFuc3BvcnQgPSBuZXcgU3RkaW9DbGllbnRUcmFuc3BvcnQoe1xuICAgICAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICAgICAgYXJnczogW3NlcnZlclNjcmlwdFBhdGhdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9tY3BDbGllbnQuY29ubmVjdCh0aGlzLl90cmFuc3BvcnQpO1xuXG4gICAgICAgICAgICBjb25zdCB0b29sc1Jlc3VsdCA9IGF3YWl0IHRoaXMuX21jcENsaWVudC5saXN0VG9vbHMoKTtcbiAgICAgICAgICAgIC8vIHRvb2xzUmVzdWx0LnRvb2xzIGFscmVhZHkgbWF0Y2hlcyB0aGUgVG9vbCBpbnRlcmZhY2UgKHVzZXMgaW5wdXRTY2hlbWEpXG4gICAgICAgICAgICB0aGlzLl90b29scyA9IHRvb2xzUmVzdWx0LnRvb2xzO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgXCJDb25uZWN0ZWQgdG8gc2VydmVyIHdpdGggdG9vbHM6XCIsXG4gICAgICAgICAgICAgICAgdGhpcy5fdG9vbHMubWFwKCh7IG5hbWUgfSkgPT4gbmFtZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGNvbm5lY3QgdG8gTUNQIHNlcnZlcjogXCIsIGUpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgYXN5bmMgcHJvY2Vzc1F1ZXJ5KHF1ZXJ5OiBzdHJpbmcpIHtcblxuICAgICAgICAvLyBjb25zdCBjb252ZXJ0VGVtcGVyYXR1cmVUb29sOiBDaGF0Q29tcGxldGlvblRvb2wgPSB7XG4gICAgICAgIC8vICAgICB0eXBlOiAnZnVuY3Rpb24nLFxuICAgICAgICAvLyAgICAgZnVuY3Rpb246IHtcbiAgICAgICAgLy8gICAgICAgICBuYW1lOiAnY29udmVydF90ZW1wZXJhdHVyZV90b19mYWhyZW5oZWl0JyxcbiAgICAgICAgLy8gICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbnZlcnRzIHRlbXBlcmF0dXJlIGZyb20gQ2Vsc2l1cyB0byBGYWhyZW5oZWl0JyxcbiAgICAgICAgLy8gICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAvLyAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZToge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRlbXBlcmF0dXJlIHZhbHVlIGluIENlbHNpdXMgdG8gY29udmVydC4nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9XG4gICAgICAgIC8vICAgICAgICAgICAgIH0sXG4gICAgICAgIC8vICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3RlbXBlcmF0dXJlJ11cbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH07XG4gICAgICAgIC8vIHRoaXMuX3Rvb2xzLnB1c2goY29udmVydFRlbXBlcmF0dXJlVG9vbCk7XG5cbiAgICAgICAgLy8gQ29udmVydCBNQ1AgVG9vbHMgdG8gQ2hhdENvbXBsZXRpb25Ub29sc1xuICAgICAgICBjb25zdCB0b29sRnJvbU1DUDogQ2hhdENvbXBsZXRpb25Ub29sW10gPSB0aGlzLl90b29scy5tYXAodG9vbCA9PiAoe1xuICAgICAgICAgICAgdHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogdG9vbC5uYW1lLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0b29sLmRlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHRvb2wuaW5wdXRTY2hlbWEgfHwge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7ICAgIFxuXG4gICAgICAgIGNvbnN0IG9yY2hlc3RyYXRpb25DbGllbnQgPSBTQVBBSUNvcmVBZGFwdGVyLl9nZXRPcmNoZXN0cmF0aW9uQ2xpZW50KHsgdG9vbHM6IFsuLi50b29sRnJvbU1DUF0gfSk7XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZXM6IENoYXRNZXNzYWdlW10gPSBbXG4gICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogcXVlcnkgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3JjaGVzdHJhdGlvbkNsaWVudC5jaGF0Q29tcGxldGlvbih7XG4gICAgICAgICAgICBtZXNzYWdlczogbWVzc2FnZXNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZ2V0Q29udGVudCgpKTtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZ2V0RmluaXNoUmVhc29uKCkpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXNwb25zZS5nZXRUb2tlblVzYWdlKCkpKTtcblxuXG4gICAgICAgIGNvbnN0IGluaXRpYWxSZXNwb25zZSA9IHJlc3BvbnNlLmdldEFzc2lzdGFudE1lc3NhZ2UoKTtcbiAgICAgICAgbGV0IHRvb2xNZXNzYWdlOiBUb29sQ2hhdE1lc3NhZ2U7XG5cbiAgICAgICAgaWYgKGluaXRpYWxSZXNwb25zZSAmJiBBcnJheS5pc0FycmF5KGluaXRpYWxSZXNwb25zZS50b29sX2NhbGxzKSAmJiBpbml0aWFsUmVzcG9uc2UudG9vbF9jYWxscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB0b29sQ2FsbCA9IGluaXRpYWxSZXNwb25zZS50b29sX2NhbGxzWzBdO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRvb2xDYWxsLmZ1bmN0aW9uLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gSlNPTi5wYXJzZSh0b29sQ2FsbC5mdW5jdGlvbi5hcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgICAgICAgICAgIC8vIGNvbnN0IHRvb2xSZXN1bHQgPSBjYWxsRnVuY3Rpb24obmFtZSwgYXJncyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX21jcENsaWVudC5jYWxsVG9vbCh7XG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IGFyZ3MsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdG9vbE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgcm9sZTogJ3Rvb2wnLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdC5jb250ZW50IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICB0b29sX2NhbGxfaWQ6IHRvb2xDYWxsLmlkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBmaW5hbFJlc3BvbnNlID0gYXdhaXQgb3JjaGVzdHJhdGlvbkNsaWVudC5jaGF0Q29tcGxldGlvbih7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFt0b29sTWVzc2FnZV0sXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNIaXN0b3J5OiByZXNwb25zZS5nZXRBbGxNZXNzYWdlcygpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coZmluYWxSZXNwb25zZS5nZXRDb250ZW50KCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgY2hhdExvb3AoKSB7XG4gICAgICAgIGNvbnN0IHJsID0gcmVhZGxpbmUuY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgICAgICAgIGlucHV0OiBwcm9jZXNzLnN0ZGluLFxuICAgICAgICAgICAgb3V0cHV0OiBwcm9jZXNzLnN0ZG91dCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiXFxuTUNQIENsaWVudCBTdGFydGVkIVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVHlwZSB5b3VyIHF1ZXJpZXMgb3IgJ3F1aXQnIHRvIGV4aXQuXCIpO1xuXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBhd2FpdCBybC5xdWVzdGlvbihcIlxcblF1ZXJ5OiBcIik7XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UudG9Mb3dlckNhc2UoKSA9PT0gXCJxdWl0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wcm9jZXNzUXVlcnkobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cIiArIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHJsLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBjbGVhbnVwKCkge1xuICAgICAgICBhd2FpdCB0aGlzLl9tY3BDbGllbnQuY2xvc2UoKTtcbiAgICB9XG5cblxufSJdfQ==