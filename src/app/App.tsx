import { useState } from 'react';
import { Alert, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import useChatScroll from '@/hooks/useChatScroll/useChatScroll';
import { useChatStore } from '@/store/chatStore';
import { isBusy } from '@/utils/chat';
import Sidebar from '@/components/Sidebar/Sidebar';
import Composer from '@/components/Composer/Composer';
import Welcome from '@/components/Welcome/Welcome';
import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';
import styles from './App.module.scss';

export default function App() {
    const chats = useChatStore((s) => s.chats);
    const activeId = useChatStore((s) => s.activeId);
    const setDraft = useChatStore((s) => s.setDraft);
    const send = useChatStore((s) => s.send);
    const stop = useChatStore((s) => s.stop);
    const storageWarning = useChatStore((s) => s.storageWarning);
    const chat = chats.find((c) => c.id === activeId)!;
    const busy = isBusy(chat.messages.at(-1)?.phase);
    const [drawer, setDrawer] = useState(false);
    const { scrollRef, handleScroll, scrollToLatest } = useChatScroll(activeId, chat.messages);
    const handleSubmit = () => {
        scrollToLatest();
        send(activeId);
    };

    return (
        <div className={styles['app']}>
            <aside className={styles['app__sidebar']}>
                <Sidebar onClose={() => setDrawer(false)} />
            </aside>
            <Drawer
                title="Твои диалоги"
                placement="left"
                open={drawer}
                onClose={() => setDrawer(false)}
                size={290}
                styles={{ body: { padding: 20 } }}
            >
                <Sidebar onClose={() => setDrawer(false)} />
            </Drawer>
            <main className={styles['app__main']}>
                <header className={styles['app__header']}>
                    <div className={styles['app__header-content']}>
                        <Button
                            className={styles['app__menu-button']}
                            type="text"
                            icon={<MenuOutlined />}
                            aria-label="Открыть диалоги"
                            onClick={() => setDrawer(true)}
                        />
                        <span className={styles['app__title']}>LOM AI</span>
                    </div>
                    <span className={styles['app__subtitle']}>Учебный помощник · демо</span>
                </header>
                {storageWarning && (
                    <Alert
                        banner
                        type="warning"
                        title="Не удалось сохранить историю на устройстве. Чат продолжает работать, но изменения могут потеряться после перезагрузки."
                    />
                )}
                <div className={styles['app__conversation']} ref={scrollRef} onScroll={handleScroll}>
                    {chat.messages.length === 0 ? (
                        <Welcome />
                    ) : (
                        <div className={styles['app__messages']}>
                            {chat.messages.map((message, i) =>
                                message.role === 'user' ? (
                                    <article
                                        key={message.id}
                                        className={styles['app__user-message']}
                                        aria-label="Твоё сообщение"
                                    >
                                        <div className={styles['app__user-text']}>{message.text}</div>
                                        <div className={styles['app__user-label']}>Ты</div>
                                    </article>
                                ) : (
                                    <AssistantMessage
                                        key={message.id}
                                        message={message}
                                        chatId={activeId}
                                        last={i === chat.messages.length - 1}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
                <Composer
                    draft={chat.draft}
                    busy={busy}
                    onChange={(value) => setDraft(activeId, value)}
                    onSend={handleSubmit}
                    onStop={() => stop(activeId)}
                />
            </main>
        </div>
    );
}
