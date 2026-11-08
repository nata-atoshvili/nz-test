import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from './chatStore';
const store = () => useChatStore.getState();
beforeEach(() => {
    vi.useFakeTimers();
    for (const chat of store().chats) store().stop(chat.id);
    useChatStore.setState({
        chats: [{ id: 'a', title: 'Новый диалог', messages: [], draft: '' }],
        activeId: 'a',
        storageWarning: false
    });
});
afterEach(async () => {
    for (const chat of store().chats) store().stop(chat.id);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
});
describe('независимые запросы диалогов', () => {
    it('завершает ответ в исходном чате после переключения', async () => {
        store().send('a', 'Объясни закон Ома');
        store().createChat();
        const b = store().activeId;
        store().setDraft(b, 'Мой черновик');
        await vi.runAllTimersAsync();
        expect(store().activeId).toBe(b);
        expect(store().chats.find((c) => c.id === b)?.messages).toHaveLength(0);
        expect(store().chats.find((c) => c.id === b)?.draft).toBe('Мой черновик');
        expect(
            store()
                .chats.find((c) => c.id === 'a')
                ?.messages.at(-1)?.phase
        ).toBe('completed');
    });
    it('остановка сохраняет текст и не мешает немедленному повтору', async () => {
        store().send('a', 'Объясни дроби');
        await vi.advanceTimersByTimeAsync(1200);
        store().stop('a');
        const text = store().chats[0].messages.at(-1)?.text;
        expect(text?.length).toBeGreaterThan(0);
        expect(store().chats[0].messages.at(-1)).toMatchObject({ phase: 'stopped', text });
        store().retry('a');
        await vi.runAllTimersAsync();
        expect(store().chats[0].messages).toHaveLength(2);
        expect(store().chats[0].messages.at(-1)?.phase).toBe('completed');
    });
    it('повтор после ошибки не дублирует вопрос', async () => {
        store().send('a', 'Покажи ошибку');
        await vi.runAllTimersAsync();
        expect(store().chats[0].messages.at(-1)?.phase).toBe('error');
        store().retry('a');
        await vi.runAllTimersAsync();
        expect(store().chats[0].messages).toHaveLength(2);
        expect(store().chats[0].messages.at(-1)?.phase).toBe('completed');
    });
});
