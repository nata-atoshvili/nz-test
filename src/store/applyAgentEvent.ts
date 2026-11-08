import type { AgentEvent } from '@/types/agent';
import type { Message } from '@/types/chat';

export function applyAgentEvent(message: Message, event: AgentEvent): Message {
    switch (event.type) {
        case 'started':
            return { ...message, phase: 'thinking', status: 'Думаю над ответом' };
        case 'status':
            return { ...message, status: event.message };
        case 'tool_call':
            return { ...message, phase: 'tool', status: 'Проверяю на калькуляторе' };
        case 'tool_result':
            return { ...message, toolResult: event.result };
        case 'text_delta':
            return {
                ...message,
                phase: 'streaming',
                status: 'Пишу ответ',
                text: message.text + event.text
            };
        case 'completed':
            return { ...message, phase: 'completed', status: undefined };
        case 'error':
            return { ...message, phase: 'error', error: event.message, status: undefined };
    }
}
