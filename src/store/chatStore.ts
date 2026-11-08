import { create } from 'zustand';
import { mockAgent } from '@/agent/mockAgent';
import type { Chat, Message } from '@/types/chat';
import { createChat, isBusy, MESSAGE_MAX_LENGTH } from '@/utils/chat';
import { applyAgentEvent } from './applyAgentEvent';
import { loadChats } from './chatPersistence';
import type { ChatStore } from './chatStore.types';

const controllers = new Map<string, AbortController>();

export const useChatStore = create<ChatStore>((set, get) => {
    const updateChat = (chatId: string, update: (chat: Chat) => Chat) =>
        set((state) => ({ chats: state.chats.map((chat) => (chat.id === chatId ? update(chat) : chat)) }));

    const updateMessage = (chatId: string, messageId: string, update: (message: Message) => Message) =>
        updateChat(chatId, (chat) => ({
            ...chat,
            messages: chat.messages.map((message) => (message.id === messageId ? update(message) : message))
        }));

    const run = async (chatId: string, messageId: string, history: Message[], attempt: number) => {
        const controller = new AbortController();
        controllers.set(chatId, controller);
        try {
            for await (const event of mockAgent(history, controller.signal, attempt)) {
                if (controllers.get(chatId) !== controller || controller.signal.aborted) return;
                updateMessage(chatId, messageId, (m) => applyAgentEvent(m, event));
            }
        } catch (error) {
            if (!controller.signal.aborted && controllers.get(chatId) === controller)
                updateMessage(chatId, messageId, (m) => ({
                    ...m,
                    phase: 'error',
                    error:
                        error instanceof Error ? 'Не удалось завершить ответ. Попробуй ещё раз.' : 'Произошла ошибка.'
                }));
        } finally {
            if (controllers.get(chatId) === controller) controllers.delete(chatId);
        }
    };
    return {
        ...loadChats(),
        createChat: () => {
            const chat = createChat();
            set((s) => ({ chats: [chat, ...s.chats], activeId: chat.id }));
        },
        selectChat: (id) => {
            if (get().chats.some((c) => c.id === id)) set({ activeId: id });
        },
        deleteChat: (id) => {
            controllers.get(id)?.abort();
            controllers.delete(id);
            set((s) => {
                const rest = s.chats.filter((c) => c.id !== id);
                const chats = rest.length ? rest : [createChat()];
                return { chats, activeId: s.activeId === id ? chats[0].id : s.activeId };
            });
        },
        setDraft: (id, draft) => updateChat(id, (chat) => ({ ...chat, draft })),
        send: (id, text) => {
            const chat = get().chats.find((c) => c.id === id);
            if (!chat || isBusy(chat.messages.at(-1)?.phase)) return;
            const value = (text ?? chat.draft).trim();
            if (!value || value.length > MESSAGE_MAX_LENGTH) return;
            const user: Message = { id: crypto.randomUUID(), role: 'user', text: value };
            const assistant: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: '',
                phase: 'sent',
                status: 'Вопрос отправлен',
                attempt: 1
            };
            updateChat(id, (currentChat) => ({
                ...currentChat,
                draft: '',
                title: currentChat.messages.length ? currentChat.title : value.slice(0, 48),
                messages: [...currentChat.messages, user, assistant]
            }));
            void run(id, assistant.id, [...chat.messages, user], 1);
        },
        retry: (id) => {
            const chat = get().chats.find((c) => c.id === id);
            const last = chat?.messages.at(-1);
            if (!chat || !last || !['error', 'stopped'].includes(last.phase ?? '')) return;
            const attempt = (last.attempt ?? 1) + 1;
            updateMessage(id, last.id, (m) => ({
                ...m,
                text: '',
                phase: 'sent',
                status: 'Пробую ещё раз',
                error: undefined,
                toolResult: undefined,
                attempt
            }));
            void run(id, last.id, chat.messages.slice(0, -1), attempt);
        },
        stop: (id) => {
            controllers.get(id)?.abort();
            controllers.delete(id);
            const last = get()
                .chats.find((c) => c.id === id)
                ?.messages.at(-1);
            if (last && isBusy(last.phase))
                updateMessage(id, last.id, (m) => ({ ...m, phase: 'stopped', status: 'Ответ остановлен' }));
        }
    };
});
