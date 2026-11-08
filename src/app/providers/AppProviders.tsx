import type { ReactNode } from 'react';
import { App, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { theme } from '@/styles/theme';

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ConfigProvider locale={ruRU} theme={theme}>
            <App>{children}</App>
        </ConfigProvider>
    );
}
