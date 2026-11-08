export interface ComposerProps {
    draft: string;
    busy: boolean;
    onChange: (value: string) => void;
    onSend: () => void;
    onStop: () => void;
}
