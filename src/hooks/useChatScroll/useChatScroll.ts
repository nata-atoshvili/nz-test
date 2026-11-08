import { useLayoutEffect, useRef } from 'react';
import type { Message } from '@/types/chat';

export default function useChatScroll(chatId: string, messages: Message[]) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const stick = useRef(true);
    const previousChatId = useRef<string | undefined>(undefined);

    useLayoutEffect(() => {
        if (previousChatId.current !== chatId) {
            stick.current = true;
            previousChatId.current = chatId;
        }
        const element = scrollRef.current;
        if (element && stick.current) element.scrollTop = messages.length ? element.scrollHeight : 0;
    }, [chatId, messages]);

    const handleScroll = () => {
        const element = scrollRef.current;
        if (element) stick.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    };
    const scrollToLatest = () => {
        stick.current = true;
    };
    return { scrollRef, handleScroll, scrollToLatest };
}
