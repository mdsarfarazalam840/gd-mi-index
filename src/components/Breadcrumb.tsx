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
        <nav className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/40">
            <button
                onClick={() => handleNavigate(0)}
                className="p-1.5 hover:bg-accent rounded-lg smooth-transition"
                aria-label="Home"
            >
                <Home className="h-4 w-4" />
            </button>

            {breadcrumbs.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}

                    <button
                        onClick={() => handleNavigate(index)}
                        className={`px-3 py-1.5 rounded-lg text-sm smooth-transition ${index === breadcrumbs.length - 1
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {item.name}
                    </button>
                </div>
            ))}
        </nav>
    );
}
