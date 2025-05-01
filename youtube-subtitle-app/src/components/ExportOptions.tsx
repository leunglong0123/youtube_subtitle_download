import React, { useState } from 'react';

interface ExportOptionsProps {
  videoId: string;
  language: string;
  className?: string;
}

/**
 * Component for selecting and initiating subtitle exports
 */
const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  videoId, 
  language,
  className = ''
}) => {
  const [format, setFormat] = useState<string>('txt');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available export formats
  const formats = [
    { id: 'txt', name: 'Plain Text (TXT)', description: 'Simple text file with timestamps and subtitles' },
    { id: 'pdf', name: 'PDF Document', description: 'Formatted PDF with video title and subtitles' }
  ];

  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value);
  };

  const handleExport = () => {
    if (!videoId || !language) {
      setError('Video ID and language are required for export');
      return;
    }

    // Reset error state
    setError(null);
    setIsExporting(true);

    try {
      // For downloading files, we redirect to the API endpoint
      // This will trigger browser's file download
      const exportUrl = `/api/export/${videoId}/${format}?lang=${language}`;
      
      // Open in a new tab/window to avoid navigation away from the current page
      window.open(exportUrl, '_blank');
    } catch (err) {
      setError('Failed to initiate export');
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border border-gray-200 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Export Subtitles</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Export the subtitles in your preferred format
        </p>
        
        <div className="space-y-3">
          {formats.map((formatOption) => (
            <label 
              key={formatOption.id}
              className="flex items-start p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="export-format"
                value={formatOption.id}
                checked={format === formatOption.id}
                onChange={handleFormatChange}
                className="mt-0.5 mr-3"
              />
              <div>
                <div className="font-medium">{formatOption.name}</div>
                <div className="text-sm text-gray-600">{formatOption.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
          isExporting 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isExporting ? 'Preparing Export...' : `Export as ${format.toUpperCase()}`}
      </button>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>
          The export includes all available subtitles with timestamps for video ID: <span className="font-mono">{videoId}</span>
        </p>
        <p className="mt-1">
          Language: {language}
        </p>
      </div>
    </div>
  );
};

export default ExportOptions; 