import Link from 'next/link';
import Head from 'next/head';
import { Button } from '../components/ui';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | YouTube Subtitle Timeline</title>
      </Head>
      
      <div className="max-w-md mx-auto text-center py-12">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </>
  );
} 