'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Key for session storage
const WELCOME_KEY = 'gd_index_welcome_seen';

// Check sessionStorage synchronously (safe because this is 'use client')
function hasSeenWelcome(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return sessionStorage.getItem(WELCOME_KEY) === 'true';
    } catch {
        return false;
    }
}

export default function WelcomeOverlay({ children }: { children: React.ReactNode }) {
    // Start as true (show welcome) unless session already seen
    const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome());
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [dismissed, setDismissed] = useState(() => hasSeenWelcome());

    const handleOpenWorld = useCallback(() => {
        setIsAnimatingOut(true);
        try {
            sessionStorage.setItem(WELCOME_KEY, 'true');
        } catch { /* ignore */ }

        setTimeout(() => {
            setShowWelcome(false);
            setDismissed(true);
        }, 1500);
    }, []);

    // If welcome was already seen, render children directly
    if (dismissed && !showWelcome) {
        return <>{children}</>;
    }

    // While welcome is active, do NOT render children at all
    if (showWelcome) {
        return (
            <AnimatePresence>
                <motion.div
                    className={`fixed inset-0 z-[1000] flex items-center justify-center bg-background overflow-hidden ${isAnimatingOut ? 'pointer-events-none' : ''}`}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                >
                    {/* Dynamic Background Mesh */}
                    <motion.div
                        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"
                        animate={isAnimatingOut ? {
                            scale: 1.5,
                            opacity: 0,
                            filter: 'blur(20px)',
                        } : {
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: isAnimatingOut ? 1.2 : 8,
                            repeat: isAnimatingOut ? 0 : Infinity,
                            ease: isAnimatingOut ? "circIn" : "easeInOut"
                        }}
                    />

                    {/* Shutter Effects (Top and Bottom) */}
                    <motion.div
                        className="absolute top-0 left-0 right-0 h-1/2 bg-black z-10"
                        initial={{ y: 0 }}
                        animate={{ y: isAnimatingOut ? '-100%' : 0 }}
                        transition={{ duration: 1.2, ease: [0.7, 0, 0.1, 1], delay: 0.1 }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1/2 bg-black z-10"
                        initial={{ y: 0 }}
                        animate={{ y: isAnimatingOut ? '100%' : 0 }}
                        transition={{ duration: 1.2, ease: [0.7, 0, 0.1, 1], delay: 0.1 }}
                    />

                    <div className="relative z-20 flex flex-col items-center">
                        <motion.div
                            animate={isAnimatingOut ? {
                                scale: 5,
                                opacity: 0,
                                y: -100,
                                rotateX: 45
                            } : {}}
                            transition={{ duration: 1.2, ease: [0.7, 0, 0.1, 1] }}
                            className="flex flex-col items-center gap-8"
                        >
                            <motion.h1
                                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            >
                                GD-Index
                            </motion.h1>

                            <motion.p
                                className="text-muted-foreground text-lg uppercase tracking-[0.2em] font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.6 }}
                            >
                                Next-Generation Access
                            </motion.p>

                            <motion.button
                                onClick={handleOpenWorld}
                                className="group relative mt-12 px-8 py-4 bg-white/5 border border-white/10 rounded-full overflow-hidden backdrop-blur-md smooth-transition hover:border-primary/50 hover:bg-primary/10"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                <span className="relative z-10 text-white font-semibold tracking-wider uppercase text-sm flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                                    Open the World
                                </span>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // After animation completes, render children
    return <>{children}</>;
}
