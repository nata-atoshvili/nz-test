import type { AgentEvent } from '@/types/agent';
import type { Message } from '@/types/chat';
import { delay } from '@/utils/delay/delay';
import { makeAnswer } from './scenarios';

export async function* mockAgent(history: Message[], signal: AbortSignal, attempt = 1): AsyncGenerator<AgentEvent> {
    yield { type: 'started' };
    await delay(350, signal);
    yield { type: 'status', message: 'Разбираюсь в твоём вопросе' };
    await delay(650, signal);
    if (/ошибк|сбой/i.test(history.filter((m) => m.role === 'user').at(-1)?.text ?? '') && attempt === 1) {
        yield {
            type: 'error',
            message: 'Не удалось получить ответ. Попробуй ещё раз — твой вопрос сохранён.'
        };
        return;
    }
    const answer = makeAnswer(history);
    if (answer.toolResult) {
        yield { type: 'tool_call', tool: 'calculator' };
        await delay(650, signal);
        yield { type: 'tool_result', tool: 'calculator', result: answer.toolResult };
        yield { type: 'status', message: 'Готовлю объяснение' };
        await delay(400, signal);
    }
    const chunks = answer.text.match(/.{1,14}(?:\s|$)|\S{1,14}/gs) ?? [answer.text];
    for (const text of chunks) {
        await delay(32, signal);
        yield { type: 'text_delta', text };
    }
    yield { type: 'completed' };
}
