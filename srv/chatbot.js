"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SAPAICoreAdapter_1 = require("./SAPAICoreAdapter");
async function main() {
    const convertTemperatureTool = {
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
    const orchestrationClient = SAPAICoreAdapter_1.SAPAICoreAdapter._getOrchestrationClient({ tools: [convertTemperatureTool] });
    const response = await orchestrationClient.chatCompletion({
        messages: [
            { role: 'user', content: 'Convert 20 degrees Celsius to Fahrenheit.' }
        ]
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
function callFunction(name, args) {
    switch (name) {
        case 'convert_temperature_to_fahrenheit':
            return convertTemperatureToFahrenheit(args.temperature);
        default:
            throw new Error(`Function: ${name} not found!`);
    }
}
function convertTemperatureToFahrenheit(temperature) {
    return `The temperature in Fahrenheit is ${(temperature * 9) / 5 + 32}°F.`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdGJvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoYXRib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5REFBc0Q7QUFHdEQsS0FBSyxVQUFVLElBQUk7SUFFakIsTUFBTSxzQkFBc0IsR0FBdUI7UUFDakQsSUFBSSxFQUFFLFVBQVU7UUFDaEIsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLG1DQUFtQztZQUN6QyxXQUFXLEVBQUUsaURBQWlEO1lBQzlELFVBQVUsRUFBRTtnQkFDVixJQUFJLEVBQUUsUUFBUTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1YsV0FBVyxFQUFFO3dCQUNYLElBQUksRUFBRSxRQUFRO3dCQUNkLFdBQVcsRUFBRSw4Q0FBOEM7cUJBQzVEO2lCQUNGO2dCQUNELFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQzthQUMxQjtTQUNGO0tBQ0YsQ0FBQztJQUNGLE1BQU0sbUJBQW1CLEdBQUcsbUNBQWdCLENBQUMsdUJBQXVCLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUUxRyxNQUFNLFFBQVEsR0FBRyxNQUFNLG1CQUFtQixDQUFDLGNBQWMsQ0FBQztRQUN4RCxRQUFRLEVBQUU7WUFDUixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLDJDQUEyQyxFQUFFO1NBQ3ZFO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXRELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQ3ZELElBQUksV0FBNEIsQ0FBQztJQUVqQyxJQUFJLGVBQWUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxlQUFlLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMxRyxNQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVyRCxtREFBbUQ7UUFDbkQsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU1QyxXQUFXLEdBQUc7WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxVQUFVO1lBQ25CLFlBQVksRUFBRSxRQUFRLENBQUMsRUFBRTtTQUMxQixDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxjQUFjLENBQUM7WUFDN0QsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3ZCLGVBQWUsRUFBRSxRQUFRLENBQUMsY0FBYyxFQUFFO1NBQzNDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixNQUFNLGFBQWEsR0FBRyxNQUFNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztRQUNyRCxRQUFRLEVBQUU7WUFDUixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLG9DQUFvQyxFQUFFO1NBQ2hFO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsb0RBQW9EO0lBQ3BELHdDQUF3QztJQUN4QyxJQUFJO0lBRUosSUFBSSxLQUFLLEVBQUUsTUFBTSxLQUFLLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO1FBQ2pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyw2QkFBNkI7SUFDbkQsQ0FBQztJQUdELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUNyRCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7SUFFakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsYUFBYSxJQUFJLENBQUMsQ0FBQztJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU5RCxDQUFDO0FBRUQsc0NBQXNDO0FBQ3RDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFTLFlBQVksQ0FBQyxJQUFZLEVBQUUsSUFBUztJQUMzQyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ2IsS0FBSyxtQ0FBbUM7WUFDdEMsT0FBTyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUQ7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsOEJBQThCLENBQUMsV0FBbUI7SUFDekQsT0FBTyxvQ0FBb0MsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDO0FBQzdFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGF0Q29tcGxldGlvblRvb2wsIFRvb2xDaGF0TWVzc2FnZSB9IGZyb20gXCJAc2FwLWFpLXNkay9vcmNoZXN0cmF0aW9uXCI7XG5pbXBvcnQgeyBTQVBBSUNvcmVBZGFwdGVyIH0gZnJvbSBcIi4vU0FQQUlDb3JlQWRhcHRlclwiO1xuaW1wb3J0IHsgQ2hhdE1lc3NhZ2UsIElucHV0RmlsdGVyQ29uZmlnIH0gZnJvbSBcIkBzYXAtYWktc2RrL29yY2hlc3RyYXRpb24vZGlzdC9jbGllbnQvYXBpL3NjaGVtYVwiO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuXG4gIGNvbnN0IGNvbnZlcnRUZW1wZXJhdHVyZVRvb2w6IENoYXRDb21wbGV0aW9uVG9vbCA9IHtcbiAgICB0eXBlOiAnZnVuY3Rpb24nLFxuICAgIGZ1bmN0aW9uOiB7XG4gICAgICBuYW1lOiAnY29udmVydF90ZW1wZXJhdHVyZV90b19mYWhyZW5oZWl0JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29udmVydHMgdGVtcGVyYXR1cmUgZnJvbSBDZWxzaXVzIHRvIEZhaHJlbmhlaXQnLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIHRlbXBlcmF0dXJlOiB7XG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRlbXBlcmF0dXJlIHZhbHVlIGluIENlbHNpdXMgdG8gY29udmVydC4nXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlZDogWyd0ZW1wZXJhdHVyZSddXG4gICAgICB9XG4gICAgfVxuICB9O1xuICBjb25zdCBvcmNoZXN0cmF0aW9uQ2xpZW50ID0gU0FQQUlDb3JlQWRhcHRlci5fZ2V0T3JjaGVzdHJhdGlvbkNsaWVudCh7IHRvb2xzOiBbY29udmVydFRlbXBlcmF0dXJlVG9vbF0gfSk7XG5cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBvcmNoZXN0cmF0aW9uQ2xpZW50LmNoYXRDb21wbGV0aW9uKHtcbiAgICBtZXNzYWdlczogW1xuICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6ICdDb252ZXJ0IDIwIGRlZ3JlZXMgQ2Vsc2l1cyB0byBGYWhyZW5oZWl0LicgfVxuICAgIF1cbiAgfSk7XG5cbiAgY29uc29sZS5sb2cocmVzcG9uc2UuZ2V0Q29udGVudCgpKTtcbiAgY29uc29sZS5sb2cocmVzcG9uc2UuZ2V0RmluaXNoUmVhc29uKCkpO1xuICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXNwb25zZS5nZXRUb2tlblVzYWdlKCkpKTtcblxuICBjb25zdCBpbml0aWFsUmVzcG9uc2UgPSByZXNwb25zZS5nZXRBc3Npc3RhbnRNZXNzYWdlKCk7XG4gIGxldCB0b29sTWVzc2FnZTogVG9vbENoYXRNZXNzYWdlO1xuXG4gIGlmIChpbml0aWFsUmVzcG9uc2UgJiYgQXJyYXkuaXNBcnJheShpbml0aWFsUmVzcG9uc2UudG9vbF9jYWxscykgJiYgaW5pdGlhbFJlc3BvbnNlLnRvb2xfY2FsbHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHRvb2xDYWxsID0gaW5pdGlhbFJlc3BvbnNlLnRvb2xfY2FsbHNbMF07XG4gICAgY29uc3QgbmFtZSA9IHRvb2xDYWxsLmZ1bmN0aW9uLm5hbWU7XG4gICAgY29uc3QgYXJncyA9IEpTT04ucGFyc2UodG9vbENhbGwuZnVuY3Rpb24uYXJndW1lbnRzKTtcblxuICAgIC8vIEV4ZWN1dGUgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIHByb3ZpZGVkIGFyZ3VtZW50c1xuICAgIGNvbnN0IHRvb2xSZXN1bHQgPSBjYWxsRnVuY3Rpb24obmFtZSwgYXJncyk7XG5cbiAgICB0b29sTWVzc2FnZSA9IHtcbiAgICAgIHJvbGU6ICd0b29sJyxcbiAgICAgIGNvbnRlbnQ6IHRvb2xSZXN1bHQsXG4gICAgICB0b29sX2NhbGxfaWQ6IHRvb2xDYWxsLmlkXG4gICAgfTtcblxuICAgIGNvbnN0IGZpbmFsUmVzcG9uc2UgPSBhd2FpdCBvcmNoZXN0cmF0aW9uQ2xpZW50LmNoYXRDb21wbGV0aW9uKHtcbiAgICAgIG1lc3NhZ2VzOiBbdG9vbE1lc3NhZ2VdLFxuICAgICAgbWVzc2FnZXNIaXN0b3J5OiByZXNwb25zZS5nZXRBbGxNZXNzYWdlcygpXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhmaW5hbFJlc3BvbnNlLmdldENvbnRlbnQoKSk7XG4gIH1cblxuICAvL3Rlc3Qgc3RyZWFtaW5nXG4gIGNvbnN0IHN0cmVtUmVzcG9uc2UgPSBhd2FpdCBvcmNoZXN0cmF0aW9uQ2xpZW50LnN0cmVhbSh7XG4gICAgbWVzc2FnZXM6IFtcbiAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiAnV3JpdGUgYSBsaXR0bGUgc3RvcnkgYWJvdXQgcmFiYml0LicgfVxuICAgIF1cbiAgfSk7XG5cbiAgLy8gZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlbVJlc3BvbnNlLnN0cmVhbSkge1xuICAvLyAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGNodW5rKSk7XG4gIC8vIH1cblxuICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHN0cmVtUmVzcG9uc2Uuc3RyZWFtLnRvQ29udGVudFN0cmVhbSgpKSB7XG4gICAgY29uc29sZS5sb2coY2h1bmspOyAvLyB3aWxsIGxvZyB0aGUgZGVsdGEgY29udGVudFxuICB9XG5cblxuICBjb25zdCBmaW5pc2hSZWFzb24gPSBzdHJlbVJlc3BvbnNlLmdldEZpbmlzaFJlYXNvbigpO1xuICBjb25zdCB0b2tlblVzYWdlID0gc3RyZW1SZXNwb25zZS5nZXRUb2tlblVzYWdlKCk7XG5cbiAgY29uc29sZS5sb2coYEZpbmlzaCByZWFzb246ICR7c3RyZW1SZXNwb25zZX1cXG5gKTtcbiAgY29uc29sZS5sb2coYFRva2VuIHVzYWdlOiAke0pTT04uc3RyaW5naWZ5KHRva2VuVXNhZ2UpfVxcbmApO1xuXG59XG5cbi8vIGludm9rZSBtYWluIHdpdGhvdXQgdG9wLWxldmVsIGF3YWl0XG5tYWluKCkuY2F0Y2goZXJyID0+IHtcbiAgY29uc29sZS5lcnJvcihlcnIpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59KTtcblxuZnVuY3Rpb24gY2FsbEZ1bmN0aW9uKG5hbWU6IHN0cmluZywgYXJnczogYW55KTogc3RyaW5nIHtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSAnY29udmVydF90ZW1wZXJhdHVyZV90b19mYWhyZW5oZWl0JzpcbiAgICAgIHJldHVybiBjb252ZXJ0VGVtcGVyYXR1cmVUb0ZhaHJlbmhlaXQoYXJncy50ZW1wZXJhdHVyZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRnVuY3Rpb246ICR7bmFtZX0gbm90IGZvdW5kIWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUZW1wZXJhdHVyZVRvRmFocmVuaGVpdCh0ZW1wZXJhdHVyZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBUaGUgdGVtcGVyYXR1cmUgaW4gRmFocmVuaGVpdCBpcyAkeyh0ZW1wZXJhdHVyZSAqIDkpIC8gNSArIDMyfcKwRi5gO1xufVxuXG4iXX0=