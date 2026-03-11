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
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30 shadow-[0_4px_30px_0_rgba(0,0,0,0.1)]">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
                {/* Logo and Brand */}
                <div className="flex items-center gap-3">
                    <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl smooth-transition">
                        <Menu className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </button>

                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative">
                            <HardDrive className="h-8 w-8 text-primary shadow-primary/20 drop-shadow-[0_0_8px_rgba(var(--primary),0.8)] group-hover:scale-105 smooth-transition" />
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background animate-pulse shadow-[0_0_10px_rgba(var(--primary),1)]" />
                        </div>
                        <div className="hidden sm:block ml-1">
                            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:opacity-80 smooth-transition">
                                GD-Index
                            </h1>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Google Drive Browser</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl mx-6 hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary smooth-transition" />
                        <input
                            type="text"
                            placeholder="Search files and folders..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full h-10 pl-11 pr-4 rounded-full border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 smooth-transition placeholder:text-muted-foreground/60 shadow-inner hover:bg-white/10"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Button */}
                    <button className="md:hidden p-2 hover:bg-white/10 rounded-xl smooth-transition text-muted-foreground hover:text-foreground">
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 hover:bg-white/10 rounded-xl smooth-transition relative group overflow-hidden"
                            aria-label="Toggle theme"
                        >
                            <div className="absolute inset-0 bg-primary/20 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
                            <div className="relative z-10 flex items-center justify-center">
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5 text-accent hover:text-white smooth-transition" />
                                ) : (
                                    <Moon className="h-5 w-5 text-primary hover:text-white smooth-transition" />
                                )}
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
