
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperCard, PaperBadge } from './PaperComponents';
import { ArrowRight, Music, Zap, Cpu } from 'lucide-react';

// --- Visualizations ---

const CuriosityMath: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full select-none pointer-events-none">
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-serif text-2xl italic flex items-center gap-2"
        >
            <span>f(x)</span>
            <span>=</span>
            <div className="flex flex-col items-center mx-2 text-sm">
                <span>lim</span>
                <span className="border-t border-ink w-full">n→∞</span>
            </div>
            <span>(why)</span>
            <sup className="text-sm">n</sup>
        </motion.div>
    </div>
);

const DisciplineTensor: React.FC = () => {
    // 3x3 Grid simulation
    const dots = Array.from({ length: 9 });
    return (
        <div className="flex items-center justify-center h-full w-full gap-4 pointer-events-none">
            {/* Matrix A */}
            <motion.div 
                className="grid grid-cols-3 gap-1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
            >
                {dots.map((_, i) => (
                    <motion.div 
                        key={`a-${i}`}
                        className="w-2 h-2 bg-ink rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
                    />
                ))}
            </motion.div>
            
            <span className="font-bold text-xl">×</span>

            {/* Matrix B */}
            <motion.div 
                className="grid grid-cols-3 gap-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
            >
                {dots.map((_, i) => (
                    <motion.div 
                        key={`b-${i}`}
                        className="w-2 h-2 border border-ink rounded-full"
                        animate={{ backgroundColor: ["#ffffff", "#18181b", "#ffffff"] }}
                        transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

const DeliveryChaos: React.FC = () => {
    const paths = [
        "M10,50 C40,10 60,90 90,50", // Path 1
        "M10,50 C30,80 70,20 90,50", // Path 2
        "M10,50 C20,40 80,60 90,50", // Path 3 (Direct)
        "M10,50 C40,-10 60,110 90,50" // Path 4 (Wild)
    ];

    return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-24 overflow-visible">
                {/* Target */}
                <circle cx="90" cy="50" r="3" className="fill-accent" />
                <circle cx="10" cy="50" r="3" className="fill-ink" />

                {/* Chaotic Paths */}
                {paths.map((d, i) => (
                    <motion.path
                        key={i}
                        d={d}
                        fill="none"
                        stroke="#18181b"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0.5] }}
                        transition={{ 
                            duration: 2 + Math.random(), 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: i * 0.2 
                        }}
                    />
                ))}
                
                {/* The "Main" Efficient Path flashing */}
                <motion.path
                    d="M10,50 C20,40 80,60 90,50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </svg>
        </div>
    );
};

// --- Pillar Card ---

interface PillarCardProps {
    title: string;
    description: string;
    Visual: React.FC;
    delay: number;
}

const PillarCard: React.FC<PillarCardProps> = ({ title, description, Visual, delay }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <PaperCard className="h-80 relative overflow-hidden group cursor-crosshair transition-all duration-300 hover:shadow-hard-hover hover:-translate-y-1">
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <PaperBadge color="gray" >Variable 0{delay * 10}</PaperBadge>
                        <AnimatePresence mode="wait">
                            {!isHovered ? (
                                <motion.h3 
                                    key="text"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-4xl font-serif font-bold mt-4"
                                >
                                    {title}
                                </motion.h3>
                            ) : (
                                <motion.div
                                    key="visual"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-24 mt-4"
                                >
                                    <Visual />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-4">
                        <AnimatePresence mode="wait">
                            {!isHovered ? (
                                <motion.p 
                                    key="desc"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="font-sans text-gray-600 leading-relaxed text-sm"
                                >
                                    {description}
                                </motion.p>
                            ) : (
                                <motion.p 
                                    key="math-desc"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="font-mono text-xs text-accent leading-relaxed mt-2"
                                >
                                    {title === "Curiosity" && "/// DECONSTRUCTING_PREMISE..."}
                                    {title === "Discipline" && "/// TENSOR_MULTIPLICATION_ACTIVE..."}
                                    {title === "Delivery" && "/// OPTIMIZING_CHAOTIC_VECTORS..."}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                {/* Background Decor */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full z-0 group-hover:scale-150 transition-transform duration-500 ease-in-out" />
            </PaperCard>
        </motion.div>
    );
};

const HowWeWorkSection: React.FC = () => {
    return (
        <section id="how-we-work" className="py-24 px-4 max-w-7xl mx-auto border-t-2 border-ink">
             <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="font-serif text-5xl font-bold text-ink mb-2">How We Work</h2>
                    <p className="font-mono text-gray-600 text-sm">/// THE_PROCESS_KERNEL</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <PillarCard 
                    title="Curiosity" 
                    description="The raw input. We break premises down until they admit they were wrong." 
                    Visual={CuriosityMath}
                    delay={0.1}
                />
                <PillarCard 
                    title="Discipline" 
                    description="The processing layer. Rigorous structural analysis applied to wild ideas." 
                    Visual={DisciplineTensor}
                    delay={0.2}
                />
                <PillarCard 
                    title="Delivery" 
                    description="The chaotic convergence. Multiple parallel streams hitting one inevitable target." 
                    Visual={DeliveryChaos}
                    delay={0.3}
                />
            </div>

            {/* Philosophy / Footer of section */}
            <div className="bg-ink text-paper p-8 relative overflow-hidden shadow-hard mb-12">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Cpu className="w-24 h-24" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-accent">
                            <Zap className="w-4 h-4" />
                            <span className="font-mono text-xs font-bold uppercase tracking-widest">Operating Philosophy</span>
                        </div>
                        <h3 className="font-serif text-2xl leading-relaxed font-bold mb-4">
                            Always looking for exciting partnerships, hard problems and well produced <span className="italic text-accent inline-flex items-center gap-1">Music <Music className="w-4 h-4" /></span>.
                        </h3>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                        <div className="bg-[#222] border-l-2 border-accent p-4 font-mono text-sm text-gray-300">
                            <span className="text-gray-500 block text-xs mb-2">/// LOG_ENTRY: CURRENT_STATE</span>
                            "The rise of the LLM combined with an insufferable desire to know has accelerated the development of the dabbling. We are building the tools we wish we had yesterday."
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <button 
                    onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-block border-b-2 border-ink pb-1 font-mono text-sm text-ink hover:text-accent transition-colors font-bold tracking-wider cursor-pointer uppercase"
                >
                    STUFF & THINGS &darr;
                </button>
            </div>
        </section>
    );
};

export default HowWeWorkSection;
