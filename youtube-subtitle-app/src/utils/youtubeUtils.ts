/**
 * Extracts the YouTube video ID from various URL formats
 * Supports standard youtube.com, shortened youtu.be, and embedded URLs
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  // Standard YouTube URL: https://www.youtube.com/watch?v=videoId
  // Shortened URL: https://youtu.be/videoId
  // Embedded URL: https://www.youtube.com/embed/videoId
  // With timestamp: https://www.youtube.com/watch?v=videoId&t=123s
  
  const patterns = [
    // Standard YouTube URL
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/,
    // Shortened YouTube URL
    /youtu\.be\/([^?&]+)/,
    // Embedded YouTube URL
    /youtube\.com\/embed\/([^?&]+)/,
    // YouTube playlist item
    /youtube\.com\/watch\?v=([^&]+)&list=/,
    /youtube\.com\/playlist\?list=.+&v=([^&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Formats seconds into a human-readable timestamp (MM:SS or HH:MM:SS)
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Converts a timestamp string (MM:SS or HH:MM:SS) to seconds
 */
export function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
} 