import React from 'react';
import { createPortal } from 'react-dom';
import { useUndockableWindow } from '../../hooks/useUndockableWindow';

export interface UndockablePanelProps {
    title: string;
    subtitle?: string;
    id: string;
    children: React.ReactNode;
    className?: string;
    badgeText?: string;
    width?: number;
    height?: number;
    onDockChange?: (isUndocked: boolean) => void;
}

export const UndockablePanel: React.FC<UndockablePanelProps> = ({
    title,
    subtitle,
    id,
    children,
    className = '',
    badgeText = 'MULTI-SCREEN READY',
    width = 1200,
    height = 820,
    onDockChange,
}) => {
    const { isUndocked, containerEl, undock, dock, focus, error } = useUndockableWindow({
        title,
        windowId: `cabi_undock_${id}`,
        width,
        height,
        onDock: () => onDockChange?.(false),
        onUndock: () => onDockChange?.(true),
    });

    return (
        <div className={`transition-all duration-300 ${className}`}>
            {/* Pop-up Error Notification if blocked */}
            {error && (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={undock}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* DOCKED VIEW: Main Dashboard Widget */}
            {!isUndocked && (
                <div className="space-y-4">
                    {/* Header Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                                {badgeText && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        {badgeText}
                                    </span>
                                )}
                            </div>
                            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={undock}
                                className="group inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 border border-slate-700/60 hover:border-amber-500/50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-amber-500/10 cursor-pointer"
                                title="Detach and move to a secondary monitor or wallboard"
                            >
                                <svg
                                    className="w-4 h-4 text-amber-400 group-hover:scale-110 group-hover:text-amber-300 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                                <span>Undock to External Screen</span>
                            </button>
                        </div>
                    </div>

                    {/* Docked Content */}
                    <div>{children}</div>
                </div>
            )}

            {/* UNDOCKED VIEW: Main Screen Placeholder + React Portal into External Screen */}
            {isUndocked && (
                <>
                    {/* Render children directly into child window DOM via React Portal */}
                    {containerEl && createPortal(children, containerEl)}

                    {/* Placeholder Card on Main Screen */}
                    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 backdrop-blur-xl p-8 sm:p-12 text-center shadow-2xl">
                        {/* Subtle background ambient glow */}
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

                        <div className="relative z-10 max-w-md mx-auto space-y-6">
                            {/* Multi-screen graphic badge */}
                            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
                                <div className="flex items-center gap-3">
                                    <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-mono text-slate-500">⇄</span>
                                    <div className="relative">
                                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    {title} is Undocked
                                </h3>
                                <p className="text-sm text-slate-400 mt-2">
                                    This display is actively streaming live updates to an external monitor window. All metrics and WebSocket events remain fully synchronized.
                                </p>
                            </div>

                            {/* Control Actions */}
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                <button
                                    onClick={focus}
                                    className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                                    title="Bring external window to front"
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Focus Window
                                </button>
                                <button
                                    onClick={dock}
                                    className="px-5 py-2 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-xl transition-all shadow-lg shadow-amber-600/30 border border-amber-400/30 cursor-pointer flex items-center gap-2"
                                    title="Dock display back to this main window"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Dock Back to Main
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UndockablePanel;
