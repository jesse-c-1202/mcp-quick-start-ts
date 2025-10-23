"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAPAICoreAdapter = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const orchestration_1 = require("@sap-ai-sdk/orchestration");
dotenv_1.default.config();
class SAPAICoreAdapter {
    static _getOrchestrationClient(config) {
        const orchestrationClient = new orchestration_1.OrchestrationClient({
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
exports.SAPAICoreAdapter = SAPAICoreAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU0FQQUlDb3JlQWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNBUEFJQ29yZUFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0RBQTJCO0FBQzNCLDZEQUFvRjtBQUNwRixnQkFBTSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRWYsTUFBYSxnQkFBZ0I7SUFFbEIsTUFBTSxDQUFDLHVCQUF1QixDQUFDLE1BSWpDO1FBRUQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLG1DQUFtQixDQUFDO1lBQ2hELGdCQUFnQixFQUFFO2dCQUNkLEtBQUssRUFBRTtvQkFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssSUFBSSxRQUFRO2lCQUNqQztnQkFDRCxNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtpQkFDNUI7YUFDSjtTQUNKLENBQUMsQ0FBQztRQUNILE9BQU8sbUJBQW1CLENBQUM7SUFDL0IsQ0FBQztDQUNKO0FBcEJELDRDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb3RlbnYgZnJvbSBcImRvdGVudlwiXG5pbXBvcnQgeyBDaGF0Q29tcGxldGlvblRvb2wsIE9yY2hlc3RyYXRpb25DbGllbnQgfSBmcm9tICdAc2FwLWFpLXNkay9vcmNoZXN0cmF0aW9uJztcbmRvdGVudi5jb25maWcoKVxuXG5leHBvcnQgY2xhc3MgU0FQQUlDb3JlQWRhcHRlciB7XG5cbiAgICBwdWJsaWMgc3RhdGljIF9nZXRPcmNoZXN0cmF0aW9uQ2xpZW50KGNvbmZpZzpcbiAgICAgICAge1xuICAgICAgICAgICAgbW9kZWw/OiBzdHJpbmcsXG4gICAgICAgICAgICB0b29scz86IENoYXRDb21wbGV0aW9uVG9vbFtdLFxuICAgICAgICB9XG4gICAgKTogT3JjaGVzdHJhdGlvbkNsaWVudCB7XG4gICAgICAgIGNvbnN0IG9yY2hlc3RyYXRpb25DbGllbnQgPSBuZXcgT3JjaGVzdHJhdGlvbkNsaWVudCh7XG4gICAgICAgICAgICBwcm9tcHRUZW1wbGF0aW5nOiB7XG4gICAgICAgICAgICAgICAgbW9kZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogY29uZmlnLm1vZGVsIHx8IFwiZ3B0LTRvXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcm9tcHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdG9vbHM6IGNvbmZpZy50b29scyB8fCBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBvcmNoZXN0cmF0aW9uQ2xpZW50O1xuICAgIH1cbn0iXX0=