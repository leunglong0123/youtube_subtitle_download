import { parseSRT } from './srt_parser';
import { parseVTT } from './vtt_parser';

/**
 * Represents a subtitle with standardized format
 */
export interface Subtitle {
  id?: string | number;
  startTime: number; // in milliseconds
  endTime: number;   // in milliseconds
  text: string;
  settings?: string; // optional for VTT cue settings
}

/**
 * Represents a time-based segment containing multiple subtitles
 */
export interface SubtitleSegment {
  startTime: number;
  endTime: number;
  subtitles: Subtitle[];
  text: string;       // Concatenated text from all subtitles in segment
}

/**
 * Supported subtitle formats
 */
export enum SubtitleFormat {
  SRT = 'srt',
  VTT = 'vtt',
  AUTO = 'auto'
}

/**
 * Options for subtitle parsing and segmentation
 */
export interface SubtitleManagerOptions {
  format?: SubtitleFormat;
  segmentDuration?: number; // in milliseconds
}

/**
 * Detects the subtitle format from content
 * @param content - Subtitle file content
 * @returns Detected format or null if unknown
 */
export function detectSubtitleFormat(content: string): SubtitleFormat | null {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const normalizedContent = content.trim();
  
  // Check for WebVTT header
  if (normalizedContent.startsWith('WEBVTT')) {
    return SubtitleFormat.VTT;
  }
  
  // Check for SRT format (numbered entries followed by timestamps)
  // This is a basic check and might not catch all SRT files
  const lines = normalizedContent.split('\n');
  if (
    lines.length > 2 && 
    /^\d+$/.test(lines[0].trim()) && 
    /\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(lines[1].trim())
  ) {
    return SubtitleFormat.SRT;
  }
  
  return null;
}

/**
 * Parse subtitles from content, automatically detecting format if not specified
 * @param content - Subtitle file content
 * @param options - Parsing options
 * @returns Array of standardized subtitle objects
 */
