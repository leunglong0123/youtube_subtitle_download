import React from 'react';
import { formatTime } from '../../utils/formatTime';
import styles from './Timeline.module.css';

interface TimelineControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeMarkerIndex: number;
  totalMarkers: number;
  onPlayPause: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onPreviousMarker: () => void;
  onNextMarker: () => void;
  onSeek: (time: number) => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  activeMarkerIndex,
  totalMarkers,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  onPreviousMarker,
  onNextMarker,
  onSeek
}) => {
  // Calculate percentage for progress bar
  const progressPercentage = (currentTime / duration) * 100;
  
  // Handle progress bar clicks for seeking
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const seekTime = percentage * duration;
    onSeek(seekTime);
  };

  return (
    <div className={styles.controlsContainer}>
      {/* Progress bar */}
      <div className={styles.progressBarContainer} onClick={handleProgressBarClick}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Time indicators */}
      <div className={styles.timeDisplay}>
        <span className={styles.currentTime}>{formatTime(currentTime)}</span>
        <span className={styles.timeSeparator}> / </span>
        <span className={styles.totalTime}>{formatTime(duration)}</span>
        {activeMarkerIndex !== -1 && (
          <span className={styles.markerIndicator}>
            Marker: {activeMarkerIndex + 1}/{totalMarkers}
          </span>
        )}
      </div>

      {/* Control buttons */}
      <div className={styles.controlButtons}>
        {/* Previous marker button */}
        <button 
          className={`${styles.controlButton} ${styles.markerButton}`}
          onClick={onPreviousMarker}
          title="Previous Marker"
          aria-label="Previous Marker"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.707 7.707a1 1 0 00-1.414-1.414l-6 6a1 1 0 000 1.414l6 6a1 1 0 001.414-1.414L7.414 13H19a1 1 0 100-2H7.414l5.293-5.293z" fill="currentColor" />
          </svg>
        </button>
        
        {/* Skip backward button */}
        <button 
          className={styles.controlButton}
          onClick={onSkipBackward}
          title="Skip -10 seconds"
          aria-label="Skip backward 10 seconds"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" fill="currentColor" />
          </svg>
        </button>
        
        {/* Play/Pause button */}
        <button 
          className={`${styles.controlButton} ${styles.playPauseButton}`}
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 9v6a1 1 0 01-1 1H7a1 1 0 01-1-1V9a1 1 0 011-1h2a1 1 0 011 1zm7-1h-2a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1V9a1 1 0 00-1-1z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.307 5.307a1 1 0 00-1.414 1.414l5.657 5.657-5.657 5.657a1 1 0 101.414 1.414l6.364-6.364a1 1 0 000-1.414l-6.364-6.364z" fill="currentColor" />
            </svg>
          )}
        </button>
        
        {/* Skip forward button */}
        <button 
          className={styles.controlButton}
          onClick={onSkipForward}
          title="Skip +10 seconds"
          aria-label="Skip forward 10 seconds"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" fill="currentColor" />
          </svg>
        </button>
        
        {/* Next marker button */}
        <button 
          className={`${styles.controlButton} ${styles.markerButton}`}
          onClick={onNextMarker}
          title="Next Marker"
          aria-label="Next Marker"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.293 17.293a1 1 0 001.414 1.414l6-6a1 1 0 000-1.414l-6-6a1 1 0 00-1.414 1.414L16.586 11H5a1 1 0 100 2h11.586l-5.293 5.293z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TimelineControls; 