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

        // Setup Document in Child Window
        const childDoc = newWindow.document;
        childDoc.title = `${title} — Cabi Dispatch External Monitor`;

        // Inject viewport and character set safely without innerHTML
        const metaCharset = childDoc.createElement('meta');
        metaCharset.setAttribute('charset', 'utf-8');
        childDoc.head.appendChild(metaCharset);

        const metaViewport = childDoc.createElement('meta');
        metaViewport.setAttribute('name', 'viewport');
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        childDoc.head.appendChild(metaViewport);

        const docTitle = childDoc.createElement('title');
        docTitle.textContent = `${title} — Cabi Dispatch External Display`;
        childDoc.head.appendChild(docTitle);

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

        // External Window Top Bar constructed safely with DOM APIs
        const topBar = childDoc.createElement('header');
        topBar.className = 'sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-lg';

        const leftGroup = childDoc.createElement('div');
        leftGroup.className = 'flex items-center gap-3';

        const logoBadge = childDoc.createElement('div');
        logoBadge.className = 'w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black shadow-md shadow-amber-500/20';
        logoBadge.textContent = 'C';

        const titleGroup = childDoc.createElement('div');
        const titleRow = childDoc.createElement('div');
        titleRow.className = 'flex items-center gap-2';

        const titleSpan = childDoc.createElement('span');
        titleSpan.className = 'text-white font-semibold text-sm tracking-wide';
        titleSpan.textContent = title;

        const badgeSpan = childDoc.createElement('span');
        badgeSpan.className = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        const pulseDot = childDoc.createElement('span');
        pulseDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
        badgeSpan.appendChild(pulseDot);
        badgeSpan.appendChild(childDoc.createTextNode('EXTERNAL SCREEN'));

        titleRow.appendChild(titleSpan);
        titleRow.appendChild(badgeSpan);

        const subText = childDoc.createElement('p');
        subText.className = 'text-[11px] text-slate-400';
        subText.textContent = 'Live multi-display sync connected';

        titleGroup.appendChild(titleRow);
        titleGroup.appendChild(subText);
        leftGroup.appendChild(logoBadge);
        leftGroup.appendChild(titleGroup);

        const rightGroup = childDoc.createElement('div');
        rightGroup.className = 'flex items-center gap-3';

        const fsBtnElem = childDoc.createElement('button');
        fsBtnElem.id = 'cabi-fullscreen-btn';
        fsBtnElem.className = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors cursor-pointer';
        fsBtnElem.title = 'Toggle Fullscreen';
        fsBtnElem.textContent = 'Fullscreen';

        const dockBtnElem = childDoc.createElement('button');
        dockBtnElem.id = 'cabi-dock-btn';
        dockBtnElem.className = 'flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 border border-amber-400/30 rounded-lg transition-all shadow-md shadow-amber-600/30 cursor-pointer';
        dockBtnElem.title = 'Restore back to main workstation (Esc)';
        dockBtnElem.textContent = 'Dock to Main Display';

        rightGroup.appendChild(fsBtnElem);
        rightGroup.appendChild(dockBtnElem);

        topBar.appendChild(leftGroup);
        topBar.appendChild(rightGroup);

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
