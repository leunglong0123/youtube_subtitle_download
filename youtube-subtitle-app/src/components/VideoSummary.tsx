import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import Button from './ui/Button';
import * as Select from '@radix-ui/react-select';
import { toast } from 'sonner';
import { ErrorType, createError, AppError } from '../utils/errorUtils';

interface VideoSummaryProps {
  videoId: string;
  onAddToTimeline?: (summary: string) => void;
}

type SummaryLength = 'short' | 'medium' | 'long';

const VideoSummary: React.FC<VideoSummaryProps> = ({ videoId, onAddToTimeline }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [characterCount, setCharacterCount] = useState<number>(0);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId,
            length: summaryLength,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch summary');
        }

        const data = await response.json();
        setSummary(data.summary);
        setCharacterCount(data.characterCount || 0);
      } catch (err) {
        setError(createError(
          'Failed to fetch video summary',
          ErrorType.API,
          undefined,
          true
        ));
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchSummary();
    }
  }, [videoId, summaryLength]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };

  const handleAddToTimeline = () => {
    if (onAddToTimeline) {
      onAddToTimeline(summary);
      toast.success('Summary added to timeline');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => setError(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select.Root value={summaryLength} onValueChange={(value) => setSummaryLength(value as SummaryLength)}>
          <Select.Trigger className="w-[180px]">
            <Select.Value placeholder="Select length" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="short">Short</Select.Item>
            <Select.Item value="medium">Medium</Select.Item>
            <Select.Item value="long">Long</Select.Item>
          </Select.Content>
        </Select.Root>
        <div className="text-sm text-gray-500">
          Characters: {characterCount}
        </div>
      </div>
      <div className="prose max-w-none">
        {summary}
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="medium" onClick={handleCopyToClipboard}>
          Copy to Clipboard
        </Button>
        {onAddToTimeline && (
          <Button variant="secondary" size="medium" onClick={handleAddToTimeline}>
            Add to Timeline
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoSummary; 