import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactPlayer from 'react-player/youtube';

export interface YouTubePlayerProps {
  videoId: string;
  onProgress?: (playedSeconds: number) => void;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export interface YouTubePlayerRef {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, onProgress, onReady, onPlay, onPause, className }, ref) => {
    const playerRef = useRef<ReactPlayer>(null);
    const [currentTime, setCurrentTime] = useState(0);

    // Expose methods to parent components through the ref
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (playerRef.current) {
          playerRef.current.seekTo(seconds, 'seconds');
        }
      },
      play: () => {
        if (playerRef.current) {
          playerRef.current.getInternalPlayer().playVideo();
        }
      },
      pause: () => {
        if (playerRef.current) {
          playerRef.current.getInternalPlayer().pauseVideo();
        }
      },
      getCurrentTime: () => currentTime
    }));

    const handleProgress = (state: { playedSeconds: number }) => {
      setCurrentTime(state.playedSeconds);
      if (onProgress) {
        onProgress(state.playedSeconds);
      }
    };

    const handleReady = () => {
      if (onReady) {
        onReady();
      }
    };

    return (
      <div className={className}>
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          controls
          playing={false}
          onReady={handleReady}
          onPlay={onPlay}
          onPause={onPause}
          onProgress={handleProgress}
          progressInterval={500}
          config={{
            playerVars: {
              autoplay: 0,
              modestbranding: 1,
              rel: 0
            }
          }}
        />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer; 