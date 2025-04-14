import { useState } from 'react';
import Head from 'next/head';
import { Button, Card } from '../components/ui';
import YouTubeUrlInput from '../components/YouTubeUrlInput';
import { useRouter } from 'next/router';
import { constructYouTubeUrl } from '../utils/urlValidation';

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleUrlValidated = (id: string) => {
    setVideoId(id);
    setError('');
  };

  const handleUrlError = (errorMessage: string) => {
    setError(errorMessage);
    setVideoId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Construct a proper YouTube URL from the video ID
      const youtubeUrl = constructYouTubeUrl(videoId);
      
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate URL');
      }
      
      if (!data.hasSubtitles) {
        setError('This video does not have subtitles available.');
        setIsLoading(false);
        return;
      }
      
      // Redirect to results page
      router.push(`/results/${videoId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>YouTube Subtitle Timeline Generator</title>
        <meta name="description" content="Generate a timeline from YouTube video subtitles" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">YouTube Subtitle Timeline</h1>
        
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Generate a Subtitle Timeline</h2>
          <p className="mb-6">
            Enter a YouTube URL to extract subtitles and create a searchable timeline of the video's content.
          </p>
          
          <form onSubmit={handleSubmit}>
            <YouTubeUrlInput
              onUrlValidated={handleUrlValidated}
              onError={handleUrlError}
              className="mb-6"
            />
            
            <Button 
              type="submit" 
              disabled={isLoading || !videoId}
              fullWidth
            >
              {isLoading ? 'Processing...' : 'Generate Timeline'}
            </Button>
          </form>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Supported URL Formats</h2>
          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
            <ul className="space-y-3">
              <li className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:font-bold before:text-black">
                <span className="font-semibold mr-2">Standard:</span>
                <code className="bg-gray-200 px-2 py-1 rounded text-sm">https://www.youtube.com/watch?v=dQw4w9WgXcQ</code>
              </li>
              <li className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:font-bold before:text-black">
                <span className="font-semibold mr-2">Shortened:</span>
                <code className="bg-gray-200 px-2 py-1 rounded text-sm">https://youtu.be/dQw4w9WgXcQ</code>
              </li>
              <li className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:font-bold before:text-black">
                <span className="font-semibold mr-2">With timestamp:</span>
                <code className="bg-gray-200 px-2 py-1 rounded text-sm">https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s</code>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center rounded-full font-semibold">1</div>
              <div>
                <h3 className="text-xl font-medium mb-1">Enter YouTube URL</h3>
                <p className="text-gray-700">Paste any YouTube video URL in the input field above.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center rounded-full font-semibold">2</div>
              <div>
                <h3 className="text-xl font-medium mb-1">Extract Subtitles</h3>
                <p className="text-gray-700">Our system extracts all available subtitles from the video.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center rounded-full font-semibold">3</div>
              <div>
                <h3 className="text-xl font-medium mb-1">Generate Timeline</h3>
                <p className="text-gray-700">The subtitles are processed into a searchable, clickable timeline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 