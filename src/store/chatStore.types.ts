import type { Chat } from '@/types/chat';

export interface ChatStore {
    chats: Chat[];
    activeId: string;
    storageWarning: boolean;
    createChat: () => void;
    selectChat: (id: string) => void;
    deleteChat: (id: string) => void;
    setDraft: (id: string, draft: string) => void;
    send: (id: string, text?: string) => void;
    retry: (id: string) => void;
    stop: (id: string) => void;
}
