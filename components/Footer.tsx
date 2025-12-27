import React from 'react';
import { Terminal } from 'lucide-react';

interface FooterProps {
    onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onContactClick }) => {
  return (
    <footer className="border-t-2 border-ink bg-paper py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
        <div className="flex flex-col gap-2 items-center">
          <Terminal className="w-8 h-8 text-accent mb-2" />
          <h4 className="font-serif text-3xl font-bold tracking-tighter text-ink">METACOGNA LAB</h4>
        </div>
        
        <p className="font-sans text-lg text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
          We are guided by the joy of finding things out. <br/>
          We stay because the <span className="bg-accent text-white dark:text-ink px-1 font-bold inline-block transform -rotate-1 shadow-sm">questions</span> keep getting better.
        </p>

        <div className="flex gap-6 font-mono text-sm font-bold underline decoration-1 underline-offset-4 text-ink">
            <button onClick={onContactClick} className="hover:text-accent transition-colors uppercase">Contact</button>
            <a href="https://github.com/metacogna-lab" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors uppercase">Github</a>
        </div>
        
        <div className="text-gray-400 dark:text-gray-500 font-mono text-xs pt-8">
           © {new Date().getFullYear()} Metacogna Labs. Quietly Confident. Negative Entropy as a Service.
        </div>
      </div>
    </footer>
  );
};

export default Footer;