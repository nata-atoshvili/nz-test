import { App, Button } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useChatStore } from '@/store/chatStore';
import { isBusy } from '@/utils/chat';
import styles from './Sidebar.module.scss';

export default function Sidebar({ onClose }: { onClose: () => void }) {
    const { modal } = App.useApp();
    const deleteChat = useChatStore((s) => s.deleteChat);
    const chats = useChatStore((s) => s.chats);
    const activeId = useChatStore((s) => s.activeId);
    const createChat = useChatStore((s) => s.createChat);
    const selectChat = useChatStore((s) => s.selectChat);
    const handleCreateChat = () => {
        createChat();
        onClose();
    };

    const handleSelectChat = (id: string) => {
        selectChat(id);
        onClose();
    };

    const handleDeleteChat = (id: string) => {
        modal.confirm({
            title: 'Удалить диалог?',
            content: 'Все сообщения этого диалога будут удалены с устройства.',
            okText: 'Удалить',
            cancelText: 'Отмена',
            okButtonProps: { danger: true },
            onOk: () => deleteChat(id)
        });
    };

    return (
        <div className={styles['sidebar']}>
            <h2 className={styles['sidebar__title']}>Диалоги</h2>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                className={styles['sidebar__new-button']}
                aria-label="Новый диалог"
                onClick={handleCreateChat}
            >
                Новый диалог
            </Button>
            <nav className={styles['sidebar__list']} aria-label="Диалоги">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`${styles['sidebar__chat']} ${chat.id === activeId ? styles['sidebar__chat_active'] : ''}`}
                    >
                        <button
                            className={`${styles['sidebar__chat-button']} ${chat.id === activeId ? styles['sidebar__chat-button_active'] : ''}`}
                            aria-label={chat.title}
                            aria-current={chat.id === activeId ? 'page' : undefined}
                            aria-busy={isBusy(chat.messages.at(-1)?.phase)}
                            onClick={() => handleSelectChat(chat.id)}
                        >
                            <span className={styles['sidebar__chat-title']}>{chat.title}</span>
                            {isBusy(chat.messages.at(-1)?.phase) && (
                                <span className={styles['sidebar__activity']} aria-label="Генерируется ответ" />
                            )}
                        </button>
                        <Button
                            type="text"
                            size="small"
                            className={styles['sidebar__delete-button']}
                            icon={<DeleteOutlined />}
                            aria-label={`Удалить диалог: ${chat.title}`}
                            onClick={() => handleDeleteChat(chat.id)}
                        />
                    </div>
                ))}
            </nav>
        </div>
    );
}
