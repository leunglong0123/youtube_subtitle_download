import { useState, useEffect, useCallback } from 'react';
import { fetchSubtitleFormatsWithCache, SubtitleMetadata, SubtitleFormatError } from './subtitleFormats';

interface SubtitleSelectionState {
  loading: boolean;
  error: string | null;
  metadata: SubtitleMetadata | null;
  selectedFormat: string;
  setSelectedFormat: (format: string) => void;
  isValid: boolean;
}

/**
 * Custom hook to manage subtitle format selection state
 * @param videoId YouTube video ID to fetch available formats for
 * @param initialFormat Optional initial format to select
 * @returns State and handlers for subtitle format selection
 */
export function useSubtitleSelection(
  videoId: string,
  initialFormat?: string
): SubtitleSelectionState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SubtitleMetadata | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>(initialFormat || '');
  const [isValid, setIsValid] = useState(false);

  // Reset state when videoId changes
  useEffect(() => {
    if (!videoId) {
      setMetadata(null);
      setLoading(false);
      setError(null);
      setSelectedFormat(initialFormat || '');
      setIsValid(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    fetchSubtitleFormatsWithCache(videoId)
      .then(data => {
        setMetadata(data);
        
        // Handle auto-selection logic
        if (data.languages.length === 1) {
          // Auto-select if only one option
          setSelectedFormat(data.languages[0].code);
          setIsValid(true);
        } else if (initialFormat && data.languages.some(lang => lang.code === initialFormat)) {
          // Use initial format if valid
          setSelectedFormat(initialFormat);
          setIsValid(true);
        } else if (data.languages.some(lang => lang.code === 'en')) {
          // Default to English if available
          setSelectedFormat('en');
          setIsValid(true);
        } else if (data.languages.length > 0) {
          // Otherwise select first available
          setSelectedFormat(data.languages[0].code);
          setIsValid(true);
        } else {
          // No options available
          setSelectedFormat('');
          setIsValid(false);
        }
      })
      .catch(err => {
        if (err instanceof SubtitleFormatError) {
          setError(err.message);
        } else {
          setError('Failed to load subtitle formats');
          console.error('Error fetching subtitle formats:', err);
        }
        setIsValid(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [videoId, initialFormat]);

  // Handle format selection change with validation
  const handleSetSelectedFormat = useCallback((format: string) => {
    setSelectedFormat(format);
    
    // Validate the selection
    if (metadata && format) {
      const isValidFormat = metadata.languages.some(lang => lang.code === format);
      setIsValid(isValidFormat);
    } else {
      setIsValid(false);
    }
  }, [metadata]);

  return {
    loading,
    error,
    metadata,
    selectedFormat,
    setSelectedFormat: handleSetSelectedFormat,
    isValid
  };
} 