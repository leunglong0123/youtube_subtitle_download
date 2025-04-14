import he from 'he';
import axios from 'axios';
import { find } from 'lodash';
import striptags from 'striptags';

interface SubtitleOptions {
  videoID: string;
  lang?: string;
}

interface SubtitleLine {
  start: string;
  dur: string;
  text: string;
}

const fetchData = async function (url: string): Promise<string> {
  const { data } = await axios.get(url);
  return typeof data === 'string' ? data : JSON.stringify(data);
};

/**
 * Extract subtitles directly from a YouTube video
 * @param options - Object containing videoID and optional language
 * @returns Array of subtitle lines with start time, duration, and text
 */
export async function getSubtitles({
  videoID,
  lang = 'en',
}: SubtitleOptions): Promise<SubtitleLine[]> {
  try {
    const data = await fetchData(
      `https://youtube.com/watch?v=${videoID}`
    );

    // Ensure we have access to captions data
    if (!data.includes('captionTracks'))
      throw new Error(`Could not find captions for video: ${videoID}`);

    const regex = /"captionTracks":(\[.*?\])/;
    const match = regex.exec(data);
    
    if (!match || !match[1]) 
      throw new Error(`Could not parse caption tracks for video: ${videoID}`);

    const { captionTracks } = JSON.parse(`{"captionTracks":${match[1]}}`);
    
    const subtitle =
      find(captionTracks, {
        vssId: `.${lang}`,
      }) ||
      find(captionTracks, {
        vssId: `a.${lang}`,
      }) ||
      find(captionTracks, ({ vssId }: { vssId: string }) => vssId && vssId.match(`.${lang}`));

    // Ensure we have found the correct subtitle lang
    if (!subtitle || (subtitle && !subtitle.baseUrl))
      throw new Error(`Could not find ${lang} captions for ${videoID}`);

    const transcript = await fetchData(subtitle.baseUrl);
    const lines = transcript
      .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
      .replace('</transcript>', '')
      .split('</text>')
      .filter(line => line && line.trim())
      .map(line => {
        const startRegex = /start="([\d.]+)"/;
        const durRegex = /dur="([\d.]+)"/;

        const startMatch = startRegex.exec(line);
        const durMatch = durRegex.exec(line);
        
        if (!startMatch || !durMatch) {
          return null;
        }

        const start = startMatch[1];
        const dur = durMatch[1];

        const htmlText = line
          .replace(/<text.+>/, '')
          .replace(/&amp;/gi, '&')
          .replace(/<\/?[^>]+(>|$)/g, '');

        const decodedText = he.decode(htmlText);
        const text = striptags(decodedText);

        return {
          start,
          dur,
          text,
        };
      })
      .filter(Boolean) as SubtitleLine[];

    return lines;
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    throw error;
  }
}

/**
 * Get available subtitle languages for a video
 * @param videoID - YouTube video ID
 * @returns Array of available language codes
 */
export async function getAvailableSubtitleLanguages(videoID: string): Promise<string[]> {
  try {
    const data = await fetchData(
      `https://youtube.com/watch?v=${videoID}`
    );

    // Ensure we have access to captions data
    if (!data.includes('captionTracks'))
      return [];

    const regex = /"captionTracks":(\[.*?\])/;
    const match = regex.exec(data);
    
    if (!match || !match[1]) 
      return [];

    const { captionTracks } = JSON.parse(`{"captionTracks":${match[1]}}`);
    
    return captionTracks.map((track: any) => {
      const vssId = track.vssId || '';
      // Extract language code from vssId (e.g. ".en" -> "en" or "a.en" -> "en")
      const match = vssId.match(/\.([a-z]{2}(-[A-Z]{2})?)/);
      return match ? match[1] : null;
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching subtitle languages:', error);
    return [];
  }
} 