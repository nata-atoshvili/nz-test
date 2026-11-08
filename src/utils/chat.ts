import type { Chat } from '@/types/chat';
import type { Phase } from '@/types/agent';

export const MESSAGE_MAX_LENGTH = 6000;
export const MESSAGE_COUNTER_THRESHOLD = MESSAGE_MAX_LENGTH - 500;

export const createChat = (): Chat => ({
    id: crypto.randomUUID(),
    title: 'Новый диалог',
    messages: [],
    draft: ''
});

export const isBusy = (phase?: Phase) =>
    phase === 'sent' || phase === 'thinking' || phase === 'tool' || phase === 'streaming';
