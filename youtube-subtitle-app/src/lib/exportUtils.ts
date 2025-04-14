import { jsPDF } from 'jspdf';
import { getSubtitles } from './subtitles';
import { getVideoDetails } from './youtube';
import { formatTime } from '../utils/formatTime';

interface SubtitleLine {
  start: string;
  dur: string;
  text: string;
  formattedStart?: string;
}

/**
 * Format subtitle lines for text export
 * @param lines Subtitle lines to format
 * @param includeHeader Whether to include video title and metadata as header
 * @param videoTitle Optional video title to include in header
 */
export function formatSubtitlesAsText(
  lines: SubtitleLine[],
  includeHeader: boolean = true,
  videoTitle?: string
): string {
  let output = '';

  // Add header with video title if provided
  if (includeHeader && videoTitle) {
    output += `Title: ${videoTitle}\n`;
    output += `Exported: ${new Date().toISOString().split('T')[0]}\n`;
    output += `Number of subtitles: ${lines.length}\n\n`;
  }

  // Add each subtitle line with timestamp and text
  lines.forEach((line, index) => {
    const startTime = formatTime(parseFloat(line.start));
    output += `[${startTime}] ${line.text}\n`;
  });

  return output;
}

/**
 * Generate a PDF document from subtitle lines
 * @param lines Subtitle lines to include in the PDF
 * @param videoTitle Optional video title to use as document title
 */
export function generateSubtitlesPDF(
  lines: SubtitleLine[],
  videoTitle?: string
): jsPDF {
  // Initialize PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set metadata
  if (videoTitle) {
    pdf.setProperties({
      title: `Subtitles for ${videoTitle}`,
      subject: 'YouTube Video Subtitles',
      creator: 'YouTube Subtitle Timeline Generator',
      author: 'YouTube Subtitle Timeline Generator'
    });
  }

  // Set title
  pdf.setFontSize(16);
  pdf.text(videoTitle || 'Video Subtitles', 15, 15);
  
  // Add export date
  pdf.setFontSize(10);
  pdf.text(`Exported: ${new Date().toLocaleString()}`, 15, 22);
  pdf.text(`Number of subtitles: ${lines.length}`, 15, 27);
  
  // Add horizontal line
  pdf.line(15, 30, 195, 30);
  
  // Add subtitles
  pdf.setFontSize(11);
  let yPosition = 40;
  const pageHeight = pdf.internal.pageSize.height - 20; // Leave margin at bottom
  
  lines.forEach((line, index) => {
    const startTime = formatTime(parseFloat(line.start));
    const text = `[${startTime}] ${line.text}`;
    
    // Check if we need a new page
    if (yPosition > pageHeight) {
      pdf.addPage();
      yPosition = 20; // Reset position for new page
    }
    
    // Split long lines
    const textLines = pdf.splitTextToSize(text, 180);
    pdf.text(textLines, 15, yPosition);
    yPosition += 7 * textLines.length; // Increase y position based on number of lines
  });
  
  return pdf;
}

/**
 * Fetch subtitles for a video and export them in the requested format
 */
export async function exportSubtitles(videoId: string, lang: string, format: string) {
  try {
    // Get video details
    const videoDetails = await getVideoDetails(videoId);
    
    if (!videoDetails) {
      throw new Error('Video details not found');
    }
    
    // Get subtitles
    const subtitleLines = await getSubtitles({
      videoID: videoId,
      lang: lang
    });
    
    if (!subtitleLines || subtitleLines.length === 0) {
      throw new Error(`No ${lang} subtitles found for this video`);
    }
    
    // Export based on format
    if (format.toLowerCase() === 'txt') {
      return {
        content: formatSubtitlesAsText(subtitleLines, true, videoDetails.title),
        mimeType: 'text/plain',
        filename: `${videoId}_${lang}_subtitles.txt`
      };
    } else if (format.toLowerCase() === 'pdf') {
      const pdf = generateSubtitlesPDF(subtitleLines, videoDetails.title);
      return {
        content: pdf.output('arraybuffer'),
        mimeType: 'application/pdf',
        filename: `${videoId}_${lang}_subtitles.pdf`
      };
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
} 