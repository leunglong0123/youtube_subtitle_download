interface VTTSubtitle {
  id?: string;
  startTime: number; // in milliseconds
  endTime: number;   // in milliseconds
  text: string;
  settings?: string; // optional cue settings
}

/**
 * Parses WebVTT subtitle format content
 * @param content - The VTT file content as a string
 * @returns An array of parsed subtitles with start/end times in ms and text
 */
export function parseVTT(content: string): VTTSubtitle[] {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid VTT content: Content must be a non-empty string');
  }

  // Normalize line endings
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split content into lines
  const lines = normalizedContent.split('\n');
  
  // Check for WebVTT header
  if (!lines[0].trim().match(/^WEBVTT/)) {
    throw new Error('Invalid VTT format: Missing WEBVTT header');
  }
  
  const subtitles: VTTSubtitle[] = [];
  let currentSubtitle: Partial<VTTSubtitle> | null = null;
  let isSubtitleText = false;
  let subtitleText: string[] = [];
  
  // Start from line 1 to skip the WEBVTT header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines or comments
    if (!line || line.startsWith('NOTE ')) {
      // If we were processing a subtitle, add it
      if (currentSubtitle && isSubtitleText) {
        currentSubtitle.text = subtitleText.join('\n').trim();
        subtitles.push(currentSubtitle as VTTSubtitle);
        currentSubtitle = null;
        isSubtitleText = false;
        subtitleText = [];
      }
      continue;
    }
    
    // Check for timestamp line
    const timeMatch = /^((?:\d+:)?\d{2}:\d{2}\.\d{3}) --> ((?:\d+:)?\d{2}:\d{2}\.\d{3})(?: (.+))?$/.exec(line);
    
    if (timeMatch) {
      // If we were processing a subtitle, add it
      if (currentSubtitle && isSubtitleText) {
        currentSubtitle.text = subtitleText.join('\n').trim();
        subtitles.push(currentSubtitle as VTTSubtitle);
        subtitleText = [];
      }
      
      // Start a new subtitle
      currentSubtitle = {
        startTime: parseTimestamp(timeMatch[1]),
        endTime: parseTimestamp(timeMatch[2]),
      };
      
      // Extract optional cue settings
      if (timeMatch[3]) {
        currentSubtitle.settings = timeMatch[3];
      }
      
      isSubtitleText = true;
    } 
    // Check for cue identifier (comes before timestamp)
    else if (!isSubtitleText && currentSubtitle === null) {
      // This might be a cue identifier/ID if it's not a timestamp
      // Since we'll see the timestamp in the next line, just store this as potential ID
      currentSubtitle = { id: line };
    }
    // If we're in the text part of a subtitle
    else if (isSubtitleText) {
      subtitleText.push(line);
    }
  }
  
  // Don't forget to add the last subtitle if there is one
  if (currentSubtitle && isSubtitleText) {
    currentSubtitle.text = subtitleText.join('\n').trim();
    subtitles.push(currentSubtitle as VTTSubtitle);
  }
  
  return subtitles;
}

/**
 * Parse VTT timestamp format to milliseconds
 * @param timestamp - VTT format timestamp (00:00:00.000 or 00:00.000)
 * @returns Time in milliseconds
 */
function parseTimestamp(timestamp: string): number {
  // VTT can have either hh:mm:ss.ms or mm:ss.ms format
  const parts = timestamp.split(':');
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let milliseconds = 0;
  
  if (parts.length === 3) {
    // hh:mm:ss.ms format
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    const secondParts = parts[2].split('.');
    seconds = parseInt(secondParts[0], 10);
    milliseconds = parseInt(secondParts[1], 10);
  } else if (parts.length === 2) {
    // mm:ss.ms format
    minutes = parseInt(parts[0], 10);
    const secondParts = parts[1].split('.');
    seconds = parseInt(secondParts[0], 10);
    milliseconds = parseInt(secondParts[1], 10);
  } else {
    throw new Error(`Invalid timestamp format: ${timestamp}`);
  }
  
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
}

/**
 * Converts VTT subtitle object array to WebVTT formatted string
 * @param subtitles - Array of VTT subtitle objects
 * @returns WebVTT formatted string content
 */
export function formatVTT(subtitles: VTTSubtitle[]): string {
  if (!Array.isArray(subtitles)) {
    throw new Error('Invalid subtitles: Must be an array of subtitle objects');
  }
  
  // Start with the WebVTT header
  let output = 'WEBVTT\n\n';
  
  output += subtitles.map(subtitle => {
    let cue = '';
    
    // Add optional cue identifier
    if (subtitle.id) {
      cue += `${subtitle.id}\n`;
    }
    
    // Add timestamp line with optional settings
    const startTime = formatTimestamp(subtitle.startTime);
    const endTime = formatTimestamp(subtitle.endTime);
    cue += `${startTime} --> ${endTime}`;
    
    if (subtitle.settings) {
      cue += ` ${subtitle.settings}`;
    }
    
    // Add the subtitle text
    cue += `\n${subtitle.text}`;
    
    return cue;
  }).join('\n\n');
  
  return output;
}

/**
 * Helper function to convert milliseconds to WebVTT timestamp format (00:00:00.000)
 * @param ms - Time in milliseconds 
 * @returns Formatted timestamp string
 */
function formatTimestamp(ms: number): string {
  if (isNaN(ms) || ms < 0) {
    throw new Error('Invalid timestamp: Must be a non-negative number');
  }
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  
  // Format as 00:00:00.000
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds, 3)}`;
  } else {
    // VTT allows omitting hours when 0
    return `${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds, 3)}`;
  }
}

/**
 * Helper function to pad numbers with leading zeros
 * @param num - Number to pad
 * @param length - Total length after padding (default: 2)
 * @returns Padded number string
 */
function padZero(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0');
} 