interface SRTSubtitle {
  id: number;
  startTime: number; // in milliseconds
  endTime: number;   // in milliseconds
  text: string;
}

/**
 * Parses SRT subtitle format content
 * @param content - The SRT file content as a string
 * @returns An array of parsed subtitles with id, start/end times in ms, and text
 */
export function parseSRT(content: string): SRTSubtitle[] {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid SRT content: Content must be a non-empty string');
  }

  // Normalize line endings and split by double newline (subtitle separator)
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const subtitleBlocks = normalizedContent.split('\n\n').filter(block => block.trim());

  const subtitles: SRTSubtitle[] = [];

  for (const block of subtitleBlocks) {
    const lines = block.split('\n').filter(line => line.trim());
    
    if (lines.length < 3) {
      // Invalid block format, skip this block
      continue;
    }

    // The first line should be the subtitle ID
    const idMatch = /^\d+$/.exec(lines[0]);
    if (!idMatch) {
      continue; // Skip if no valid ID
    }
    const id = parseInt(lines[0], 10);

    // The second line should contain the timestamp
    const timeMatch = /^(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})$/.exec(lines[1]);
    if (!timeMatch) {
      continue; // Skip if timestamp format is invalid
    }

    // Extract hours, minutes, seconds, and milliseconds
    const startHours = parseInt(timeMatch[1], 10);
    const startMinutes = parseInt(timeMatch[2], 10);
    const startSeconds = parseInt(timeMatch[3], 10);
    const startMilliseconds = parseInt(timeMatch[4], 10);
    
    const endHours = parseInt(timeMatch[5], 10);
    const endMinutes = parseInt(timeMatch[6], 10);
    const endSeconds = parseInt(timeMatch[7], 10);
    const endMilliseconds = parseInt(timeMatch[8], 10);
    
    // Convert to milliseconds
    const startTime = (startHours * 3600000) + (startMinutes * 60000) + (startSeconds * 1000) + startMilliseconds;
    const endTime = (endHours * 3600000) + (endMinutes * 60000) + (endSeconds * 1000) + endMilliseconds;

    // The remaining lines form the subtitle text
    const text = lines.slice(2).join('\n');

    subtitles.push({
      id,
      startTime,
      endTime,
      text,
    });
  }

  return subtitles;
}

/**
 * Converts SRT subtitle object array to SRT formatted string
 * @param subtitles - Array of SRT subtitle objects
 * @returns SRT formatted string content
 */
export function formatSRT(subtitles: SRTSubtitle[]): string {
  if (!Array.isArray(subtitles)) {
    throw new Error('Invalid subtitles: Must be an array of subtitle objects');
  }

  return subtitles.map((subtitle, index) => {
    // Format ID (use index + 1 to ensure sequential numbering)
    const id = subtitle.id || (index + 1);
    
    // Convert milliseconds to SRT timestamp format
    const startTime = formatTimestamp(subtitle.startTime);
    const endTime = formatTimestamp(subtitle.endTime);
    
    // Put it all together in SRT format
    return `${id}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
  }).join('\n');
}

/**
 * Helper function to convert milliseconds to SRT timestamp format (00:00:00,000)
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
  
  // Format as 00:00:00,000
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)},${padZero(milliseconds, 3)}`;
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