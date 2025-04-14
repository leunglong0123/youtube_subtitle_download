import axios from 'axios';

/**
 * Interface representing a subtitle language option
 */
export interface SubtitleLanguage {
  code: string;
  name: string;
}

/**
 * Interface for video and subtitle metadata
 */
export interface SubtitleMetadata {
  videoId: string;
  title: string;
  languages: SubtitleLanguage[];
}

/**
 * Interface for API responses
 */
interface ApiResponse {
  videoId?: string;
  title?: string;
  languages?: SubtitleLanguage[];
  error?: string;
}

/**
 * Error class for subtitle format fetching errors
 */
export class SubtitleFormatError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'SubtitleFormatError';
    this.statusCode = statusCode;
  }
}

/**
 * Fetch available subtitle formats/languages for a video
 * @param videoId YouTube video ID
 * @returns Promise resolving to subtitle metadata including available languages
 * @throws SubtitleFormatError if the fetch fails
 */
export async function fetchSubtitleFormats(videoId: string): Promise<SubtitleMetadata> {
  try {
    const response = await axios.get<ApiResponse>(`/api/subtitles/${videoId}`);
    
    if (response.data.error) {
      throw new SubtitleFormatError(response.data.error);
    }
    
    if (!response.data.videoId || !response.data.title || !response.data.languages) {
      throw new SubtitleFormatError('Invalid response format from API');
    }
    
    return {
      videoId: response.data.videoId,
      title: response.data.title,
      languages: response.data.languages
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.error || 'Failed to fetch subtitle formats';
      throw new SubtitleFormatError(errorMessage, statusCode);
    }
    
    throw new SubtitleFormatError('An unexpected error occurred while fetching subtitle formats');
  }
}

/**
 * Simple in-memory cache for subtitle formats
 */
const formatsCache = new Map<string, {
  data: SubtitleMetadata;
  timestamp: number;
}>();

/**
 * Cache time-to-live in milliseconds (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Fetch subtitle formats with caching to avoid redundant API calls
 * @param videoId YouTube video ID
 * @returns Promise resolving to subtitle metadata
 */
export async function fetchSubtitleFormatsWithCache(videoId: string): Promise<SubtitleMetadata> {
  const now = Date.now();
  const cachedData = formatsCache.get(videoId);
  
  // Return cached data if valid
  if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.data;
  }
  
  // Fetch fresh data
  const data = await fetchSubtitleFormats(videoId);
  
  // Cache the result
  formatsCache.set(videoId, {
    data,
    timestamp: now
  });
  
  return data;
} 