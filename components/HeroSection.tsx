import React, { useState, useEffect } from 'react';
import { PaperCard, PaperBadge } from './PaperComponents';
import { Terminal, ArrowRight, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const MorphingSeparator: React.FC = () => {
  return (
    <div className="inline-flex items-center justify-center mx-3 h-6 align-middle relative top-1 text-ink">
      <svg width="12" height="24" viewBox="0 0 12 24" className="overflow-visible">
        <path
          d="M 6 0 L 6 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "> Querying system parameters...";

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
        setTypedText(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) {
             clearInterval(intervalId);
             // Restart loop after delay
             setTimeout(() => {
                 setTypedText('');
                 index = 0;
             }, 3000);
        }
    }, 50);

    // Better loop implementation
    const loop = () => {
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            setTypedText(fullText.slice(0, charIndex + 1));
            charIndex++;
            if (charIndex === fullText.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    setTypedText('');
                    loop();
                }, 3000);
            }
        }, 50);
        return typeInterval;
    };
    
    // Clear initial interval and start loop
    clearInterval(intervalId);
    const loopId = loop();

    return () => clearInterval(loopId);
  }, []);

  return (
    <section className="relative pt-32 pb-24 px-4 min-h-[85vh] flex flex-col items-center justify-center">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-10 right-10 w-32 h-32 border-2 border-ink opacity-10 rotate-12"></div>
         <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full border-2 border-ink opacity-5"></div>
      </div>

      <div className="max-w-7xl w-full text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-paper border border-ink px-3 py-1 mb-8 shadow-sm">
             <Terminal className="w-4 h-4 text-accent" />
             <span className="font-mono text-xs font-bold tracking-widest text-ink">METACOGNA LABS</span>
        </div>
        
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-ink mb-8 leading-[0.9]">
          Thinking About <br/>
          <span className="bg-accent text-ink px-4 inline-block transform -rotate-1 mt-2">Thinking.</span>
        </h1>
        
        <div className="font-sans text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-5xl mx-auto leading-relaxed font-bold flex flex-wrap justify-center items-center gap-y-2">
          <MorphingSeparator />
          <span className="whitespace-nowrap">Chaos Meets Creativity</span>
          <MorphingSeparator />
          <span className="whitespace-nowrap">Abstraction Made Concrete</span>
          <MorphingSeparator />
        </div>

        <div className="mt-12 flex flex-col gap-6 items-center">
            <button 
                onClick={() => document.getElementById('how-we-work')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-block border-b-2 border-ink pb-1 font-mono text-sm text-ink hover:text-accent transition-colors font-bold tracking-wider cursor-pointer"
            >
                EXPLORE THE LAB &darr;
            </button>
        </div>
      </div>

      {/* Example Visualization Area - Kept abstract to represent "The System" */}
      <div className="w-full max-w-6xl relative z-10 grid md:grid-cols-12 gap-8 items-center opacity-90">
         
         {/* Left Side: The "Prompt" */}
         <div className="md:col-span-5 relative md:translate-x-4 z-10">
            <PaperCard className="bg-surface rotate-[-1deg] relative">
                <div className="flex items-center gap-2 border-b-2 border-ink pb-2 mb-4">
                    <div className="w-3 h-3 bg-ink rounded-full"></div>
                    <span className="font-mono text-xs ml-auto opacity-50 text-ink">query.log</span>
                </div>
                <div className="font-mono text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                    <p className="text-gray-400 dark:text-gray-500 select-none"># Why do we do this?</p>
                    <p>
                        > We are motivated by a <span className="bg-accent text-paper dark:text-ink px-2 py-1 text-lg border-b-2 border-ink font-bold inline-block transform -rotate-2 shadow-sm">quiet awe</span> of the universe.
                    </p>
                    <p className="min-h-[4.5em] animate-pulse">
                        {typedText}<span className="inline-block w-2 h-4 bg-accent ml-1 animate-ping"></span><br/>
                    </p>
                </div>
                
                {/* Connector Arrow for Desktop */}
                <div className="hidden md:flex absolute -right-10 top-1/2 -translate-y-1/2 z-20 w-20 justify-end">
                    <ArrowRight className="w-8 h-8 text-ink" />
                </div>
                {/* Connector Arrow for Mobile */}
                <div className="flex md:hidden absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 h-16 items-end pb-2">
                    <ArrowDown className="w-8 h-8 text-ink" />
                </div>
            </PaperCard>
         </div>

         {/* Right Side: The "Blueprint" (Visual Result) */}
         <div className="md:col-span-7 relative">
            <PaperCard title="System: BURSTS_OF_CLARITY_V42" className="rotate-1 min-h-[300px] bg-paper">
                <div className="space-y-6">
                    {/* Meta Data */}
                    <div className="flex flex-wrap gap-2 text-xs font-mono border-b border-gray-200 dark:border-gray-700 pb-4">
                        <PaperBadge color="gray">MODE: EXPLORATORY</PaperBadge>
                        <PaperBadge color="emerald">STATUS: ACTIVE</PaperBadge>
                    </div>

                    {/* Diagram visualization */}
                    <div className="relative p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-zinc-800/50 rounded flex justify-center items-center gap-0 min-h-[200px] overflow-hidden">
                        
                        {/* Mechanical Pusher Animation */}
                        <div className="flex items-center gap-2 relative z-10">
                             
                             {/* INPUT */}
                             <motion.div 
                                animate={{ x: [0, 5, 0], scale: [1, 0.95, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.1, 1] }}
                                className="border-2 border-ink p-4 bg-paper shadow-hard-sm text-center w-24 relative z-20"
                             >
                                <div className="font-bold font-serif text-ink">Input</div>
                                <div className="text-xs font-mono text-gray-500">Curiosity</div>
                             </motion.div>

                             {/* Piston 1 */}
                             <div className="w-12 h-2 bg-gray-300 dark:bg-gray-600 relative overflow-hidden border-y border-gray-400 dark:border-gray-500">
                                <motion.div 
                                    className="h-full bg-ink"
                                    animate={{ width: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 2, repeat: Infinity, times: [0.1, 0.3, 0.35] }}
                                />
                             </div>

                             {/* PROCESS */}
                             <motion.div 
                                animate={{ x: [0, 5, 0], backgroundColor: ["var(--color-ink)", "var(--color-accent)", "var(--color-ink)"] }}
                                transition={{ duration: 2, repeat: Infinity, times: [0.3, 0.4, 0.5] }}
                                className="border-2 border-ink p-4 bg-ink text-paper shadow-hard-sm text-center w-24 relative z-20"
                             >
                                <div className="font-bold font-serif">Process</div>
                                <div className="text-xs font-mono opacity-80">Rigor</div>
                             </motion.div>

                             {/* Piston 2 */}
                             <div className="w-12 h-2 bg-gray-300 dark:bg-gray-600 relative overflow-hidden border-y border-gray-400 dark:border-gray-500">
                                <motion.div 
                                    className="h-full bg-accent"
                                    animate={{ width: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 2, repeat: Infinity, times: [0.4, 0.6, 0.65] }}
                                />
                             </div>

                             {/* OUTPUT */}
                             <motion.div 
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 2, 0] }}
                                transition={{ duration: 2, repeat: Infinity, times: [0.6, 0.7, 1] }}
                                className="border-2 border-ink p-4 bg-paper shadow-hard-sm text-center w-24 relative z-20"
                             >
                                <div className="font-bold font-serif text-ink">Output</div>
                                <div className="text-xs font-mono text-gray-500">Clarity</div>
                             </motion.div>
                        </div>

                    </div>
                </div>
            </PaperCard>
         </div>
      </div>
    </section>
  );
};

export default HeroSection;