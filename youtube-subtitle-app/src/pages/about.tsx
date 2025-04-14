import Head from 'next/head';
import Link from 'next/link';
import { Card, Button } from '../components/ui';

export default function About() {
  return (
    <>
      <Head>
        <title>About - YouTube Subtitle Timeline Generator</title>
        <meta name="description" content="Learn more about the YouTube Subtitle Timeline Generator" />
      </Head>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About This Project</h1>
        
        <Card>
          <h2 className="text-2xl font-semibold mb-4">YouTube Subtitle Timeline Generator</h2>
          <p className="mb-4">
            This tool allows you to extract subtitles from YouTube videos and transform them into an 
            interactive, searchable timeline. It's perfect for researchers, content creators, students, 
            and anyone who needs to quickly navigate video content.
          </p>
          
          <p className="mb-4">
            With our timeline generator, you can:
          </p>
          
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Extract subtitles from any YouTube video that has them available</li>
            <li>View the entire transcript in an easy-to-read timeline format</li>
            <li>Click on any part of the transcript to jump to that exact moment in the video</li>
            <li>Search for specific words or phrases within the video</li>
            <li>Export the subtitles in different formats for your own use</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3">How It Works</h3>
          <p className="mb-6">
            Our application uses the YouTube API to access video metadata and subtitle tracks. 
            When you enter a YouTube URL, we check if the video has subtitles available, 
            extract them, and process them into a interactive timeline format.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Technology Stack</h3>
          <p className="mb-6">
            This application is built with Next.js, React, TypeScript, and Tailwind CSS. 
            It uses the YouTube Data API and YouTube Caption API to fetch video information 
            and subtitle content.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Privacy</h3>
          <p className="mb-6">
            We don't store any video content or subtitles permanently. All processing is done on-demand 
            and data is not retained between sessions. We only use the YouTube API to fetch publicly 
            available data.
          </p>
          
          <div className="flex justify-center">
            <Link href="/">
              <Button>Try It Now</Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
} 