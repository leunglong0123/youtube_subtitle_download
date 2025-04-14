import React, { useState, useEffect } from 'react';
import { Input } from './ui';
import { isValidYouTubeUrl, extractYouTubeVideoId } from '../utils/urlValidation';

interface YouTubeUrlInputProps {
  onUrlValidated: (videoId: string) => void;
  onError: (error: string) => void;
  className?: string;
  initialUrl?: string;
}

/**
 * Component for inputting and validating YouTube URLs
 */
const YouTubeUrlInput: React.FC<YouTubeUrlInputProps> = ({
  onUrlValidated,
  onError,
  className = '',
  initialUrl = ''
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate URL when it changes
  useEffect(() => {
    const validateUrl = async () => {
      if (!url.trim()) {
        setError(null);
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        // First check if it's a valid YouTube URL format
        if (!isValidYouTubeUrl(url)) {
          throw new Error('Please enter a valid YouTube URL');
        }

        // Extract video ID
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
          throw new Error('Could not extract video ID from URL');
        }

        // URL is valid, notify parent
        onUrlValidated(videoId);
      } catch (err: any) {
        setError(err.message);
        onError(err.message);
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(validateUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [url, onUrlValidated, onError]);

  return (
    <div className={className}>
      <Input
        label="YouTube URL"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        error={error || undefined}
        disabled={isValidating}
      />
      
      {isValidating && (
        <p className="text-sm text-gray-500 mt-1">Validating URL...</p>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Supported URL Formats:</p>
        <ul className="space-y-1">
          <li>• Standard: https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
          <li>• Shortened: https://youtu.be/dQw4w9WgXcQ</li>
          <li>• With timestamp: https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s</li>
        </ul>
      </div>
    </div>
  );
};

export default YouTubeUrlInput; 