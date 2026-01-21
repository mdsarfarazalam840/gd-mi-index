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
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/40">
            {views.map(({ mode, icon: Icon, label }) => (
                <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm smooth-transition ${viewMode === mode
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
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
