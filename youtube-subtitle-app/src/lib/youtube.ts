/**
 * Fetches details about a YouTube video using the YouTube Data API
 * @param videoId - The YouTube video ID
 * @returns Video details or null if not found
 */
export async function getVideoDetails(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items[0]?.snippet || null;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

/**
 * Checks if a video has available captions/subtitles
 * @param videoId - The YouTube video ID
 * @returns Boolean indicating if captions are available
 */
export async function checkCaptionsAvailability(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube Captions API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items && data.items.length > 0;
  } catch (error) {
    console.error('Error checking captions availability:', error);
    throw error;
  }
}

/**
 * Gets available caption tracks for a video
 * @param videoId - The YouTube video ID
 * @returns Array of available caption tracks
 */
export async function getAvailableCaptions(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube Captions API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching available captions:', error);
    throw error;
  }
} 