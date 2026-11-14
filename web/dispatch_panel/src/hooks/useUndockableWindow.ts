import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseUndockableWindowOptions {
    title: string;
    windowId?: string;
    width?: number;
    height?: number;
    onDock?: () => void;
    onUndock?: () => void;
}

export interface UseUndockableWindowReturn {
    isUndocked: boolean;
    containerEl: HTMLElement | null;
    undock: () => void;
    dock: () => void;
    focus: () => void;
    error: string | null;
}

export function useUndockableWindow({
    title,
    windowId = 'cabi_popout_window',
    width = 1200,
    height = 800,
    onDock,
    onUndock,
}: UseUndockableWindowOptions): UseUndockableWindowReturn {
    const [isUndocked, setIsUndocked] = useState<boolean>(false);
    const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const externalWindowRef = useRef<Window | null>(null);
    const checkIntervalRef = useRef<number | null>(null);

    const dock = useCallback(() => {
        if (checkIntervalRef.current) {
            window.clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }

        if (externalWindowRef.current && !externalWindowRef.current.closed) {
            externalWindowRef.current.close();
        }

        externalWindowRef.current = null;
        setContainerEl(null);
        setIsUndocked(false);
        setError(null);

        if (onDock) {
            onDock();
        }
    }, [onDock]);

    const focus = useCallback(() => {
        if (externalWindowRef.current && !externalWindowRef.current.closed) {
            externalWindowRef.current.focus();
        }
    }, []);

    const undock = useCallback(() => {
        setError(null);

        // If window is already open, focus it
        if (externalWindowRef.current && !externalWindowRef.current.closed) {
            externalWindowRef.current.focus();
            return;
        }

        // Calculate centered position on current or secondary screen
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const windowFeatures = `width=${width},height=${height},left=${Math.max(0, left)},top=${Math.max(0, top)},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;

        const newWindow = window.open('', windowId, windowFeatures);

        if (!newWindow) {
            setError('Pop-up window was blocked. Please allow pop-ups for this site to undock the display to an external screen.');
            return;
        }

        externalWindowRef.current = newWindow;

        const safeTitle = title.replace(/[&<>'"]/g, (tag) => {
            const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return map[tag] || tag;
        });

        // Setup Document in Child Window
        const childDoc = newWindow.document;
        childDoc.title = `${title} — Cabi Dispatch External Monitor`;

        // Inject viewport and character set
        childDoc.head.innerHTML = `
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${safeTitle} — Cabi Dispatch External Display</title>
        `;

        // Copy all parent stylesheets, inline styles, and font links to child window
        const headNodes = document.head.childNodes;
        headNodes.forEach((node) => {
            if (node.nodeName === 'STYLE' || (node.nodeName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet')) {
                childDoc.head.appendChild(node.cloneNode(true));
            }
        });

        // Setup base body styling
        childDoc.body.className = 'bg-neutral-950 text-slate-100 min-h-screen overflow-x-hidden antialiased selection:bg-amber-500 selection:text-black m-0 p-0';

        // Create main layout structure inside child document
        const shell = childDoc.createElement('div');
        shell.className = 'flex flex-col min-h-screen bg-slate-950';

        // External Window Top Bar
        const topBar = childDoc.createElement('header');
        topBar.className = 'sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-lg';
        topBar.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black shadow-md shadow-amber-500/20">
                    C
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-white font-semibold text-sm tracking-wide">${safeTitle}</span>
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            EXTERNAL SCREEN
                        </span>
                    </div>
                    <p class="text-[11px] text-slate-400">Live multi-display sync connected</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <button id="cabi-fullscreen-btn" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors cursor-pointer" title="Toggle Fullscreen">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    Fullscreen
                </button>
                <button id="cabi-dock-btn" class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 border border-amber-400/30 rounded-lg transition-all shadow-md shadow-amber-600/30 cursor-pointer" title="Restore back to main workstation (Esc)">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                    Dock to Main Display
                </button>
            </div>
        `;

        // Content Root Container for React Portal
        const contentRoot = childDoc.createElement('div');
        contentRoot.id = 'popout-portal-root';
        contentRoot.className = 'flex-1 p-6 overflow-y-auto';

        shell.appendChild(topBar);
        shell.appendChild(contentRoot);
        childDoc.body.appendChild(shell);

        // Bind Dock button inside child window
        const dockBtn = topBar.querySelector('#cabi-dock-btn');
        if (dockBtn) {
            dockBtn.addEventListener('click', () => {
                dock();
            });
        }

        // Bind Fullscreen button inside child window
        const fsBtn = topBar.querySelector('#cabi-fullscreen-btn');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (!childDoc.fullscreenElement) {
                    childDoc.documentElement.requestFullscreen?.().catch((err) => {
                        console.warn('[UndockableWindow] Fullscreen request rejected:', err);
                    });
                } else {
                    childDoc.exitFullscreen?.().catch((err) => {
                        console.warn('[UndockableWindow] Exit fullscreen rejected:', err);
                    });
                }
            });
        }

        // Keyboard shortcut: Escape or Ctrl+D docks back
        childDoc.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape' || (e.ctrlKey && e.key.toLowerCase() === 'd')) {
                e.preventDefault();
                dock();
            }
        });

        // Set React Portal container element
        setContainerEl(contentRoot);
        setIsUndocked(true);

        if (onUndock) {
            onUndock();
        }

        // Liveness check: If user closes the child window via OS title bar (X button)
        checkIntervalRef.current = window.setInterval(() => {
            if (newWindow.closed) {
                dock();
            }
        }, 500);

        // Child window unload event
        newWindow.addEventListener('beforeunload', () => {
            dock();
        });
    }, [dock, height, onUndock, title, width, windowId]);

    // Parent window unload cleanup: Close child window if parent is refreshed or closed
    useEffect(() => {
        const handleParentUnload = () => {
            if (externalWindowRef.current && !externalWindowRef.current.closed) {
                externalWindowRef.current.close();
            }
        };

        window.addEventListener('beforeunload', handleParentUnload);

        return () => {
            window.removeEventListener('beforeunload', handleParentUnload);
            if (checkIntervalRef.current) {
                window.clearInterval(checkIntervalRef.current);
            }
            if (externalWindowRef.current && !externalWindowRef.current.closed) {
                externalWindowRef.current.close();
            }
        };
    }, []);

    return {
        isUndocked,
        containerEl,
        undock,
        dock,
        focus,
        error,
    };
}
