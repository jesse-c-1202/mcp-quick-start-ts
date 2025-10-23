import dotenv from "dotenv"
import { ChatCompletionTool, OrchestrationClient } from '@sap-ai-sdk/orchestration';
dotenv.config()

export class SAPAICoreAdapter {

    public static _getOrchestrationClient(config:
        {
            model?: string,
            tools?: ChatCompletionTool[],
        }
    ): OrchestrationClient {
        const orchestrationClient = new OrchestrationClient({
            promptTemplating: {
                model: {
                    name: config.model || "gpt-4o",
                },
                prompt: {
                    tools: config.tools || []
                }
            }
        });
        return orchestrationClient;
    }
}