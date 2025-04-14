/**
 * Format seconds into a MM:SS display
 * 
 * @param seconds - The number of seconds to format
 * @returns Formatted time string in the format "MM:SS" or "HH:MM:SS" for times >= 1 hour
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '0:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Format seconds into a friendly display with hours, minutes, seconds
 * 
 * @param seconds - The number of seconds to format
 * @returns Formatted time string, e.g. "2 hours 15 minutes 30 seconds"
 */
export function formatTimeLong(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '0 seconds';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
  }
  
  return parts.join(' ');
} 