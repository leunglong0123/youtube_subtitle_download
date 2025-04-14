import React from 'react';
import styles from './Timeline.module.css';
import { formatTime } from '../../utils/formatTime';

interface TimelineMarkerProps {
  startTime: number;
  endTime: number;
  text: string;
  totalDuration: number;
  onClick: () => void;
  isActive?: boolean;
}

const TimelineMarker: React.FC<TimelineMarkerProps> = ({
  startTime,
  endTime,
  text,
  totalDuration,
  onClick,
  isActive = false
}) => {
  // Calculate position and width percentages
  const startPercent = (startTime / totalDuration) * 100;
  const endPercent = (endTime / totalDuration) * 100;
  const widthPercent = endPercent - startPercent;
  
  // Create a truncated version of the text for display
  const truncatedText = text.length > 25 ? `${text.substring(0, 25)}...` : text;
  
  // Format time for tooltip display
  const timeLabel = formatTime(startTime);
  
  return (
    <div
      className={`${styles['timeline-marker']} ${isActive ? styles.active : ''}`}
      style={{
        left: `${startPercent}%`,
        width: `${widthPercent}%`
      }}
      onClick={onClick}
      title={`${timeLabel} - ${text}`}
      data-start-time={startTime}
      role="button"
      aria-label={`Go to ${timeLabel}: ${text}`}
    >
      <div className={styles['marker-label']}>
        {timeLabel}
      </div>
      
      {/* Visual feedback pulse animation when active */}
      {isActive && (
        <div className={styles.pulseEffect} />
      )}
    </div>
  );
};

export default TimelineMarker; 