import React, { useState, useEffect } from 'react';
import { PaperCard, PaperButton } from './PaperComponents';
import { 
    X, ChevronLeft, ChevronRight, Play, 
    ClipboardList, Layers, Eye, Puzzle, 
    Hammer, Megaphone, Lightbulb, SkipForward 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Data ---
const PHASES = [
    {
        id: 1,
        title: "Receive the Brief",
        quote: "You tell us what you think the problem is.",
        reality: "We listen carefully, take notes, and resist the urge to interrupt with ‘interesting, but…’",
        finePrint: "At this stage, we assume everyone—including us—might be wrong. That’s healthy.",
        icon: ClipboardList,
        animationType: "snap"
    },
    {
        id: 2,
        title: "Symptom vs. Disease Check (Analysis)",
        quote: "Let’s make sure the problem isn’t just a loud symptom wearing a convincing costume.",
        reality: "Separating causes from consequences. This is where 80% of projects quietly fall apart elsewhere.",
        finePrint: "No technology has been harmed yet.",
        icon: Layers,
        animationType: "peel"
    },
    {
        id: 3,
        title: "Stare at a Wall (Ideation)",
        quote: "We think much adieu about everything. Often at walls. Sometimes nothing at all.",
        reality: "Pattern-matching across domains, recalling prior failures, and letting ideas collide naturally.",
        finePrint: "This phase looks suspiciously unproductive from the outside.",
        icon: Eye,
        animationType: "float"
    },
    {
        id: 4,
        title: "Controlled Chaos (Design)",
        quote: "We sketch things that don’t obviously belong together.",
        reality: "Good ideas are interrogated until the solution is dissected enough to be bad.",
        finePrint: "Nothing here is precious. Everything is provisional.",
        icon: Puzzle,
        animationType: "chaos"
    },
    {
        id: 5,
        title: "Make It Real Enough to Break (Product Design & Vision)",
        quote: "We build something just real enough to argue with.",
        reality: "Prototyping, pressure-testing assumptions, and discovering what the idea forgot to include.",
        finePrint: "This is where reality gets a vote.",
        icon: Hammer,
        animationType: "overshoot"
    },
    {
        id: 6,
        title: "Try to Explain, Fail, and Explain Better (Marketing)",
        quote: "We attempt to explain the thing. We fail. We try again.",
        reality: "Finding the simplest honest story to explain the growing confusion and derivative solutions.",
        finePrint: "If we can’t explain it clearly, it’s not done.",
        icon: Megaphone,
        animationType: "blur"
    },
    {
        id: 7,
        title: "You leave with 3.1415x less stress, 42x more confused clarity and an understanding of paradox",
        quote: "You now understand the problem better—even if the answer isn’t final.",
        reality: "The weight is lighter, the 42 new \"brain ticklers\" as the ol' euphemism goes are not.",
        finePrint: "Happiness not guaranteed. Insight very likely.",
        icon: Lightbulb,
        animationType: "glow"
    }
];

// --- Animation Components ---

const PhaseVisual: React.FC<{ type: string; Icon: any }> = ({ type, Icon }) => {
    switch (type) {
        case 'snap':
            return (
                <motion.div 
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="p-8 bg-surface border-2 border-ink rounded-lg"
                >
                    <Icon className="w-16 h-16 text-ink" />
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.3 }}
                        className="h-1 bg-accent mt-4"
                    />
                </motion.div>
            );
        case 'peel':
            return (
                <div className="relative">
                    <motion.div 
                        initial={{ x: 0, opacity: 1 }}
                        animate={{ x: 40, opacity: 0.5, rotate: 10 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute inset-0 bg-gray-300 dark:bg-gray-700 border-2 border-ink rounded-lg z-10"
                    />
                    <div className="p-8 bg-paper border-2 border-ink rounded-lg relative z-0">
                        <Icon className="w-16 h-16 text-accent" />
                    </div>
                </div>
            );
        case 'float':
            return (
                <motion.div 
                    animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="p-8 bg-surface border-2 border-dashed border-ink rounded-full"
                >
                    <Icon className="w-16 h-16 text-ink" />
                </motion.div>
            );
        case 'chaos':
            return (
                <div className="relative w-32 h-32">
                    <motion.div 
                        initial={{ x: -50, y: -50, rotate: -45, opacity: 0 }}
                        animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring" }}
                        className="absolute top-0 left-0 p-2 bg-accent border border-ink"
                    >
                        <div className="w-8 h-8 bg-paper" />
                    </motion.div>
                    <motion.div 
                        initial={{ x: 50, y: 50, rotate: 45, opacity: 0 }}
                        animate={{ x: 20, y: 20, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="absolute bottom-0 right-0 p-2 bg-ink border border-paper"
                    >
                        <div className="w-8 h-8 bg-surface" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-ink" />
                    </div>
                </div>
            );
        case 'overshoot':
            return (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 0.9, 1] }}
                    transition={{ duration: 0.6, times: [0, 0.5, 0.8, 1] }}
                    className="p-8 bg-paper border-4 border-ink shadow-hard"
                >
                    <Icon className="w-16 h-16 text-ink" />
                </motion.div>
            );
        case 'blur':
            return (
                <motion.div 
                    initial={{ filter: "blur(10px)", opacity: 0 }}
                    animate={{ filter: "blur(0px)", opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="p-8 bg-surface border border-ink"
                >
                    <Icon className="w-16 h-16 text-ink" />
                </motion.div>
            );
        case 'glow':
            return (
                <motion.div 
                    animate={{ boxShadow: ["0px 0px 0px 0px rgba(16, 185, 129, 0)", "0px 0px 20px 5px rgba(16, 185, 129, 0.5)", "0px 0px 0px 0px rgba(16, 185, 129, 0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-8 bg-paper border-2 border-accent rounded-full"
                >
                    <Icon className="w-16 h-16 text-accent" />
                </motion.div>
            );
        default:
            return <Icon className="w-16 h-16" />;
    }
}

// --- Main Component ---

interface MethodologySectionProps {
    onOpenContact: () => void;
}

const MethodologySection: React.FC<MethodologySectionProps> = ({ onOpenContact }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);

    const nextPhase = () => {
        if (currentPhase < PHASES.length - 1) setCurrentPhase(prev => prev + 1);
    };

    const prevPhase = () => {
        if (currentPhase > 0) setCurrentPhase(prev => prev - 1);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight') nextPhase();
            if (e.key === 'ArrowLeft') prevPhase();
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentPhase]);

    return (
        <section id="methodology" className="py-24 bg-surface border-y-2 border-ink relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

            {/* Launch Pad View */}
            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <div className="mb-12">
                    <h2 className="font-serif text-5xl font-bold text-ink mb-6">
                        The "Methodology"
                    </h2>
                    <p className="font-sans text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                        A loosely controlled experiment in thinking clearly
                    </p>
                </div>

                <div className="flex justify-center flex-col items-center gap-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setIsOpen(true); setCurrentPhase(0); }}
                        className="group relative bg-ink text-paper px-8 py-6 text-lg font-mono font-bold border-2 border-transparent hover:border-ink hover:bg-accent hover:text-ink transition-all duration-300 flex items-center gap-4 shadow-hard"
                    >
                        <Play className="w-6 h-6 fill-current" />
                        <span>METHODOLOGY (LAB COATS OPTIONAL, MUSIC COMPULSORY)</span>
                    </motion.button>

                    <div className="font-mono text-sm text-gray-200 bg-[#1e1e1e] p-4 border border-gray-600 rounded-md shadow-lg text-left inline-block mt-6 max-w-lg w-full">
                        <div className="flex gap-1.5 mb-3 border-b border-gray-700 pb-2">
                           <div className="w-3 h-3 rounded-full bg-red-500"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                           <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <code className="block leading-relaxed">
                            <span className="text-blue-400">const</span> <span className="text-white">LAB_COATS</span> <span className="text-pink-500">+=</span> <span className="text-purple-300">STYLE_POINTS</span><span className="text-white">;</span><br/>
                            <span className="text-pink-500">if</span> <span className="text-white">(</span><span className="text-white">MUSIC</span> <span className="text-pink-500">===</span> <span className="text-purple-400">true</span><span className="text-white">)</span> <span className="text-white">{'{'}</span><br/>
                            &nbsp;&nbsp;<span className="text-white">SOUL</span> <span className="text-pink-500">=</span> <span className="text-green-400">"Nourished"</span><span className="text-white">;</span><br/>
                            &nbsp;&nbsp;<span className="text-yellow-300">Truth</span><span className="text-white">.</span><span className="text-blue-400">render</span><span className="text-white">();</span><br/>
                            <span className="text-white">{'}'}</span>
                        </code>
                    </div>
                </div>

                <p className="mt-8 text-xs font-mono text-gray-500">
                    /// Click Methodology to Initiate Protocol ///
                </p>
            </div>

            {/* Full Screen Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex flex-col bg-surface/95 backdrop-blur-md">
                        {/* Modal Header */}
                        <div className="flex-none h-16 border-b-2 border-ink bg-paper px-6 flex items-center justify-between shadow-sm z-50">
                            <div>
                                <h3 className="font-serif font-bold text-xl text-ink">The Metacogna Method™ <span className="text-xs font-mono font-normal text-gray-500 ml-2">(PEER REVIEW PENDING - THANKS MUM)</span></h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900 transition-colors border border-transparent hover:border-red-500 text-ink">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body (Carousel) */}
                        <div className="flex-grow flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
                            {/* Navigation Arrows */}
                            <button 
                                onClick={prevPhase} 
                                disabled={currentPhase === 0}
                                className="absolute left-4 md:left-8 p-4 bg-paper border-2 border-ink shadow-hard disabled:opacity-20 disabled:shadow-none hover:bg-accent transition-all z-40 hidden md:block text-ink"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            
                            <button 
                                onClick={nextPhase} 
                                disabled={currentPhase === PHASES.length - 1}
                                className="absolute right-4 md:right-8 p-4 bg-paper border-2 border-ink shadow-hard disabled:opacity-20 disabled:shadow-none hover:bg-accent transition-all z-40 hidden md:block text-ink"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            {/* Cards */}
                            <div className="w-full max-w-4xl h-[60vh] relative perspective-1000">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPhase}
                                        initial={{ opacity: 0, x: 100, rotateY: -10 }}
                                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                        exit={{ opacity: 0, x: -100, rotateY: 10 }}
                                        transition={{ duration: 0.4, ease: "circOut" }}
                                        className="w-full h-full bg-paper border-2 border-ink shadow-hard p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center"
                                    >
                                        {/* Left: Visual & Animation */}
                                        <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-gray-100 dark:border-gray-800 pb-8 md:pb-0 md:pr-8 min-h-[200px]">
                                            <PhaseVisual 
                                                type={PHASES[currentPhase].animationType} 
                                                Icon={PHASES[currentPhase].icon} 
                                            />
                                            <div className="mt-8 font-mono text-sm text-gray-400">
                                                PHASE_0{PHASES[currentPhase].id}
                                            </div>
                                        </div>

                                        {/* Right: Content */}
                                        <div className="w-full md:w-2/3 flex flex-col justify-center text-left">
                                            <h4 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-ink">
                                                {PHASES[currentPhase].title}
                                            </h4>
                                            
                                            <div className="mb-6 relative">
                                                <span className="absolute -left-4 top-0 text-4xl text-gray-200 dark:text-gray-700 font-serif font-bold">“</span>
                                                <p className="text-xl font-medium text-ink italic pl-4 border-l-4 border-accent">
                                                    {PHASES[currentPhase].quote}
                                                </p>
                                            </div>

                                            <div className="mb-8">
                                                <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Actually Doing:</p>
                                                <p className="font-sans text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                                                    {PHASES[currentPhase].reality}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 flex items-center">
                                                <div className="bg-accent text-paper dark:text-ink px-2 py-1 shadow-hard-sm border border-ink text-xs font-mono font-bold transform translate-y-1">
                                                    * Fine Print
                                                </div>
                                                <p className="font-mono text-xs text-gray-500 ml-4 font-bold flex-1 leading-snug">
                                                    {PHASES[currentPhase].finePrint}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Modal Footer (Progress & Controls) */}
                        <div className="flex-none h-20 bg-surface border-t-2 border-ink flex items-center justify-between px-6 md:px-12">
                            <div className="flex gap-2">
                                {PHASES.map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className={`w-3 h-3 rounded-full border border-ink transition-all duration-300 ${idx === currentPhase ? 'bg-ink scale-125' : 'bg-transparent'}`} 
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                {currentPhase < PHASES.length - 1 ? (
                                    <button 
                                        onClick={() => setCurrentPhase(PHASES.length - 1)}
                                        className="font-mono text-xs text-gray-500 hover:text-ink flex items-center gap-1"
                                    >
                                        <SkipForward className="w-3 h-3" />
                                        SKIP TO CONFUSION
                                    </button>
                                ) : (
                                    <PaperButton onClick={() => { setIsOpen(false); onOpenContact(); }} variant="primary" className="animate-pulse">
                                        START EXPERIMENT
                                    </PaperButton>
                                )}
                            </div>

                            {/* Philosophy Tooltip (Hidden until hover) */}
                            <div className="hidden md:block group relative">
                                <span className="cursor-help font-serif italic text-gray-500 hover:text-ink border-b border-gray-400 border-dashed">Design Philosophy</span>
                                <div className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-ink text-paper text-xs font-mono rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    “This methodology is not optimized for speed, but rather velocity. It has direction and avoiding rework 3 phases ahead.”
                                    <div className="absolute -bottom-1 right-8 w-2 h-2 bg-ink rotate-45"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default MethodologySection;