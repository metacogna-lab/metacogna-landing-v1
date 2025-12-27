
import React from 'react';
import { motion } from 'framer-motion';
import { PaperCard, PaperBadge, PaperButton } from './PaperComponents';
import { ArrowLeft, ExternalLink, Github, Monitor, Terminal, Cpu, Network, Zap } from 'lucide-react';

// --- Mock Data with "Blog" flavor ---
const GALLERY_ITEMS = [
    {
        id: 'compilar',
        title: 'Compilar',
        subtitle: 'The Sociology of Invisible Lines',
        summary: "We spent 20 years watching people argue in meetings, then we turned it into graph theory. Compilar is an attempt to quantify the 'vibe' of a team. It visualizes the invisible coordination forces that managers pretend to control but actually just surf.",
        curatorNote: "Status: Ontologically Ambiguous. The graph nodes are screaming.",
        tags: ['Sociology', 'Math', 'Pain'],
        imageType: 'network', // Generative visual type
        links: { github: 'https://github.com/metacogna-lab/compilar' }
    },
    {
        id: 'neural-shadow',
        title: 'Neural Shadow',
        subtitle: 'Honeypots for Hallucinations',
        summary: "An adversarial playground designed to bully AI agents into revealing their true nature. We built a system that lies to LLMs to see if they lie back. Spoiler: They do, and they're better at it than us.",
        curatorNote: "Warning: May cause existential dread in chatbots.",
        tags: ['Security', 'Adversarial', 'Chaos'],
        imageType: 'glitch',
        links: { github: 'https://github.com/metacogna-lab/neural-shadow' }
    },
    {
        id: 'timeless-love',
        title: 'Timeless Love',
        subtitle: 'Digitizing Nostalgia',
        summary: "Proof that we have feelings. A product focused on memory preservation that doesn't feel like a funeral home. We used aggressive caching strategies to ensure your grandmother's lemon cake recipe survives the heat death of the universe.",
        curatorNote: "Emotional Payload: High. Latency: Low.",
        tags: ['Legacy', 'Consumer', 'Heart'],
        imageType: 'soft',
        links: { web: 'https://timelesslove.ai' }
    },
    {
        id: 'entropy-engine',
        title: 'The Entropy Engine',
        subtitle: 'Internal Tooling',
        summary: "A collection of scripts we wrote at 3 AM to automate the things we hate doing. It mostly just moves JSON files from one bucket to another while playing synthwave, but it feels important.",
        curatorNote: "It works on my machine.",
        tags: ['DevOps', 'Scripts', 'Coffee'],
        imageType: 'terminal',
        links: {}
    }
];

// --- Generative Visuals for Gallery ---
const GalleryVisual: React.FC<{ type: string }> = ({ type }) => {
    if (type === 'network') {
        return (
            <div className="w-full h-64 bg-ink relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
                <Network className="w-32 h-32 text-paper opacity-20" />
                <motion.div 
                    className="absolute inset-0 border-2 border-accent opacity-50"
                    animate={{ scale: [0.9, 1.1, 0.9], rotate: [0, 5, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>
        );
    }
    if (type === 'glitch') {
        return (
            <div className="w-full h-64 bg-gray-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-red-900/20 mix-blend-overlay" />
                <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    animate={{ x: ["-50%", "-48%", "-52%", "-50%"] }}
                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
                >
                    <Terminal className="w-24 h-24 text-green-500" />
                </motion.div>
                <div className="absolute bottom-4 right-4 font-mono text-xs text-red-500">SYSTEM_FAILURE</div>
            </div>
        );
    }
    if (type === 'soft') {
        return (
            <div className="w-full h-64 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-dot-pattern opacity-10" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <Zap className="w-24 h-24 text-accent fill-current" />
                </motion.div>
            </div>
        );
    }
    return (
        <div className="w-full h-64 bg-ink flex items-center justify-center">
            <Cpu className="w-24 h-24 text-gray-700" />
        </div>
    );
};

interface ProjectGalleryProps {
    onBack: () => void;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-surface pt-8 pb-24">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto px-4 mb-16">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-ink mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> RETURN_TO_BASE
                </button>

                <div className="border-b-4 border-ink pb-6">
                    <h1 className="font-serif text-6xl md:text-8xl font-bold text-ink mb-4">
                        Stuff & Things
                    </h1>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <p className="font-sans text-xl text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed italic">
                            A compendium of partially finished thoughts, over-engineered solutions, and things we built because the documentation said it was impossible.
                        </p>
                        <div className="font-mono text-xs border border-ink px-2 py-1 bg-paper text-ink shadow-hard-sm">
                            GALLERY_MODE: CURATED
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 gap-16">
                    {GALLERY_ITEMS.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className={`grid md:grid-cols-12 gap-8 items-center ${index % 2 === 1 ? 'md:direction-rtl' : ''}`}
                        >
                            {/* Visual Side */}
                            <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}>
                                <PaperCard noPadding className="border-4 border-ink shadow-hard hover:shadow-hard-hover transition-all duration-300 group">
                                    <GalleryVisual type={item.imageType} />
                                    <div className="bg-ink text-paper p-2 font-mono text-xs flex justify-between">
                                        <span>FIG_{index + 1}.0</span>
                                        <span className="opacity-50">{item.id.toUpperCase()}</span>
                                    </div>
                                </PaperCard>
                            </div>

                            {/* Content Side */}
                            <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:order-1 text-right' : 'md:order-2 text-left'}`}>
                                <div className={`flex flex-col gap-4 ${index % 2 === 1 ? 'items-end' : 'items-start'}`}>
                                    <div className="inline-block">
                                        <PaperBadge color="gray">{item.tags.join(' // ')}</PaperBadge>
                                    </div>
                                    
                                    <div>
                                        <h2 className="font-serif text-4xl font-bold text-ink mb-2">{item.title}</h2>
                                        <h3 className="font-mono text-sm text-accent font-bold uppercase tracking-wider mb-6">
                                            {item.subtitle}
                                        </h3>
                                    </div>

                                    <p className="font-sans text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                        {item.summary}
                                    </p>

                                    <div className={`bg-gray-100 dark:bg-zinc-800 border-l-4 border-accent p-4 font-mono text-xs text-gray-600 dark:text-gray-400 mb-6 w-full ${index % 2 === 1 ? 'text-right border-l-0 border-r-4' : 'text-left'}`}>
                                        <span className="font-bold block mb-1">/// CURATOR_NOTE</span>
                                        "{item.curatorNote}"
                                    </div>

                                    <div className="flex gap-4">
                                        {item.links.web && (
                                            <PaperButton size="sm" onClick={() => window.open(item.links.web, '_blank')}>
                                                VISIT SITE <ExternalLink className="w-3 h-3 ml-1" />
                                            </PaperButton>
                                        )}
                                        {item.links.github && (
                                            <PaperButton size="sm" variant="secondary" onClick={() => window.open(item.links.github, '_blank')}>
                                                CODE <Github className="w-3 h-3 ml-1" />
                                            </PaperButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer of Gallery */}
                <div className="mt-24 pt-12 border-t-2 border-dashed border-gray-400 text-center">
                    <p className="font-serif text-2xl italic text-gray-500 mb-6">
                        "If you aren't embarrassed by the first version of your product, you launched too late."
                        <br/>
                        <span className="text-sm font-mono not-italic mt-2 block">— Reid Hoffman (but we take it too literally)</span>
                    </p>
                    <PaperButton onClick={onBack} variant="ghost">
                        RETURN TO HOMEPAGE
                    </PaperButton>
                </div>
            </div>
        </div>
    );
};

export default ProjectGallery;
