import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ChatCompletionTool, ToolChatMessage } from "@sap-ai-sdk/orchestration";
import { SAPAICoreAdapter } from "./SAPAICoreAdapter";
import { ChatMessage, InputFilterConfig } from "@sap-ai-sdk/orchestration/dist/client/api/schema";
import readline from "readline/promises";

export class MCPClient {
    private _mcpClient: Client;
    private _transport: StdioClientTransport | null = null;
    private _tools: Tool[] = [];

    constructor() {
        this._mcpClient = new Client({ name: "mcp-client-cli", version: "1.0.0" });
    }

    async connectToServer(serverScriptPath: string) {
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

            this._transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            await this._mcpClient.connect(this._transport);

            const toolsResult = await this._mcpClient.listTools();
            // toolsResult.tools already matches the Tool interface (uses inputSchema)
            this._tools = toolsResult.tools;
            console.log(
                "Connected to server with tools:",
                this._tools.map(({ name }) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }


    async processQuery(query: string) {

        // Convert MCP Tools to ChatCompletionTools
        const toolFromMCP: ChatCompletionTool[] = this._tools.map(tool => ({
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

        const orchestrationClient = SAPAICoreAdapter._getOrchestrationClient({ tools: [...toolFromMCP] });

        const messages: ChatMessage[] = [
            { role: 'user', content: query }
        ];

        const response = await orchestrationClient.chatCompletion({
            messages: messages
        });

        console.log(response.getContent());
        console.log(response.getFinishReason());
        console.log(JSON.stringify(response.getTokenUsage()));


        const initialResponse = response.getAssistantMessage();
        let toolMessage: ToolChatMessage;

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
                content: result.content as string,
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
        const rl = readline.createInterface({
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
        } finally {
            rl.close();
        }
    }

    async cleanup() {
        await this._mcpClient.close();
    }


}