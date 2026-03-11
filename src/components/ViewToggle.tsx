'use client';

import { LayoutGrid, List, ListTree } from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';

export default function ViewToggle() {
    const { viewMode, setViewMode } = useFileStore();

    const views = [
        { mode: 'grid' as const, icon: LayoutGrid, label: 'Grid' },
        { mode: 'list' as const, icon: List, label: 'List' },
        { mode: 'details' as const, icon: ListTree, label: 'Details' },
    ];

    return (
        <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-inner">
            {views.map(({ mode, icon: Icon, label }) => (
                <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium smooth-transition ${viewMode === mode
                            ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]'
                            : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                        }`}
                    aria-label={label}
                    title={label}
                >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
