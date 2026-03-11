'use client';

import { Home, ChevronRight } from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';

export default function Breadcrumb() {
    const { breadcrumbs, setCurrentFolder, setBreadcrumbs } = useFileStore();

    const handleNavigate = (index: number) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    };

    return (
        <nav className="flex items-center gap-1.5 px-6 py-3 bg-white/[0.02] border-b border-white/5 backdrop-blur-md">
            <button
                onClick={() => handleNavigate(0)}
                className="p-1.5 hover:bg-white/10 rounded-md smooth-transition hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] text-muted-foreground hover:text-foreground"
                aria-label="Home"
            >
                <Home className="h-4 w-4" />
            </button>

            {breadcrumbs.map((item, index) => (
                <div key={item.id} className="flex items-center gap-1.5">
                    {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}

                    <button
                        onClick={() => handleNavigate(index)}
                        className={`px-3 py-1 rounded-md text-sm font-medium smooth-transition bg-transparent ${index === breadcrumbs.length - 1
                                ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                    >
                        {item.name}
                    </button>
                </div>
            ))}
        </nav>
    );
}
