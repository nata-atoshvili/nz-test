export type Phase = 'sent' | 'thinking' | 'tool' | 'streaming' | 'completed' | 'error' | 'stopped';
export type AgentEvent =
    | { type: 'started' }
    | { type: 'status'; message: string }
    | { type: 'tool_call'; tool: string }
    | { type: 'tool_result'; tool: string; result: string }
    | { type: 'text_delta'; text: string }
    | { type: 'completed' }
    | { type: 'error'; message: string };
