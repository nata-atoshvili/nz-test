import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeAnswer } from './scenarios';
import { mockAgent } from './mockAgent';
import type { AgentEvent } from '@/types/agent';
import type { Message } from '@/types/chat';

const user = (text: string): Message => ({ id: crypto.randomUUID(), role: 'user', text });
afterEach(() => vi.useRealTimers());

describe('mock-агент', () => {
    it('учитывает предыдущую тему при просьбе объяснить проще', () => {
        const answer = makeAnswer([
            user('Объясни второй закон Ньютона'),
            { id: 'a', role: 'assistant', text: 'F = ma' },
            user('Объясни проще')
        ]);
        expect(answer.text).toContain('тележку');
        expect(answer.text).toContain('второй закон Ньютона');
    });
    it('выдаёт инструмент до текста, а текст собирается без потерь', async () => {
        vi.useFakeTimers();
        const events: AgentEvent[] = [];
        const task = (async () => {
            for await (const event of mockAgent([user('17 × 24')], new AbortController().signal)) events.push(event);
        })();
        await vi.runAllTimersAsync();
        await task;
        expect(events.findIndex((e) => e.type === 'tool_result')).toBeLessThan(
            events.findIndex((e) => e.type === 'text_delta')
        );
        expect(
            events
                .filter((e) => e.type === 'text_delta')
                .map((e) => e.text)
                .join('')
        ).toBe(makeAnswer([user('17 × 24')]).text);
        expect(events.at(-1)?.type).toBe('completed');
    });
});
