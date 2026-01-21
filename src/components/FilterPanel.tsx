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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 bg-background hover:bg-accent smooth-transition"
            >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {filters.category && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
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
                    <div className="fixed lg:absolute right-0 top-0 lg:top-full lg:mt-2 h-full lg:h-auto w-80 lg:w-96 bg-background border border-border/40 shadow-2xl lg:shadow-xl z-50 lg:rounded-lg animate-slide-in-bottom lg:animate-fade-in">
                        <div className="flex items-center justify-between p-4 border-b border-border/40">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters & Sort
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-accent rounded-lg smooth-transition"
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
                                            key={cat.value}
                                            onClick={() => {
                                                setFilters({ category: cat.value });
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg smooth-transition ${filters.category === cat.value
                                                ? 'bg-primary/10 text-primary border border-primary/20'
                                                : 'hover:bg-accent border border-transparent'
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
                                            key={sort.value}
                                            onClick={() => {
                                                setFilters({ sortBy: sort.value });
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg smooth-transition ${filters.sortBy === sort.value
                                                ? 'bg-primary/10 text-primary border border-primary/20'
                                                : 'hover:bg-accent border border-transparent'
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
                                className="w-full px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg smooth-transition"
                            >
                                Clear All Filters
                            </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
