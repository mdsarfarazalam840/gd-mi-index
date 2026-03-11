'use client';

import { X, Download, Maximize, Minimize, Music } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
// @ts-ignore
import Player from 'video.js/dist/video-js';
import '@/app/video-js.css';

interface TrackMetadata {
    audio: Array<{
        index: number;
        label: string;
        language: string;
        codec: string;
    }>;
    subtitle: Array<{
        index: number;
        label: string;
        language: string;
        codec: string;
    }>;
}

export default function VideoPlayer() {
    const { videoPlayerOpen, setVideoPlayerOpen, currentMediaFile } = useUIStore();
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<typeof Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioMenuRef = useRef<HTMLDivElement>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover'>('contain');
    const [tracks, setTracks] = useState<TrackMetadata | null>(null);
    const [currentAudioTrack, setCurrentAudioTrack] = useState<number | null>(null);
    const [showAudioMenu, setShowAudioMenu] = useState(false);

    // Fetch track metadata
    const fetchTracks = useCallback(async (fileId: string) => {
        try {
            const response = await fetch(`/api/tracks/${fileId}`);
            if (response.ok) {
                const data = await response.json();
                setTracks(data);
                return data;
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }
        return null;
    }, []);

    // Change audio track
    const changeAudioTrack = useCallback((index: number) => {
        if (!playerRef.current || !currentMediaFile) return;

        const player = playerRef.current;
        const currentTime = player.currentTime();
        const isPaused = player.paused();

        setCurrentAudioTrack(index);
        setShowAudioMenu(false);

        // Update source with audioTrack param
        player.src({
            src: `/api/stream/${currentMediaFile.id}?audioTrack=${index}`,
            type: 'video/mp4'
        });

        // Restore time after metadata loads
        player.one('loadedmetadata', () => {
            player.currentTime(currentTime);
            if (!isPaused) player.play();
        });
    }, [currentMediaFile]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (audioMenuRef.current && !audioMenuRef.current.contains(e.target as Node)) {
                setShowAudioMenu(false);
            }
        };

        if (showAudioMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAudioMenu]);

    // Initialize player
    useEffect(() => {
        if (!videoPlayerOpen || !currentMediaFile || !videoRef.current) return;

        const playerElement = document.createElement('video-js');
        playerElement.classList.add('vjs-big-play-centered');
        videoRef.current.appendChild(playerElement);

        const player = playerRef.current = videojs(playerElement, {
            autoplay: true,
            controls: true,
            responsive: true,
            fluid: true,
            crossOrigin: 'anonymous',
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            userActions: {
                hotkeys: true
            },
            sources: [{
                src: `/api/stream/${currentMediaFile.id}`,
                type: 'video/mp4'
            }]
        }, () => {
            console.log('Video.js player ready');

            // Resume position
            const savedTime = localStorage.getItem(`vid_progress_${currentMediaFile.id}`);
            if (savedTime) {
                const time = parseFloat(savedTime);
                if (time > 1) {
                    player.currentTime(time);
                }
            }

            // Fetch and add tracks
            fetchTracks(currentMediaFile.id).then(metadata => {
                if (metadata) {
                    // Add subtitles
                    if (metadata.subtitle) {
                        metadata.subtitle.forEach((track: any) => {
                            player.addRemoteTextTrack({
                                kind: 'subtitles',
                                label: `${track.label} (${track.language})`,
                                srclang: track.language,
                                src: `/api/subtitles/${currentMediaFile.id}/${track.index}`
                            }, false);
                        });
                    }
                }
            });
        });

        player.on('timeupdate', () => {
            if (currentMediaFile) {
                const time = player.currentTime();
                if (time !== undefined) {
                    localStorage.setItem(`vid_progress_${currentMediaFile.id}`, time.toString());
                }
            }
        });

        player.on('ended', () => {
            if (currentMediaFile) {
                localStorage.removeItem(`vid_progress_${currentMediaFile.id}`);
            }
        });

        return () => {
            if (player) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [videoPlayerOpen, currentMediaFile, fetchTracks]);

    // Cleanup on close
    useEffect(() => {
        if (!videoPlayerOpen) {
            setTracks(null);
            setCurrentAudioTrack(null);
            setShowAudioMenu(false);
        }
    }, [videoPlayerOpen]);

    if (!videoPlayerOpen || !currentMediaFile) return null;

    const handleClose = () => {
        setVideoPlayerOpen(false);
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.error(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleDownload = () => window.open(`/api/download/${currentMediaFile.id}`, '_blank');

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[110] bg-gradient-to-b from-black/80 to-transparent p-6 flex items-center justify-between pointer-events-none transition-opacity duration-300">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <h3 className="font-medium truncate max-w-[500px] drop-shadow-md text-lg">{currentMediaFile.name}</h3>
                </div>
                <div className="flex items-center gap-3 pointer-events-auto">
                    {/* Audio Track Selector */}
                    {tracks?.audio && tracks.audio.length > 1 && (
                        <div className="relative" ref={audioMenuRef}>
                            <button
                                onClick={() => setShowAudioMenu(!showAudioMenu)}
                                className={`p-2.5 backdrop-blur-md rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border ${showAudioMenu ? 'text-primary bg-white/20 border-primary/50' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white hover:scale-105'}`}
                                title="Audio Tracks"
                            >
                                <Music className="h-5 w-5" />
                            </button>

                            {showAudioMenu && (
                                <div className="absolute top-full right-0 mt-2 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[200px] z-[120]">
                                    <div className="px-4 py-2 text-xs font-semibold text-neutral-400 border-b border-white/5 uppercase tracking-wider">
                                        Select Audio Track
                                    </div>
                                    {tracks.audio.map((track) => (
                                        <button
                                            key={track.index}
                                            onClick={() => changeAudioTrack(track.index)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 flex items-center justify-between group transition-colors ${currentAudioTrack === track.index || (currentAudioTrack === null && track.index === tracks.audio[0].index) ? 'text-orange-500 bg-orange-500/5' : 'text-neutral-300'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{track.label}</span>
                                                <span className="text-[10px] text-neutral-500 uppercase">{track.language} • {track.codec}</span>
                                            </div>
                                            {(currentAudioTrack === track.index || (currentAudioTrack === null && track.index === tracks.audio[0].index)) && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button onClick={handleDownload} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" title="Download">
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setAspectRatio(prev => prev === 'contain' ? 'cover' : 'contain')}
                        className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                        title="Toggle Aspect Ratio"
                    >
                        {aspectRatio === 'contain' ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </button>
                    <button onClick={handleClose} className="p-2.5 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md border border-red-500/30 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" title="Close (Esc)">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 flex items-center justify-center relative bg-black">
                <div
                    ref={videoRef}
                    className="w-full h-full flex items-center justify-center"
                    style={{
                        objectFit: aspectRatio === 'cover' ? 'cover' : 'contain',
                    }}
                    data-vjs-player
                />
            </div>

            {/* Custom CSS to handle aspect ratio on the video element inside Video.js */}
            <style jsx global>{`
                .video-js video {
                    object-fit: ${aspectRatio === 'cover' ? 'cover' : 'contain'} !important;
                }
                .vjs-control-bar {
                    z-index: 30 !important;
                }
            `}</style>
        </div>
    );
}
