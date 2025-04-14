/**
 * URL validation utilities for YouTube URLs
 * Contains functions to validate and extract information from YouTube URLs
 */

/**
 * Validates if a URL is a valid YouTube URL
 * Supports standard youtube.com, youtu.be short links, and embedded URLs
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;
  
  // Regex for different YouTube URL formats
  const standardPattern = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=([a-zA-Z0-9_-]{11}))(?:\S+)?$/;
  const shortPattern = /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\S*)?$/;
  const embedPattern = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\S*)?$/;
  const livePattern = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\S*)?$/;
  
  return standardPattern.test(url) || 
         shortPattern.test(url) || 
         embedPattern.test(url) ||
         livePattern.test(url);
}

/**
 * Extracts the YouTube video ID from a valid YouTube URL
 * Returns null if the URL is invalid or the ID can't be extracted
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Array of regex patterns with capture groups for the video ID
  const patterns = [
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=([a-zA-Z0-9_-]{11}))(?:\S+)?$/,
    /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\S*)?$/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\S*)?$/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\S*)?$/
  ];
  
  // Try each pattern until we find a match
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Validates that a string is a valid YouTube video ID
 * A valid ID is 11 characters long and contains only alphanumeric characters, underscores, or hyphens
 */
export function isValidYouTubeVideoId(id: string): boolean {
  if (!id) return false;
  
  const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  return videoIdPattern.test(id);
}

/**
 * Constructs a standard YouTube watch URL from a video ID
 */
export function constructYouTubeUrl(videoId: string): string {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }
  
  return `https://www.youtube.com/watch?v=${videoId}`;
} 