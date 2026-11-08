import styles from './Welcome.module.scss';

export default function Welcome() {
    return (
        <section className={styles['welcome']}>
            <h1 className={styles['welcome__title']}>Новый диалог</h1>
            <p className={styles['welcome__description']}>Напиши учебный вопрос, чтобы начать.</p>
        </section>
    );
}
