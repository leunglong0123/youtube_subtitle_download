import React, { useState, useEffect, useRef } from 'react';
import styles from './Timeline.module.css';
import TimelineMarker from './TimelineMarker';
import TimelineControls from './TimelineControls';

export interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface TimelineProps {
  subtitles: Subtitle[];
  videoDuration: number;
  onMarkerClick?: (startTime: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  subtitles,
  videoDuration,
  onMarkerClick
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(-1);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // Update current time based on playback
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(prev => {
        // Stop at the end of the video
        if (prev >= videoDuration) {
          setIsPlaying(false);
          return videoDuration;
        }
        return prev + 0.1; // Update every 100ms
      });
      animationRef.current = requestAnimationFrame(updateTime);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateTime);
    } else {
      cancelAnimationFrame(animationRef.current);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, videoDuration]);

  // Update active marker index based on current time
  useEffect(() => {
    const index = subtitles.findIndex(
      sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    setActiveMarkerIndex(index);
  }, [currentTime, subtitles]);

  // Playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBackward = () => {
    setCurrentTime(prev => Math.max(0, prev - 10));
    if (onMarkerClick) {
      const nearestSubtitle = findNearestSubtitle(currentTime - 10);
      if (nearestSubtitle) {
        onMarkerClick(nearestSubtitle.startTime);
      }
    }
  };

  const handleSkipForward = () => {
    setCurrentTime(prev => Math.min(videoDuration, prev + 10));
    if (onMarkerClick) {
      const nearestSubtitle = findNearestSubtitle(currentTime + 10);
      if (nearestSubtitle) {
        onMarkerClick(nearestSubtitle.startTime);
      }
    }
  };

  const handlePreviousMarker = () => {
    if (subtitles.length === 0) return;
    
    let prevIndex;
    if (activeMarkerIndex > 0) {
      prevIndex = activeMarkerIndex - 1;
    } else {
      prevIndex = subtitles.length - 1; // Wrap to the last marker
    }
    
    const prevMarker = subtitles[prevIndex];
    setCurrentTime(prevMarker.startTime);
    if (onMarkerClick) {
      onMarkerClick(prevMarker.startTime);
    }
  };

  const handleNextMarker = () => {
    if (subtitles.length === 0) return;
    
    let nextIndex;
    if (activeMarkerIndex < subtitles.length - 1 && activeMarkerIndex !== -1) {
      nextIndex = activeMarkerIndex + 1;
    } else {
      nextIndex = 0; // Wrap to the first marker
    }
    
    const nextMarker = subtitles[nextIndex];
    setCurrentTime(nextMarker.startTime);
    if (onMarkerClick) {
      onMarkerClick(nextMarker.startTime);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (onMarkerClick) {
      const nearestSubtitle = findNearestSubtitle(time);
      if (nearestSubtitle) {
        onMarkerClick(nearestSubtitle.startTime);
      }
    }
  };

  // Find nearest subtitle to a given time
  const findNearestSubtitle = (time: number): Subtitle | null => {
    if (!subtitles.length) return null;
    
    // First check if we're in a subtitle
    const current = subtitles.find(
      sub => time >= sub.startTime && time <= sub.endTime
    );
    if (current) return current;
    
    // Otherwise find the closest upcoming subtitle
    const upcoming = subtitles
      .filter(sub => sub.startTime > time)
      .sort((a, b) => a.startTime - b.startTime)[0];
    
    return upcoming || null;
  };

  // Timeline click handler for seeking
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newTime = percentage * videoDuration;
    
    setCurrentTime(newTime);
    
    if (onMarkerClick) {
      const nearestSubtitle = findNearestSubtitle(newTime);
      if (nearestSubtitle) {
        onMarkerClick(nearestSubtitle.startTime);
      }
    }
  };

  // Timeline drag handling
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickPosition / rect.width));
    const newTime = percentage * videoDuration;
    
    setCurrentTime(newTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Calculate playhead position as percentage
  const playheadPosition = (currentTime / videoDuration) * 100;

  return (
    <div className={styles['timeline-container']}>
      <div 
        className={styles['timeline']}
        ref={timelineRef}
        onClick={handleTimelineClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Subtitle markers */}
        {subtitles.map(subtitle => (
          <TimelineMarker
            key={subtitle.id}
            startTime={subtitle.startTime}
            endTime={subtitle.endTime}
            text={subtitle.text}
            totalDuration={videoDuration}
            onClick={() => onMarkerClick && onMarkerClick(subtitle.startTime)}
          />
        ))}
        
        {/* Playhead */}
        <div 
          className={styles['playhead']}
          style={{ left: `${playheadPosition}%` }}
        />
      </div>
      
      <TimelineControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onSkipBackward={handleSkipBackward}
        onSkipForward={handleSkipForward}
        currentTime={currentTime}
        duration={videoDuration}
        activeMarkerIndex={activeMarkerIndex}
        totalMarkers={subtitles.length}
        onPreviousMarker={handlePreviousMarker}
        onNextMarker={handleNextMarker}
        onSeek={handleSeek}
      />
    </div>
  );
};

export default Timeline; 