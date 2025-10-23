import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';

// 创建一个 MCP 服务器实例。
// McpServer 负责：
// 1. 注册工具 (tools)、资源 (resources)、提示 (prompts)
// 2. 和底层传输层 (Transport) 建立连接，处理 JSON-RPC 请求
const server = new McpServer({
    name: 'demo-server', // 向客户端声明的服务器名称
    version: '1.0.0'      // 服务器版本（用于能力/兼容性）
});

// 注册一个“加法”工具。
// registerTool 支持输入/输出模式的元数据配置：
// - title/description：用于客户端展示
// - inputSchema/outputSchema：使用 zod 校验入参/出参结构
// 工具的回调会收到已通过 zod 验证的参数，并返回内容与结构化结果。
server.registerTool(
    'add',
    {
        title: 'Addition Tool',
        description: 'Add two numbers',
        // inputSchema 定义请求参数形状；这里是两个数字 a 和 b
        inputSchema: { a: z.number(), b: z.number() },
        // outputSchema 定义返回结果的结构；这里返回一个数字 result
        outputSchema: { result: z.number() }
    },
    async ({ a, b }) => {
        // 实际业务逻辑：执行加法
        const output = { result: a + b };
        // 返回格式：
        // content: 面向富文本/通用展示的内容数组
        // structuredContent: 结构化数据（客户端可直接解析）
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

// 注册一个动态资源 “greeting”。
// ResourceTemplate 允许用 URI 模板 (greeting://{name}) 表示一类可变资源。
// 客户端可按模板请求具体的资源，例如 greeting://Alice。
// list 被设为 undefined 表示暂不支持枚举所有可能的 name 值（需要时可实现）。
server.registerResource(
    'greeting', // 资源内部标识名
    new ResourceTemplate('greeting://{name}', { list: undefined }),
    {
        title: 'Greeting Resource',      // 展示名称
        description: 'Dynamic greeting generator' // 描述
    },
    // 读取回调：当客户端请求某个匹配模板的 URI 时被调用
    async (uri, { name }) => ({
        contents: [
            {
                uri: uri.href,          // 原始请求的完整 URI
                text: `Hello, ${name}!` // 资源文本内容
            }
        ]
    })
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
