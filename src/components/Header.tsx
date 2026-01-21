'use client';

import { Search, Moon, Sun, Menu, HardDrive } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useFileStore } from '@/store/useFileStore';
import { useState, useEffect } from 'react';

export default function Header() {
    const { theme, setTheme } = useTheme();
    const { searchQuery, setSearchQuery } = useFileStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
                {/* Logo and Brand */}
                <div className="flex items-center gap-3">
                    <button className="lg:hidden p-2 hover:bg-accent rounded-lg smooth-transition">
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <HardDrive className="h-8 w-8 text-primary" />
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                GD-Index
                            </h1>
                            <p className="text-xs text-muted-foreground">Google Drive Browser</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl mx-4 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search files and folders..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Button */}
                    <button className="md:hidden p-2 hover:bg-accent rounded-lg smooth-transition">
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 hover:bg-accent rounded-lg smooth-transition"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 text-yellow-500" />
                            ) : (
                                <Moon className="h-5 w-5 text-blue-600" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
