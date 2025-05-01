import React from 'react';
import { useSubtitleSelection } from '../lib/useSubtitleSelection';
import LoadingSpinner from './LoadingSpinner';

interface SubtitleFormatSelectionProps {
  videoId: string;
  onFormatSelected: (languageCode: string) => void;
  initialFormat?: string;
  className?: string;
  showTitle?: boolean;
}

/**
 * Component for displaying and selecting available subtitle formats/languages
 */
const SubtitleFormatSelection: React.FC<SubtitleFormatSelectionProps> = ({
  videoId,
  onFormatSelected,
  initialFormat,
  className = '',
  showTitle = true
}) => {
  const {
    loading,
    error,
    metadata,
    selectedFormat,
    setSelectedFormat,
    isValid
  } = useSubtitleSelection(videoId, initialFormat);

  // Update parent component when selection changes
  React.useEffect(() => {
    if (isValid && selectedFormat) {
      onFormatSelected(selectedFormat);
    }
  }, [selectedFormat, isValid, onFormatSelected]);

  // Handle format selection change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFormat(e.target.value);
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <LoadingSpinner text="Loading available subtitles..." size="small" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-red-600 ${className}`}>
        <p>{error}</p>
      </div>
    );
  }

  if (!metadata || metadata.languages.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <p className="text-gray-600">No subtitles available for this video</p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Select Subtitle Language</h3>
          <p className="text-sm text-gray-600 mb-2">
            {metadata.languages.length === 1 
              ? 'Only one subtitle language is available:' 
              : `${metadata.languages.length} subtitle languages available:`
            }
          </p>
        </div>
      )}
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="subtitle-language-select" className="sr-only">
          Select subtitle language
        </label>
        <select
          id="subtitle-language-select"
          value={selectedFormat}
          onChange={handleFormatChange}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          aria-label="Select subtitle language"
        >
          <option value="" disabled>
            Select a language
          </option>
          {metadata.languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>
        
        {selectedFormat && (
          <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-sm">
            Selected language: {metadata.languages.find(l => l.code === selectedFormat)?.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleFormatSelection; 