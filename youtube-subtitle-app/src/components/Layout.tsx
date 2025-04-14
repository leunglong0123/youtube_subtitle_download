import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from './ui';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title = 'YouTube Subtitle Timeline' }: LayoutProps) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Extract and view YouTube video subtitles in a timeline format" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold">
                  YouTube Subtitle Timeline
                </span>
              </Link>
            </div>
            <nav className="flex gap-6">
              <div className={router.pathname === '/' ? 'bg-black rounded-3xl' : ''}>
                <Link href="/" className="block px-4 py-2">
                  <span className={`text-lg font-medium ${router.pathname === '/' ? 'text-white' : ''}`}>
                    Home
                  </span>
                </Link>
              </div>
              <div className={router.pathname === '/about' ? 'bg-black rounded-3xl' : ''}>
                <Link href="/about" className="block px-4 py-2">
                  <span className={`text-lg font-medium ${router.pathname === '/about' ? 'text-white' : ''}`}>
                    About
                  </span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Container className="py-6">
          {children}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Layout; 