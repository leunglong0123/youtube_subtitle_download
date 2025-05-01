import React from 'react';

interface SummaryDisplayProps {
  summary: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  // Split the summary into sections
  const sections = summary.split('###').filter(Boolean);
  
  const getSectionContent = (title: string) => {
    const section = sections.find(s => s.trim().startsWith(title));
    return section ? section.replace(title, '').trim() : '';
  };

  const summaryContent = getSectionContent('Summary');
  const analogyContent = getSectionContent('Analogy');
  const notesContent = getSectionContent('Notes');
  const keywordsContent = getSectionContent('Keywords');

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-2">
        <h3 className="text-2xl font-semibold mt-0">Summary</h3>
        <p className="text-gray-700 leading-relaxed">{summaryContent}</p>
      </div>

      {/* Analogy Section */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-2">
        <h3 className="text-2xl font-semibold mt-0">Analogy</h3>
        <p className="text-gray-700 leading-relaxed">{analogyContent}</p>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-2">
        <h3 className="text-2xl font-semibold mt-0">Key Points</h3>
        <ul className="space-y-3">
          {notesContent.split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map((note, index) => {
              // Parse note to extract emoji and text
              const matches = note.match(/- \[(.*?)\] (.*)/);
              if (!matches) return null;
              
              const [, emoji, text] = matches;
              
              return (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-gray-700 leading-relaxed">{text}</span>
                </li>
              );
            })}
        </ul>
      </div>

      {/* Keywords Section */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-2">
        <h3 className="text-2xl font-semibold mt-0">Keywords & Terms</h3>
        <div className="space-y-4">
          {keywordsContent.split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map((keyword, index) => {
              const parts = keyword.replace('- ', '').split(':');
              if (parts.length < 2) return null;
              
              const term = parts[0];
              const explanation = parts.slice(1).join(':');
              
              return (
                <div key={index} className="border-l-4 border-gray-200 pl-4">
                  <p className="font-medium text-gray-900">{term.trim()}</p>
                  <p className="text-gray-700 leading-relaxed">{explanation?.trim()}</p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SummaryDisplay; 