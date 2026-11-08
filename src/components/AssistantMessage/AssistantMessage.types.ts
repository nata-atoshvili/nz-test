import type { Message } from '@/types/chat';

export interface AssistantMessageProps {
    message: Message;
    chatId: string;
    last: boolean;
}