export function parseSubtitles(content: string, options: SubtitleManagerOptions = {}): Subtitle[] {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid subtitle content: Content must be a non-empty string');
  }
  
  // Determine format
  let format = options.format || SubtitleFormat.AUTO;
  
  if (format === SubtitleFormat.AUTO) {
    const detectedFormat = detectSubtitleFormat(content);
    if (!detectedFormat) {
      throw new Error('Could not automatically detect subtitle format');
    }
    format = detectedFormat;
  }
  
  // Parse based on format
  try {
    if (format === SubtitleFormat.SRT) {
      return parseSRT(content);
    } else if (format === SubtitleFormat.VTT) {
      return parseVTT(content);
    } else {
      throw new Error(`Unsupported subtitle format: ${format}`);
    }
  } catch (error) {
    throw new Error(`Error parsing subtitles: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Group subtitles into time-based segments
 * @param subtitles - Array of subtitle objects
 * @param segmentDuration - Duration of each segment in milliseconds (default: 60000 = 1 minute)
 * @returns Array of subtitle segments
 */
export function segmentSubtitles(subtitles: Subtitle[], segmentDuration: number = 60000): SubtitleSegment[] {
  if (!Array.isArray(subtitles) || subtitles.length === 0) {
    return [];
  }
  
  // Ensure subtitles are sorted by startTime
  const sortedSubtitles = [...subtitles].sort((a, b) => a.startTime - b.startTime);
  
  // Find the total duration of the subtitles
  const lastSubtitle = sortedSubtitles[sortedSubtitles.length - 1];
  const totalDuration = lastSubtitle.endTime;
  
  // Create segments
  const segments: SubtitleSegment[] = [];
  let currentSegmentStart = 0;
  
  while (currentSegmentStart < totalDuration) {
    const currentSegmentEnd = Math.min(currentSegmentStart + segmentDuration, totalDuration);
    
    // Find subtitles that overlap with this segment
    const segmentSubtitles = sortedSubtitles.filter(subtitle => 
      // Subtitle starts within segment
      (subtitle.startTime >= currentSegmentStart && subtitle.startTime < currentSegmentEnd) ||
      // Subtitle ends within segment
      (subtitle.endTime > currentSegmentStart && subtitle.endTime <= currentSegmentEnd) ||
      // Subtitle spans the entire segment
      (subtitle.startTime <= currentSegmentStart && subtitle.endTime >= currentSegmentEnd)
    );
    
    // Concatenate text from all subtitles in this segment
    const segmentText = segmentSubtitles
      .map(subtitle => subtitle.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    segments.push({
      startTime: currentSegmentStart,
      endTime: currentSegmentEnd,
      subtitles: segmentSubtitles,
      text: segmentText
    });
    
    currentSegmentStart = currentSegmentEnd;
  }
  
  return segments;
}

/**
 * Search for subtitles that contain specific text
 * @param subtitles - Array of subtitle objects to search within
 * @param query - Text to search for
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns Array of matching subtitles
 */
export function searchSubtitles(subtitles: Subtitle[], query: string, caseSensitive: boolean = false): Subtitle[] {
  if (!Array.isArray(subtitles) || subtitles.length === 0 || !query) {
    return [];
  }
  
  const searchTerm = caseSensitive ? query : query.toLowerCase();
  
  return subtitles.filter(subtitle => {
    const text = caseSensitive ? subtitle.text : subtitle.text.toLowerCase();
    return text.includes(searchTerm);
  });
}

/**
 * Filter subtitles by time range
 * @param subtitles - Array of subtitle objects to filter
 * @param startTime - Start time in milliseconds
 * @param endTime - End time in milliseconds
 * @returns Array of subtitles within the time range
 */
export function filterSubtitlesByTimeRange(subtitles: Subtitle[], startTime: number, endTime: number): Subtitle[] {
  if (!Array.isArray(subtitles) || subtitles.length === 0 || startTime >= endTime) {
    return [];
  }
  
  return subtitles.filter(subtitle => 
    // Subtitle starts within range
    (subtitle.startTime >= startTime && subtitle.startTime < endTime) ||
    // Subtitle ends within range
    (subtitle.endTime > startTime && subtitle.endTime <= endTime) ||
    // Subtitle spans the entire range
    (subtitle.startTime <= startTime && subtitle.endTime >= endTime)
  );
}

/**
 * Validates subtitle integrity, checking for common issues
 * @param subtitles - Array of subtitle objects to validate
 * @returns Object containing validation results
 */
export function validateSubtitles(subtitles: Subtitle[]): { 
  valid: boolean; 
  issues: { subtitle: Subtitle; issue: string }[] 
} {
  if (!Array.isArray(subtitles)) {
    return { valid: false, issues: [{ subtitle: {} as Subtitle, issue: 'Subtitles must be an array' }] };
  }
  
  const issues: { subtitle: Subtitle; issue: string }[] = [];
  
  for (const subtitle of subtitles) {
    // Check for required properties
    if (subtitle.startTime === undefined || subtitle.endTime === undefined) {
      issues.push({ subtitle, issue: 'Missing required timing information' });
    }
    
    // Check for valid time values
    if (isNaN(subtitle.startTime) || isNaN(subtitle.endTime)) {
      issues.push({ subtitle, issue: 'Invalid time values' });
    }
    
    // Check for correct time order
    if (subtitle.startTime > subtitle.endTime) {
      issues.push({ subtitle, issue: 'Start time is after end time' });
    }
    
    // Check for text content
    if (!subtitle.text || typeof subtitle.text !== 'string') {
      issues.push({ subtitle, issue: 'Missing or invalid text content' });
    }
  }
  
  // Check for overlapping subtitles
  const sortedSubtitles = [...subtitles].sort((a, b) => a.startTime - b.startTime);
  for (let i = 1; i < sortedSubtitles.length; i++) {
    const prev = sortedSubtitles[i - 1];
    const current = sortedSubtitles[i];
    
    if (prev.endTime > current.startTime) {
      issues.push({ 
        subtitle: current, 
        issue: `Overlaps with previous subtitle (ID: ${prev.id || 'unknown'})` 
      });
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
} 