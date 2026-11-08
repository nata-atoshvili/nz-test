import { Alert, Button, Spin } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useChatStore } from '@/store/chatStore';
import { isBusy } from '@/utils/chat';
import styles from './AssistantMessage.module.scss';
import type { AssistantMessageProps } from './AssistantMessage.types';

export default function AssistantMessage({ message, chatId, last }: AssistantMessageProps) {
    const busy = isBusy(message.phase);
    const retry = useChatStore((s) => s.retry);
    return (
        <article className={styles['assistant-message']} aria-label="Ответ помощника">
            <div className={styles['assistant-message__body']}>
                <div className={styles['assistant-message__author']}>LOM AI</div>
                {message.toolResult && (
                    <details className={styles['assistant-message__tool']}>
                        <summary className={styles['assistant-message__tool-summary']}>
                            <CheckOutlined /> Калькулятор · проверено
                        </summary>
                        <p className={styles['assistant-message__tool-result']}>{message.toolResult}</p>
                    </details>
                )}
                {busy && (
                    <div className={styles['assistant-message__status']} role="status">
                        <Spin size="small" /> {message.status}
                    </div>
                )}
                {message.text && (
                    <div
                        className={`${styles['assistant-message__text']} ${message.phase === 'streaming' ? styles['assistant-message__text_streaming'] : ''}`}
                    >
                        {message.text}
                    </div>
                )}
                {message.phase === 'error' && (
                    <Alert
                        type="error"
                        showIcon
                        title="Ответ не получен"
                        description={
                            <>
                                <p className={styles['assistant-message__error-text']}>{message.error}</p>
                                {last && (
                                    <Button icon={<ReloadOutlined />} onClick={() => retry(chatId)}>
                                        Попробовать ещё раз
                                    </Button>
                                )}
                            </>
                        }
                    />
                )}
                {message.phase === 'stopped' && (
                    <div className={styles['assistant-message__stopped']}>
                        <span className={styles['assistant-message__stopped-label']}>
                            {message.status || 'Ответ остановлен'}
                        </span>
                        {last && (
                            <Button
                                size="small"
                                aria-label="Повторить"
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={() => retry(chatId)}
                            >
                                Повторить
                            </Button>
                        )}
                    </div>
                )}
                {message.phase === 'completed' && (
                    <div className={styles['assistant-message__completed']}>
                        <CheckOutlined /> Ответ готов
                    </div>
                )}
            </div>
        </article>
    );
}
