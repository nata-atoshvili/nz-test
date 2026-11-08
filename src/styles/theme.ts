import type { ThemeConfig } from 'antd';

// Source: https://neiroznanie.ru/ — the site's :root color variables.
export const palette = {
    primary: '#2757EB',
    primaryDark: '#1B3FC4',
    ink: '#0B1830',
    inkSoft: '#4A5A73',
    inkFaint: '#8393A8',
    sky: '#EEF4FF',
    skyMid: '#DFEAFF',
    paper: '#F7FAFF',
    line: '#DEE7F5',
    white: '#FFFFFF'
};

export const theme: ThemeConfig = {
    token: {
        colorPrimary: palette.primary,
        colorPrimaryHover: palette.primaryDark,
        colorPrimaryActive: palette.primaryDark,
        colorText: palette.ink,
        colorTextSecondary: palette.inkSoft,
        colorBgLayout: palette.paper,
        colorBorder: palette.line,
        colorBgContainer: palette.white,
        borderRadius: 10,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        controlHeight: 40
    },
    components: {
        Button: { primaryShadow: 'none' },
        Input: { activeShadow: '0 0 0 2px rgba(39, 87, 235, 0.08)' }
    }
};
