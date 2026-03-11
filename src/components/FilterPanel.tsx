'use client';

import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { FILE_CATEGORIES } from '@/utils/constants';
import { useFileStore } from '@/store/useFileStore';

export default function FilterPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { filters, setFilters } = useFileStore();

    const categories = [
        { value: '', label: 'All Files' },
        { value: 'folder', label: '📁 Folders' },
        { value: 'image', label: '🖼️ Images' },
        { value: 'video', label: '🎬 Videos' },
        { value: 'audio', label: '🎵 Audio' },
        { value: 'document', label: '📄 Documents' },
        { value: 'archive', label: '📦 Archives (Zip/Rar)' },
        { value: 'code', label: '💻 Code' },
    ];

    const sortOptions = [
        { value: 'name_asc', label: 'Name (A-Z)' },
        { value: 'name_desc', label: 'Name (Z-A)' },
        { value: 'date_desc', label: 'Date (Newest)' },
        { value: 'date_asc', label: 'Date (Oldest)' },
        { value: 'size_desc', label: 'Size (Largest)' },
        { value: 'size_asc', label: 'Size (Smallest)' },
    ];

    return (
        <>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 shadow-inner smooth-transition group"
            >
                <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary smooth-transition" />
                <span className="hidden sm:inline font-medium text-sm">Filters</span>
                {filters.category && (
                    <span className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                        1
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="fixed lg:absolute right-0 top-0 lg:top-full lg:mt-3 h-full lg:h-auto w-80 lg:w-96 glass-panel border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] z-50 rounded-l-3xl lg:rounded-2xl animate-slide-in-bottom lg:animate-fade-in flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <h3 className="font-semibold flex items-center gap-2 text-foreground">
                                <Filter className="h-4 w-4 text-primary" />
                                Filters & Sort
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-full smooth-transition text-muted-foreground hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] lg:max-h-96">
                            {/* Category Filter */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">File Type</label>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => {
                                                setFilters({ category: cat.value });
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm smooth-transition ${filters.category === cat.value
                                                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_10px_rgba(var(--primary),0.2)]'
                                                : 'hover:bg-white/5 border border-transparent text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">Sort By</label>
                                <div className="space-y-2">
                                    {sortOptions.map((sort) => (
                                        <button
                                            key={sort.value}
                                            onClick={() => {
                                                setFilters({ sortBy: sort.value });
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm smooth-transition ${filters.sortBy === sort.value
                                                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_10px_rgba(var(--primary),0.2)]'
                                                : 'hover:bg-white/5 border border-transparent text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {sort.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    setFilters({ category: '', sortBy: '' });
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 font-medium rounded-xl smooth-transition border border-red-500/20"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
