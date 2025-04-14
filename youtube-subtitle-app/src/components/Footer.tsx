import { Container } from './ui';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12">
      <Container className="text-center">
        <div className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} YouTube Subtitle Timeline Generator. All rights reserved.
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="text-gray-500 hover:text-black text-sm transition-colors">Terms of Service</a>
          <a href="#" className="text-gray-500 hover:text-black text-sm transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-500 hover:text-black text-sm transition-colors">Contact</a>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 