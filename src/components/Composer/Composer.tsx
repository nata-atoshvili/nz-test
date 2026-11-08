import { Button, Input } from 'antd';
import { ArrowUpOutlined, StopOutlined } from '@ant-design/icons';
import { MESSAGE_MAX_LENGTH, MESSAGE_COUNTER_THRESHOLD } from '@/utils/chat';
import styles from './Composer.module.scss';
import type { ComposerProps } from './Composer.types';

export default function Composer({ draft, busy, onChange, onSend, onStop }: ComposerProps) {
    return (
        <footer className={styles['composer']}>
            <div className={styles['composer__field']}>
                <Input.TextArea
                    className={styles['composer__input']}
                    aria-label="Сообщение помощнику"
                    placeholder={busy ? 'Следующий вопрос…' : 'Напиши сообщение…'}
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    variant="borderless"
                    value={draft}
                    maxLength={MESSAGE_MAX_LENGTH}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            if (!busy) onSend();
                        }
                    }}
                />
                <div className={styles['composer__actions']}>
                    {draft.length > MESSAGE_COUNTER_THRESHOLD && (
                        <span className={styles['composer__counter']}>
                            {draft.length} / {MESSAGE_MAX_LENGTH}
                        </span>
                    )}
                    {busy ? (
                        <Button
                            className={styles['composer__stop-button']}
                            aria-label="Остановить ответ"
                            type="primary"
                            icon={<StopOutlined />}
                            onClick={onStop}
                        />
                    ) : (
                        <Button
                            className={styles['composer__send-button']}
                            aria-label="Отправить сообщение"
                            type="primary"
                            disabled={!draft.trim()}
                            icon={<ArrowUpOutlined />}
                            onClick={onSend}
                        />
                    )}
                </div>
            </div>
        </footer>
    );
}
