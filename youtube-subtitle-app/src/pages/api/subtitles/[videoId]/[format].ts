/* @flow */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSubtitles, SubtitleEntry } from '../../../../utils/subtitleFetcher';

type SubtitleContentResponse = {
  videoId: string;
  language?: string;
  format?: string;
  entries: SubtitleEntry[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubtitleContentResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      videoId: '',
      entries: [],
      error: 'Method not allowed',
    });
  }

  const { videoId, format, lang } = req.query;
  
  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({
      videoId: '',
      entries: [],
      error: 'Invalid video ID',
    });
  }

  const language = typeof lang === 'string' ? lang : 'en';
  const subtitleFormat = typeof format === 'string' ? format : undefined;

  try {
    const entries = await getSubtitles({ videoID: videoId, lang: language });
    
    return res.status(200).json({
      videoId,
      language,
      format: subtitleFormat,
      entries,
    });
  } catch (error: any) {
    console.error('Error fetching subtitles:', error);
    return res.status(500).json({
      videoId,
      entries: [],
      error: error.message || 'Failed to fetch subtitles',
    });
  }
} 