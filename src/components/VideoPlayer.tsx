'use client';

import { X, Download, Volume2, VolumeX, Maximize, Minimize, Captions, Music, AlertTriangle, Type } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useEffect, useRef, useState, useCallback } from 'react';

// Type for audio track
interface AudioTrackInfo {
    index: number;
    label: string;
    language: string;
    enabled: boolean;
}

// Type for subtitle track
interface SubtitleTrackInfo {
    index: number;
    label: string;
    language: string;
    kind: string;
    mode: TextTrackMode;
}

export default function VideoPlayer() {
    const { videoPlayerOpen, setVideoPlayerOpen, currentMediaFile } = useUIStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // States
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover'>('contain');
    const [hasResumed, setHasResumed] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);

    // Audio track states
    const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([]);
    const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [audioTracksSupported, setAudioTracksSupported] = useState<boolean | null>(null);

    // Subtitle track states
    const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrackInfo[]>([]);
    const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState<number>(-1); // -1 = off
    const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const subtitleInputRef = useRef<HTMLInputElement>(null);
    const audioMenuRef = useRef<HTMLDivElement>(null);
    const subtitleMenuRef = useRef<HTMLDivElement>(null);

    // Detect embedded subtitle tracks
    const detectSubtitleTracks = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const textTrackList = video.textTracks;
        console.log(`Detected ${textTrackList.length} text tracks`);

        if (textTrackList.length > 0) {
            const tracks: SubtitleTrackInfo[] = [];
            let activeTrackIndex = -1;

            for (let i = 0; i < textTrackList.length; i++) {
                const track = textTrackList[i];
                // Only include subtitle/caption tracks
                if (track.kind === 'subtitles' || track.kind === 'captions' || track.kind === 'metadata') {
                    tracks.push({
                        index: i,
                        label: track.label || `Track ${i + 1}`,
                        language: track.language || 'unknown',
                        kind: track.kind,
                        mode: track.mode,
                    });
                    if (track.mode === 'showing') {
                        activeTrackIndex = i;
                    }
                }
            }

            setSubtitleTracks(tracks);
            setCurrentSubtitleTrack(activeTrackIndex);

            if (tracks.length > 0) {
                console.log(`Found ${tracks.length} subtitle/caption tracks`);
            }
        }
    }, []);

    // Switch subtitle track
    const switchSubtitleTrack = useCallback((trackIndex: number) => {
        const video = videoRef.current;
        if (!video) return;

        const textTrackList = video.textTracks;

        // Turn off all tracks first
        for (let i = 0; i < textTrackList.length; i++) {
            textTrackList[i].mode = 'disabled';
        }

        // Enable selected track if not -1 (off)
        if (trackIndex >= 0 && trackIndex < textTrackList.length) {
            textTrackList[trackIndex].mode = 'showing';
            setCurrentSubtitleTrack(trackIndex);
            console.log(`Switched to subtitle track ${trackIndex}`);
        } else {
            setCurrentSubtitleTrack(-1);
            console.log('Subtitles turned off');
        }

        setShowSubtitleMenu(false);
    }, []);

    // Audio Track Detection - with retry mechanism
    const detectAudioTracks = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        // Check if audioTracks API is available
        const videoWithAudio = video as HTMLVideoElement & { audioTracks?: AudioTrackList };

        if (!videoWithAudio.audioTracks) {
            console.log('audioTracks API not available in this browser');
            setAudioTracksSupported(false);
            return;
        }

        setAudioTracksSupported(true);
        const audioTrackList = videoWithAudio.audioTracks;

        console.log(`Detected ${audioTrackList.length} audio tracks`);

        if (audioTrackList.length > 0) {
            const tracks: AudioTrackInfo[] = [];
            for (let i = 0; i < audioTrackList.length; i++) {
                const track = audioTrackList[i] as AudioTrack & { enabled: boolean };
                tracks.push({
                    index: i,
                    label: track.label || `Audio Track ${i + 1}`,
                    language: track.language || 'unknown',
                    enabled: track.enabled,
                });
                if (track.enabled) {
                    setCurrentAudioTrack(i);
                }
            }
            setAudioTracks(tracks);
        }

        // Listen for audio track changes
        const handleChange = () => {
            console.log('Audio track change detected');
            detectAudioTracks();
        };

        audioTrackList.addEventListener('change', handleChange);
        audioTrackList.addEventListener('addtrack', handleChange);
        audioTrackList.addEventListener('removetrack', handleChange);

        return () => {
            audioTrackList.removeEventListener('change', handleChange);
            audioTrackList.removeEventListener('addtrack', handleChange);
            audioTrackList.removeEventListener('removetrack', handleChange);
        };
    }, []);

    // Switch audio track
    const switchAudioTrack = useCallback((trackIndex: number) => {
        const video = videoRef.current;
        if (!video) return;

        const videoWithAudio = video as HTMLVideoElement & { audioTracks?: AudioTrackList };
        if (!videoWithAudio.audioTracks) return;

        const audioTrackList = videoWithAudio.audioTracks;
        if (trackIndex >= 0 && trackIndex < audioTrackList.length) {
            // Disable all tracks, then enable the selected one
            for (let i = 0; i < audioTrackList.length; i++) {
                (audioTrackList[i] as AudioTrack & { enabled: boolean }).enabled = (i === trackIndex);
            }
            setCurrentAudioTrack(trackIndex);

            // Update local state
            setAudioTracks(prev => prev.map((track, i) => ({
                ...track,
                enabled: i === trackIndex
            })));

            console.log(`Switched to audio track ${trackIndex}`);
        }
        setShowAudioMenu(false);
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!videoPlayerOpen) return;

            // Define keys that interact with the player to reset controls timer
            const interactiveKeys = [' ', 'k', 'm', 'f', 'o', 'c', 'a', 's', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (interactiveKeys.includes(e.key)) {
                handleMouseMove();
            }

            if (e.key === 'Escape') {
                if (isFullscreen) {
                    toggleFullscreen();
                } else {
                    handleClose();
                }
            } else if (e.key === ' ' || e.key === 'k') {
                e.preventDefault();
                togglePlayPause();
            } else if (e.key === 'm') {
                toggleMute();
            } else if (e.key === 'f') {
                toggleFullscreen();
            } else if (e.key === 'o') {
                setAspectRatio('contain');
            } else if (e.key === 'c') {
                setAspectRatio('cover');
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (videoRef.current) {
                    const seekTime = e.ctrlKey ? 50 : 10;
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seekTime);
                }
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (videoRef.current) {
                    const seekTime = e.ctrlKey ? 50 : 10;
                    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + seekTime);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (videoRef.current) {
                    const newVol = Math.min(1, videoRef.current.volume + 0.1);
                    videoRef.current.volume = newVol;
                    setVolume(newVol);
                    setIsMuted(newVol === 0);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (videoRef.current) {
                    const newVol = Math.max(0, videoRef.current.volume - 0.1);
                    videoRef.current.volume = newVol;
                    setVolume(newVol);
                    setIsMuted(newVol === 0);
                }
            } else if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                if (audioTracks.length > 1) {
                    const nextTrack = (currentAudioTrack + 1) % audioTracks.length;
                    switchAudioTrack(nextTrack);
                }
            } else if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                // Cycle through subtitles: off -> track 0 -> track 1 -> ... -> off
                if (subtitleTracks.length > 0) {
                    const nextTrack = currentSubtitleTrack === -1 ? 0 :
                        currentSubtitleTrack + 1 >= subtitleTracks.length ? -1 :
                            currentSubtitleTrack + 1;
                    switchSubtitleTrack(nextTrack);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [videoPlayerOpen, isFullscreen, isPlaying, isMuted, aspectRatio, audioTracks, currentAudioTrack, switchAudioTrack, subtitleTracks, currentSubtitleTrack, switchSubtitleTrack]);

    // Subtitle Upload Handler
    const handleSubtitleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            let content = event.target?.result as string;

            // Basic SRT to VTT conversion
            if (file.name.endsWith('.srt')) {
                content = 'WEBVTT\n\n' + content
                    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
            }

            const blob = new Blob([content], { type: 'text/vtt' });
            const url = URL.createObjectURL(blob);
            setSubtitleUrl(url);

            if (videoRef.current) {
                const oldTracks = videoRef.current.querySelectorAll('track');
                oldTracks.forEach(t => t.remove());

                const track = document.createElement('track');
                track.kind = 'captions';
                track.label = file.name.replace(/\.(srt|vtt)$/i, '');
                track.srclang = 'en';
                track.src = url;
                track.default = true;
                videoRef.current.appendChild(track);

                // Wait for track to load then enable it
                track.addEventListener('load', () => {
                    if (videoRef.current && videoRef.current.textTracks[0]) {
                        videoRef.current.textTracks[0].mode = 'showing';
                    }
                    // Re-detect subtitle tracks
                    setTimeout(() => detectSubtitleTracks(), 100);
                });
            }
        };
        reader.readAsText(file);
    };

    // Auto-hide Controls Logic
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false);
        }
    };

    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        } else {
            handleMouseMove();
        }
    }, [isPlaying]);

    // Video Event Listeners & Resume
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (currentMediaFile) {
                localStorage.setItem(`vid_progress_${currentMediaFile.id}`, video.currentTime.toString());
            }
        };

        const handleMetadata = () => {
            setDuration(video.duration);

            // Detect audio tracks when metadata loads
            detectAudioTracks();
            // Detect subtitle tracks
            detectSubtitleTracks();

            if (currentMediaFile && !hasResumed) {
                const savedTime = localStorage.getItem(`vid_progress_${currentMediaFile.id}`);
                if (savedTime) {
                    const time = parseFloat(savedTime);
                    if (time > 1 && time < video.duration - 5) {
                        video.currentTime = time;
                        setCurrentTime(time);
                    }
                }
                setHasResumed(true);
            }
        };

        const handleCanPlay = () => {
            // Retry track detection when video is ready to play
            detectAudioTracks();
            detectSubtitleTracks();
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setShowControls(true);
            if (currentMediaFile) {
                localStorage.removeItem(`vid_progress_${currentMediaFile.id}`);
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        // Listen for text track changes
        const handleTextTrackChange = () => {
            detectSubtitleTracks();
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.textTracks.addEventListener('change', handleTextTrackChange);
        video.textTracks.addEventListener('addtrack', handleTextTrackChange);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleMetadata);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.textTracks.removeEventListener('change', handleTextTrackChange);
            video.textTracks.removeEventListener('addtrack', handleTextTrackChange);
        };
    }, [currentMediaFile, hasResumed, detectAudioTracks, detectSubtitleTracks]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (audioMenuRef.current && !audioMenuRef.current.contains(e.target as Node)) {
                setShowAudioMenu(false);
            }
            if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(e.target as Node)) {
                setShowSubtitleMenu(false);
            }
        };

        if (showAudioMenu || showSubtitleMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAudioMenu, showSubtitleMenu]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (subtitleUrl) URL.revokeObjectURL(subtitleUrl);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [subtitleUrl]);

    // Reset state when player closes
    useEffect(() => {
        if (!videoPlayerOpen) {
            setAudioTracks([]);
            setCurrentAudioTrack(0);
            setAudioTracksSupported(null);
            setSubtitleTracks([]);
            setCurrentSubtitleTrack(-1);
            setHasResumed(false);
            setSubtitleUrl(null);
        }
    }, [videoPlayerOpen]);

    if (!videoPlayerOpen || !currentMediaFile) return null;

    // Handlers
    const handleClose = () => {
        if (videoRef.current) videoRef.current.pause();
        setVideoPlayerOpen(false);
        setIsPlaying(false);
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
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

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            setVolume(vol);
            setIsMuted(vol === 0);
        }
    };

    const handleDownload = () => window.open(`/api/download/${currentMediaFile.id}`, '_blank');

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden ${!showControls && isPlaying ? 'cursor-none' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Header */}
            <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="font-medium truncate max-w-[50%] drop-shadow-md">{currentMediaFile.name}</h3>
                        {audioTracks.length > 1 && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                {audioTracks.length} Audio
                            </span>
                        )}
                        {subtitleTracks.length > 0 && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                {subtitleTracks.length} Subs
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownload} className="p-2 hover:bg-white/10 rounded-full" title="Download">
                            <Download className="h-5 w-5" />
                        </button>
                        <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full" title="Close (Esc)">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 flex items-center justify-center relative" onClick={togglePlayPause}>
                <video
                    ref={videoRef}
                    src={`/api/stream/${currentMediaFile.id}`}
                    style={{ objectFit: aspectRatio }}
                    className="w-full h-full shadow-2xl"
                    autoPlay
                    crossOrigin="anonymous"
                />
            </div>

            {/* Controls Bar */}
            <div className={`absolute bottom-0 w-full bg-[#1a1a1a]/95 backdrop-blur border-t border-white/5 px-4 py-2 flex flex-col gap-1 z-20 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                {/* Seek Bar */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono w-[45px] text-right text-gray-300">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                    />
                    <span className="text-xs font-mono w-[45px] text-gray-300">{formatTime(duration)}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between mt-1">
                    {/* Left: Play/Stop */}
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlayPause} className="hover:text-orange-500 transition-colors" title={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
                            )}
                        </button>
                        <button onClick={handleClose} className="text-gray-300 hover:text-white" title="Stop">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                        </button>
                    </div>

                    {/* Right: Tools */}
                    <div className="flex items-center gap-3">
                        {/* Subtitle Track Selector */}
                        {subtitleTracks.length > 0 ? (
                            <div className="relative" ref={subtitleMenuRef}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSubtitleMenu(!showSubtitleMenu);
                                        setShowAudioMenu(false);
                                    }}
                                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border border-white/20 hover:bg-white/10 ${currentSubtitleTrack >= 0 ? 'text-blue-400 border-blue-500/50' : 'text-gray-300'}`}
                                    title="Subtitles (S)"
                                >
                                    <Type className="h-4 w-4" />
                                    <span>{currentSubtitleTrack >= 0 ? `Sub ${currentSubtitleTrack + 1}` : 'Subs'}</span>
                                </button>

                                {/* Subtitle Track Dropdown */}
                                {showSubtitleMenu && (
                                    <div
                                        className="absolute bottom-full mb-2 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[220px]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="text-xs font-semibold text-gray-400 px-3 py-2 border-b border-white/10">
                                            Select Subtitle Track
                                        </div>
                                        {/* Off option */}
                                        <button
                                            onClick={() => switchSubtitleTrack(-1)}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2 ${currentSubtitleTrack === -1 ? 'text-blue-400 bg-blue-500/10' : 'text-gray-200'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${currentSubtitleTrack === -1 ? 'bg-blue-400' : 'bg-gray-600'}`} />
                                            <span>Off</span>
                                        </button>
                                        {/* Track options */}
                                        {subtitleTracks.map((track) => (
                                            <button
                                                key={track.index}
                                                onClick={() => switchSubtitleTrack(track.index)}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2 ${currentSubtitleTrack === track.index ? 'text-blue-400 bg-blue-500/10' : 'text-gray-200'
                                                    }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${currentSubtitleTrack === track.index ? 'bg-blue-400' : 'bg-gray-600'}`} />
                                                <span>{track.label}</span>
                                                <span className="text-xs text-gray-500 ml-auto capitalize">{track.kind}</span>
                                                {track.language && track.language !== 'unknown' && (
                                                    <span className="text-xs text-gray-500 uppercase">{track.language}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Upload Subtitle Button when no embedded subs */
                            <>
                                <input
                                    type="file"
                                    accept=".vtt,.srt"
                                    className="hidden"
                                    ref={subtitleInputRef}
                                    onChange={handleSubtitleUpload}
                                />
                                <button
                                    onClick={() => subtitleInputRef.current?.click()}
                                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border border-white/20 hover:bg-white/10 ${subtitleUrl ? 'text-blue-400 border-blue-500/50' : 'text-gray-300'}`}
                                    title="Upload Subtitles"
                                >
                                    <Captions className="h-4 w-4" />
                                    <span>CC</span>
                                </button>
                            </>
                        )}

                        {/* Audio Track Selector */}
                        {audioTracks.length > 1 ? (
                            <div className="relative" ref={audioMenuRef}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAudioMenu(!showAudioMenu);
                                        setShowSubtitleMenu(false);
                                    }}
                                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border border-white/20 hover:bg-white/10 ${showAudioMenu ? 'text-orange-500 border-orange-500/50' : 'text-gray-300'}`}
                                    title="Audio Track (A)"
                                >
                                    <Music className="h-4 w-4" />
                                    <span>Audio ({currentAudioTrack + 1}/{audioTracks.length})</span>
                                </button>

                                {/* Audio Track Dropdown */}
                                {showAudioMenu && (
                                    <div
                                        className="absolute bottom-full mb-2 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[200px]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="text-xs font-semibold text-gray-400 px-3 py-2 border-b border-white/10">
                                            Select Audio Track
                                        </div>
                                        {audioTracks.map((track, index) => (
                                            <button
                                                key={index}
                                                onClick={() => switchAudioTrack(index)}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2 ${currentAudioTrack === index ? 'text-orange-500 bg-orange-500/10' : 'text-gray-200'
                                                    }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${currentAudioTrack === index ? 'bg-orange-500' : 'bg-gray-600'}`} />
                                                <span>{track.label}</span>
                                                {track.language && track.language !== 'unknown' && (
                                                    <span className="text-xs text-gray-500 ml-auto uppercase">{track.language}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : audioTracksSupported === false ? (
                            <div className="relative group">
                                <button
                                    className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border border-yellow-500/30 text-yellow-500/70 cursor-help"
                                    title="Audio track switching not supported"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Audio N/A</span>
                                </button>
                                <div className="absolute bottom-full mb-2 right-0 bg-black/90 border border-white/10 rounded-lg p-3 text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <p className="text-yellow-400 font-medium mb-1">Audio track switching unavailable</p>
                                    <p className="text-gray-400">
                                        Your browser doesn&apos;t support the audioTracks API. Try Chrome/Edge with
                                        <code className="bg-white/10 px-1 rounded mx-1">chrome://flags/#enable-experimental-web-platform-features</code>
                                        enabled.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        <button
                            onClick={() => setAspectRatio(prev => prev === 'contain' ? 'cover' : 'contain')}
                            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded hover:bg-white/10 text-gray-300 hover:text-white"
                            title="Toggle Aspect Ratio"
                        >
                            {aspectRatio === 'contain' ? (
                                <> <Minimize className="h-4 w-4" /> Fit </>
                            ) : (
                                <> <Maximize className="h-4 w-4" /> Crop </>
                            )}
                        </button>

                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="text-gray-300 hover:text-white">
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/vol:w-20 transition-all duration-300 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>

                        <button onClick={toggleFullscreen} className="text-gray-300 hover:text-white">
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* On-screen Hints */}
            <div className={`absolute bottom-28 right-4 text-white/50 text-xs bg-black/60 px-2 py-1 rounded pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                Space: Play • Arrows: Seek/Vol • O/C: Fit/Crop{subtitleTracks.length > 0 ? ' • S: Subs' : ''}{audioTracks.length > 1 ? ' • A: Audio' : ''}
            </div>
        </div>
    );
}
