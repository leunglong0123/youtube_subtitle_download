import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

type SummaryRequest = {
  videoId: string;
  language?: string;
  length?: 'short' | 'medium' | 'long';
};

type SummaryResponse = {
  videoId: string;
  summary: string;
  characterCount?: number;
  error?: string;
};

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Define word limits for different summary lengths
const SUMMARY_LENGTHS = {
  short: 100,
  medium: 200,
  long: 400,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummaryResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      videoId: '',
      summary: '',
      error: 'Method not allowed',
    });
  }

  try {
    const { videoId, language = 'en', length = 'medium' } = req.body as SummaryRequest;

    if (!videoId) {
      return res.status(400).json({
        videoId: '',
        summary: '',
        error: 'Video ID is required',
      });
    }

    // First, fetch the subtitles
    const subtitleResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/subtitles/${videoId}/${language}`
    );

    if (!subtitleResponse.ok) {
      throw new Error('Failed to fetch subtitles');
    }

    const subtitleData = await subtitleResponse.json();

    if (!subtitleData.entries || subtitleData.entries.length === 0) {
      return res.status(404).json({
        videoId,
        summary: '',
        error: 'No subtitles found for this video',
      });
    }

    // Combine all subtitle text into a single string
    const fullText = subtitleData.entries
      .map((entry: any) => entry.text)
      .join(' ');

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a prompt for summarization based on the requested length
    const wordLimit = SUMMARY_LENGTHS[length];
    const prompt = `Please provide a ${length} summary of the following video transcript. Focus on the main points and key takeaways. Keep the summary under ${wordLimit} words.

Transcript:
${fullText}

Summary:`;

    // Generate the summary
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Calculate character count
    const characterCount = summary.length;

    return res.status(200).json({
      videoId,
      summary,
      characterCount,
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      videoId: req.body.videoId || '',
      summary: '',
      error: error.message || 'Failed to generate summary',
    });
  }
} 