import type { Phase } from './agent';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    phase?: Phase;
    status?: string;
    toolResult?: string;
    error?: string;
    attempt?: number;
}
export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    draft: string;
}
