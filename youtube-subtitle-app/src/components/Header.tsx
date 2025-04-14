import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from './ui';

const Header = () => {
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const isAboutPage = router.pathname === '/about';

  return (
    <header className="bg-white border-b border-gray-200">
      <Container>
        <div className="flex items-center justify-between py-4 border-b border-gray-200 relative">
          <Link href="/" className="text-2xl font-bold text-black flex items-center">
            <span className="inline-block w-9 h-9 bg-black mr-3 rounded-md relative transform rotate-0 transition-transform duration-300 hover:rotate-[-10deg]">
              <span className="absolute w-4 h-4 bg-white top-4 left-1 rounded transform rotate-45"></span>
            </span>
            YouTube Subtitle Timeline
          </Link>
          
          <nav className="flex bg-gray-100 p-1 rounded-xl overflow-hidden border border-gray-200 md:flex hidden">
            <Link 
              href="/" 
              className={`text-base font-medium px-5 py-2 rounded-lg transition-all duration-200 ${
                isHomePage 
                  ? 'text-white bg-black shadow' 
                  : 'text-gray-600 hover:text-black'
              } relative`}
            >
              Home
              {isHomePage && (
                <span className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></span>
              )}
            </Link>
            <Link 
              href="/about" 
              className={`text-base font-medium px-5 py-2 rounded-lg transition-all duration-200 ${
                isAboutPage 
                  ? 'text-white bg-black shadow' 
                  : 'text-gray-600 hover:text-black'
              } relative`}
            >
              About
              {isAboutPage && (
                <span className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></span>
              )}
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
};

export default Header; 