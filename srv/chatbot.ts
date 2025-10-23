import { ChatCompletionTool, ToolChatMessage } from "@sap-ai-sdk/orchestration";
import { SAPAICoreAdapter } from "./SAPAICoreAdapter";
import { ChatMessage, InputFilterConfig } from "@sap-ai-sdk/orchestration/dist/client/api/schema";

async function main() {

  const convertTemperatureTool: ChatCompletionTool = {
    type: 'function',
    function: {
      name: 'convert_temperature_to_fahrenheit',
      description: 'Converts temperature from Celsius to Fahrenheit',
      parameters: {
        type: 'object',
        properties: {
          temperature: {
            type: 'number',
            description: 'The temperature value in Celsius to convert.'
          }
        },
        required: ['temperature']
      }
    }
  };
  const orchestrationClient = SAPAICoreAdapter._getOrchestrationClient({ tools: [convertTemperatureTool] });

  const response = await orchestrationClient.chatCompletion({
    messages: [
      { role: 'user', content: 'Convert 20 degrees Celsius to Fahrenheit.' }
    ]
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
    const toolResult = callFunction(name, args);

    toolMessage = {
      role: 'tool',
      content: toolResult,
      tool_call_id: toolCall.id
    };

    const finalResponse = await orchestrationClient.chatCompletion({
      messages: [toolMessage],
      messagesHistory: response.getAllMessages()
    });

    console.log(finalResponse.getContent());
  }

  //test streaming
  const stremResponse = await orchestrationClient.stream({
    messages: [
      { role: 'user', content: 'Write a little story about rabbit.' }
    ]
  });

  // for await (const chunk of stremResponse.stream) {
  //   console.log(JSON.stringify(chunk));
  // }

  for await (const chunk of stremResponse.stream.toContentStream()) {
    console.log(chunk); // will log the delta content
  }


  const finishReason = stremResponse.getFinishReason();
  const tokenUsage = stremResponse.getTokenUsage();

  console.log(`Finish reason: ${stremResponse}\n`);
  console.log(`Token usage: ${JSON.stringify(tokenUsage)}\n`);

}

// invoke main without top-level await
main().catch(err => {
  console.error(err);
  process.exit(1);
});

function callFunction(name: string, args: any): string {
  switch (name) {
    case 'convert_temperature_to_fahrenheit':
      return convertTemperatureToFahrenheit(args.temperature);
    default:
      throw new Error(`Function: ${name} not found!`);
  }
}

function convertTemperatureToFahrenheit(temperature: number): string {
  return `The temperature in Fahrenheit is ${(temperature * 9) / 5 + 32}°F.`;
}

