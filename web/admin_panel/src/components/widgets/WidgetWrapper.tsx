import React from 'react';
import { Card, Title, Flex } from '@tremor/react';
import { OpenInNew, MoreVert } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

interface WidgetWrapperProps {
    title: string;
    children: React.ReactNode;
    widgetId: string;
    className?: string;
    decoration?: "top" | "bottom" | "left" | "right";
    decorationColor?: string;
}

const openWidget = (id: string) => {
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
    return (
        <Card
            className={`
                bg-slate-900/40 backdrop-blur-xl 
                ring-1 ring-white/10 
                shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                rounded-2xl border-b border-white/5
                transition-all duration-300 hover:ring-primary/20
                ${className || ''}
            `}
            decoration={decoration}
            decorationColor={decorationColor as any}
        >
            <Flex justifyContent="between" alignItems="start" className="mb-4">
                <div className="space-y-1">
                    <Title className="text-white font-bold tracking-tight text-lg">
                        {title}
                    </Title>
                    <div className="h-0.5 w-8 bg-primary/60 rounded-full" />
                </div>
                <div className="flex gap-1">
                    <Tooltip title="Detach Window">
                        <IconButton
                            size="small"
                            onClick={() => openWidget(widgetId)}
                            className="text-slate-400 hover:text-primary hover:bg-primary/10"
                        >
                            <OpenInNew fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <IconButton size="small" className="text-slate-400">
                        <MoreVert fontSize="inherit" />
                    </IconButton>
                </div>
            </Flex>
            
            <div className="relative">
                {children}
            </div>
            
            {/* Subtle bottom glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary/5 blur-xl pointer-events-none" />
        </Card>
    );
};

