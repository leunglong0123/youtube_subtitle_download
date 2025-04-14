/**
 * Types related to timeline functionality
 */

/**
 * Represents a marker/point on the timeline
 */
export interface TimelineMarker {
  /**
   * The timestamp in seconds
   */
  time: number;
  
  /**
   * The text content of the marker
   */
  text: string;
  
  /**
   * The formatted time string (e.g. "00:32")
   */
  formattedTime: string;
}

/**
 * Represents a subtitle entry
 */
export interface Subtitle {
  /**
   * Unique identifier for the subtitle
   */
  id: number;
  
  /**
   * Start time in seconds
   */
  startTime: number;
  
  /**
   * End time in seconds
   */
  endTime: number;
  
  /**
   * Text content of the subtitle
   */
  text: string;
} 