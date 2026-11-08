import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import AppProviders from '@/app/providers/AppProviders';
import { palette } from '@/styles/theme';
import { useChatStore } from '@/store/chatStore';
import { attachChatPersistence } from '@/store/chatPersistence';
import '@/styles/global.scss';

for (const [name, color] of Object.entries(palette)) {
    document.documentElement.style.setProperty(`--brand-${name}`, color);
}
const detachPersistence = attachChatPersistence(useChatStore);
if (import.meta.hot) import.meta.hot.dispose(detachPersistence);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>
);
