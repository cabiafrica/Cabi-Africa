import React from 'react';
import { Card, Title, Flex } from '@tremor/react';
import { OpenInNew } from '@mui/icons-material';

interface WidgetWrapperProps {
    title: string;
    children: React.ReactNode;
    widgetId: string;
    className?: string;
    decoration?: "top" | "bottom" | "left" | "right";
    decorationColor?: string; // Using string as Tremor accepts specific color names
}

const openWidget = (id: string) => {
    // Opens a popup window
    window.open(`${window.location.origin}/visualize/${id}`, id, 'width=900,height=600,toolbar=no,menubar=no,location=no,status=no');
};

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
    title,
    children,
    widgetId,
    className,
    decoration,
    decorationColor
}) => {
    // We cast decorationColor to any because Tremor types are strict union types but strings work in practice
    // or we can just pass specific colors. For now, let's trust the caller.

    return (
        <Card
            className={`bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700/50 shadow-xl ${className || ''}`}
            decoration={decoration}
            decorationColor={decorationColor as any}
        >
            <Flex justifyContent="between" alignItems="start" className="mb-4">
                <Title className="text-slate-900 dark:text-slate-100 font-semibold tracking-wide">{title}</Title>
                <button
                    onClick={() => openWidget(widgetId)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-500"
                    title="Detach Widget"
                >
                    <OpenInNew fontSize="small" />
                </button>
            </Flex>
            {children}

            {/* Decorative glint/gradient support could be added here */}
        </Card>
    );
};
