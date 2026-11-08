import type { StoreApi } from 'zustand';
import type { Chat, Message } from '@/types/chat';
import { createChat, isBusy } from '@/utils/chat';
import type { ChatStore } from './chatStore.types';

const STORAGE_KEY = 'lom-ai-chats-v1';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isMessage(value: unknown): value is Message {
    if (!isRecord(value)) return false;
    return (
        typeof value.id === 'string' &&
        (value.role === 'user' || value.role === 'assistant') &&
        typeof value.text === 'string' &&
        (value.phase === undefined ||
            (typeof value.phase === 'string' &&
                ['sent', 'thinking', 'tool', 'streaming', 'completed', 'error', 'stopped'].includes(value.phase))) &&
        ['status', 'toolResult', 'error'].every((key) => value[key] === undefined || typeof value[key] === 'string') &&
        (value.attempt === undefined ||
            (typeof value.attempt === 'number' && Number.isInteger(value.attempt) && value.attempt > 0))
    );
}

function isChat(value: unknown): value is Chat {
    return (
        isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.draft === 'string' &&
        Array.isArray(value.messages) &&
        value.messages.every(isMessage)
    );
}

export function loadChats(): { chats: Chat[]; activeId: string; storageWarning: boolean } {
    try {
        const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
        if (isRecord(raw) && raw.version === 1 && Array.isArray(raw.chats)) {
            const chats: Chat[] = raw.chats.filter(isChat).map((c: Chat) => ({
                ...c,
                messages: c.messages.map((m) =>
                    isBusy(m.phase) ? { ...m, phase: 'stopped', status: 'Ответ прерван после перезагрузки' } : m
                )
            }));
            if (chats.length)
                return {
                    chats,
                    activeId:
                        typeof raw.activeId === 'string' && chats.some((c) => c.id === raw.activeId)
                            ? raw.activeId
                            : chats[0].id,
                    storageWarning: false
                };
        }
    } catch {
        // A damaged or unavailable storage must not prevent using the chat.
    }
    const chat = createChat();
    return { chats: [chat], activeId: chat.id, storageWarning: false };
}

export function attachChatPersistence(store: StoreApi<ChatStore>): () => void {
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    const save = () => {
        const { chats, activeId } = store.getState();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, chats, activeId }));
        } catch {
            if (!store.getState().storageWarning) store.setState({ storageWarning: true });
        }
    };
    const unsubscribe = store.subscribe(() => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(save, 300);
    });
    const flush = () => {
        clearTimeout(saveTimer);
        save();
    };
    window.addEventListener('pagehide', flush);
    return () => {
        clearTimeout(saveTimer);
        unsubscribe();
        window.removeEventListener('pagehide', flush);
    };
}
