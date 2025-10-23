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

// 使用 Express 搭建一个 HTTP 接口作为 MCP 传输载体。
// StreamableHTTPServerTransport 支持：
// - 单次请求内处理 JSON-RPC 消息
// - SSE（若使用 GET）支持事件流式推送
// const app = express();
// app.use(express.json());

// // 提供 /mcp 路由处理 MCP 的 POST 请求。
// // 每次请求创建新的 transport 避免 requestId 冲突（无持久会话）。
// app.post('/mcp', async (req: express.Request, res: express.Response) => {
//     // 创建传输层实例：
//     // sessionIdGenerator: undefined => 不自动生成持久会话 ID
//     // enableJsonResponse: true => 返回标准 JSON 结构而非只 SSE
//     const transport = new StreamableHTTPServerTransport({
//         sessionIdGenerator: undefined,
//         enableJsonResponse: true
//     });

//     // 当响应关闭时，确保释放传输资源，避免内存泄漏。
//     res.on('close', () => {
//         transport.close();
//     });

//     // 将服务器与传输绑定，开始监听/发送消息。
//     await server.connect(transport);

//     // 处理当前请求的 JSON-RPC 消息体（req.body）。
//     // transport.handleRequest 会解析 JSON、分发到注册的工具/资源等。
//     await transport.handleRequest(req, res, req.body);
// });

// app.get('/mcp', async (req: express.Request, res: express.Response) => {
//     const transport = new StreamableHTTPServerTransport({
//         sessionIdGenerator: undefined,
//         enableJsonResponse: false // SSE模式
//     });

//     res.on('close', () => {
//         transport.close();
//     });

//     await server.connect(transport);
//     await transport.handleRequest(req, res, req.body);
// });

// // 读取端口（支持环境变量 PORT），默认 3000。
// const port = parseInt(process.env.PORT || '3000');

// // 启动 HTTP 服务器并监听 /mcp 路径。
// // 控制台打印启动提示，便于本地调试。
// app.listen(port, () => {
//     // console.error(`Demo MCP Server running on http://localhost:${port}/mcp`);
// }).on('error', error => {
//     // 监听服务器级错误，打印后退出进程（便于容器/进程管理器重启）。
//     console.error('Server error:', error);
//     process.exit(1);
// });

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});