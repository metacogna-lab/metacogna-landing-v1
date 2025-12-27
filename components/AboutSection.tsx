import React, { useState } from 'react';
import { PaperCard, PaperBadge, PaperModal, PaperButton } from './PaperComponents';
import { FileText, User, BookOpen, Layers, Zap, Image as ImageIcon, Loader, Download, AlertCircle, Maximize2, X, Database, Cpu, GitBranch } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const PROMPTS = [
  {
    "style": "cinematic hyperrealism",
    "prompt": "A cinematic hyperrealistic image of a white man with short brown hair and broad shoulders holding a MacBook close to his chest, standing calm and focused while a city fractures behind him into spiraling data streams, collapsing skyscrapers, and glowing equations, as chaos meets the creative in a storm of volumetric light, digital debris, and slow-motion particle effects, in the style of Beeple"
  },
  {
    "style": "surreal visionary art",
    "prompt": "A surreal visionary image of a white man with short brown hair and broad shoulders holding a MacBook, rooted firmly in the foreground while the background dissolves into morphing organic forms, neural pathways, and cosmic mandalas, as chaos meets the creative in pulsating color fields, fractal overlays, and translucent energy waves, in the style of Alex Grey"
  },
  {
    "style": "dark futuristic illustration",
    "prompt": "A dark futuristic illustration of a white man with short brown hair and broad shoulders holding a MacBook, illuminated by its glow while autonomous drones, collapsing timelines, and glitching holograms erupt behind him, as chaos meets the creative in chromatic aberration, neon interference, and cinematic smoke, in the style of Syd Mead"
  },
  {
    "style": "painterly techno-romanticism",
    "prompt": "A painterly techno-romantic image of a white man with short brown hair and broad shoulders holding a MacBook like a compass, while storm clouds of handwritten notes, tangled wires, and abstract diagrams swirl across the sky behind him, as chaos meets the creative in expressive brushstrokes, dramatic chiaroscuro, and flowing motion blur, in the style of Zdzisław Beksiński"
  },
  {
    "style": "conceptual sci-fi realism",
    "prompt": "A conceptual sci-fi realistic image of a white man with short brown hair and broad shoulders holding a MacBook at the center of a frozen moment, while parallel realities collide behind him—burning servers, blooming forests, and shifting grids of light—where chaos meets the creative in layered depth, temporal distortion, and luminous atmospheric effects, in the style of Simon Stålenhag"
  }
];

interface AboutSectionProps {
    isAuthenticated: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ isAuthenticated }) => {
  const [imageState, setImageState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash-image");
  const [isLLMHovered, setIsLLMHovered] = useState(false);

  const generateProfileImage = async () => {
    if (imageState === 'loading') return;

    setImageState('loading');
    setProgress(0);
    setImageUrl(null);
    setIsImageModalOpen(false);

    // Simulated progress bar
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.floor(Math.random() * 10);
        });
    }, 300);

    try {
        const randomSelection = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
        setSelectedStyle(randomSelection.style);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let base64String = null;

        if (selectedModel.startsWith('imagen')) {
             const response = await ai.models.generateImages({
                model: selectedModel,
                prompt: randomSelection.prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                }
            });
            base64String = response.generatedImages?.[0]?.image?.imageBytes;
        } else {
            const response = await ai.models.generateContent({
                model: selectedModel,
                contents: {
                    parts: [{ text: randomSelection.prompt }]
                }
            });

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        base64String = part.inlineData.data;
                        break;
                    }
                }
            }
        }

        if (base64String) {
            setImageUrl(`data:image/png;base64,${base64String}`);
            setImageState('loaded');
        } else {
            throw new Error("No image data found in response");
        }

    } catch (error) {
        console.error("Image generation failed:", error);
        setImageState('error');
    } finally {
        clearInterval(interval);
        setProgress(100);
    }
  };

  const handleDownload = () => {
      if (imageUrl) {
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `metacogna-founder-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  return (
    <section id="about" className="py-24 bg-paper relative overflow-hidden border-t-2 border-ink">
       <div className="max-w-7xl mx-auto px-4 relative z-10">
          
          <div className="grid md:grid-cols-12 gap-12">
             
             {/* Left Column: The Manifesto */}
             <div className="md:col-span-7 flex flex-col gap-6">
                <div>
                    <PaperBadge color="blue">PHILOSOPHY</PaperBadge>
                    <h2 className="font-serif text-5xl font-bold text-ink mt-6 mb-8 leading-none">
                    Our "work" begins with a simple question: <span className="bg-accent px-2 text-ink">Why?</span>
                    </h2>
                    
                    <div className="prose prose-lg text-gray-800 dark:text-gray-300 font-sans space-y-6">
                        <p>
                            We are motivated by the quiet awe of the universe, the strange joy of discovering how things really behave, and the belief that better thinking leads to better outcomes.
                        </p>
                        <p className="font-bold border-l-4 border-ink pl-4 italic">
                            "We treat thinking as a system, not a personality trait."
                        </p>
                        <p>
                            Metacogna Labs is intentionally small. That is not a limitation; it is a feature. It allows fast iteration without institutional drag, and lets ideas be tested before they harden into dogma.
                        </p>
                    </div>
                </div>

                {/* New Additions - Green Badge Style with Hover Reveal */}
                <div 
                    className="mt-8 bg-accent text-ink border-2 border-ink shadow-hard p-6 relative cursor-help transition-all duration-300 min-h-[300px]"
                    onMouseEnter={() => setIsLLMHovered(true)}
                    onMouseLeave={() => setIsLLMHovered(false)}
                >
                    <div className="absolute -top-3 -right-3 bg-paper border-2 border-ink p-1 rotate-12 z-20 shadow-sm">
                         <Zap className="w-5 h-5 text-accent fill-current" />
                    </div>
                    
                    {/* Default View */}
                    <div className={`transition-opacity duration-300 absolute inset-0 p-8 flex flex-col justify-center ${isLLMHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <p className="font-serif font-bold text-xl mb-4 leading-tight">
                            The Rise of the LLM...
                        </p>
                        <p className="font-sans font-medium leading-relaxed">
                            ...has commoditized answers but inflated the value of the right questions. We dabble not to escape mastery, but to find where the silos touch. We are looking for partners who understand that the hardest problems require jazz, not just algorithms. Continuous learning is safe here, for now.
                        </p>
                    </div>

                    {/* Hover View (Expanded Summary) */}
                    <div className={`transition-opacity duration-300 absolute inset-0 bg-ink text-paper p-8 flex flex-col justify-between ${isLLMHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="flex items-center gap-2 border-b border-accent/50 pb-2 mb-2">
                            <Cpu className="w-4 h-4 text-accent" />
                            <span className="font-mono text-[10px] text-accent font-bold uppercase tracking-widest">TACTICAL_MINDSET_V1</span>
                        </div>
                        
                        <div className="font-sans text-sm leading-relaxed space-y-3 overflow-y-auto custom-scrollbar">
                             <p className="text-gray-200">
                                Power usage of the plethora of AI tools requires a combination of a mindset that understands the importance of <span className="text-accent font-bold">precision</span> and flexibility of mind that leads to <span className="text-accent font-bold">creative problem solving</span>.
                             </p>
                             
                             <div className="grid grid-cols-1 gap-1 text-xs font-mono text-gray-400 pl-2 border-l border-gray-700">
                                <div className="flex items-center gap-2">
                                    <GitBranch className="w-3 h-3 text-accent" /> Use processing time for parallelisation
                                </div>
                                <div className="flex items-center gap-2">
                                    <Database className="w-3 h-3 text-accent" /> Store relevant data (including prompts)
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3 h-3 text-accent" /> Systematic product design & deployment
                                </div>
                             </div>

                             <p className="text-gray-300 italic text-xs leading-relaxed">
                                "Prototyping is quick and easy, and we use this to start collecting User Research, iterate and move quickly."
                             </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-accent/30 text-right">
                             <span className="font-bold font-serif text-lg md:text-xl text-accent tracking-wide leading-none">The Magic is in Your Data Modelling</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Right Column: Founder's Dossier */}
             <div className="md:col-span-5">
                 <div className="relative">
                     {/* Paper Clip Visual */}
                     <div className="absolute -top-4 left-8 w-4 h-12 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-ink z-20"></div>

                     <PaperCard className="bg-surface rotate-1" title="PERSONNEL FILE: FOUNDER">
                        <div className="space-y-6 font-mono text-sm text-ink">
                            
                            {/* Header Info */}
                            <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-4">
                                <div>
                                    <span className="block text-gray-500 text-xs">NAME</span>
                                    <span className="font-bold text-lg">SUNYATA</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-gray-500 text-xs">CLASSIFICATION</span>
                                    <span className="text-accent font-bold text-xs leading-tight block max-w-[150px] ml-auto">
                                        FATHER // MAD_SCIENTIST // CHIEF_DABBLING_OFFICER
                                    </span>
                                </div>
                            </div>

                            {/* Bio Block */}
                            <div className="space-y-4">
                                <p className="leading-relaxed">
                                    Zen Mind, Beginner's Mind. We are a "Lab" because "Dabble Shop" didn't quite make it past the Marketing neuron.
                                </p>
                                <p className="leading-relaxed border-l-2 border-accent pl-3">
                                    Enjoyed walking uphill and being scraped on rocks for a while. Grateful for this moment in time beyond words. A transformational experience and soul tuning to the vibrations of the walls of the Squamish ( Sḵwx̱wú7mesh) region during an afternoon "Mother Wind"
                                </p>
                            </div>

                            {/* Q&A Grid */}
                            <div className="bg-paper p-4 border border-ink space-y-4">
                                <div className="flex gap-3 items-start">
                                    <User className="w-4 h-4 mt-1 flex-shrink-0" />
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase">Favourite Person</span>
                                        <span className="font-bold">Richard P. Feynman</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 items-start">
                                    <BookOpen className="w-4 h-4 mt-1 flex-shrink-0" />
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase">Favourite Book</span>
                                        <span className="font-bold">Refuse to answer.</span>
                                        <div className="text-gray-500 text-xs mt-1">
                                            (Same refusal applies to music (Concrete &lt; Continuous))
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <Layers className="w-4 h-4 mt-1 flex-shrink-0" />
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase">Dietary Habits</span>
                                        <span className="font-bold">Eats abstractions for breakfast.</span>
                                        <div className="text-gray-500 text-xs mt-1">
                                            Lays them down with a plan by lunch.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Image Generation Section */}
                            <div className="border-t border-gray-300 dark:border-gray-700 pt-4 mt-2">
                                {imageState === 'idle' && (
                                    <div className="flex flex-col gap-3 w-full">
                                        {isAuthenticated && (
                                            <div className="flex justify-between items-center bg-gray-100 dark:bg-zinc-800 p-2 border border-gray-200 dark:border-gray-700">
                                                <span className="font-mono text-[10px] text-gray-500 font-bold uppercase">Model Selection:</span>
                                                <select 
                                                    value={selectedModel} 
                                                    onChange={(e) => setSelectedModel(e.target.value)}
                                                    className="bg-paper border border-gray-300 dark:border-gray-600 text-xs font-mono p-1 outline-none focus:border-ink cursor-pointer"
                                                >
                                                    <option value="gemini-2.5-flash-image">Gemini 2.5 Flash (Standard)</option>
                                                    <option value="gemini-3-pro-image-preview">Gemini 3 Pro (HD)</option>
                                                    <option value="imagen-4.0-generate-001">Imagen 3 (High Fidelity)</option>
                                                </select>
                                            </div>
                                        )}

                                        <button 
                                            onClick={generateProfileImage}
                                            className="w-full group relative py-4 px-4 bg-surface border-2 border-dashed border-ink hover:border-solid hover:bg-ink hover:text-paper transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-hard"
                                        >
                                            <div className="bg-paper p-1 border border-ink rounded-sm group-hover:border-paper group-hover:bg-ink">
                                                <ImageIcon className="w-4 h-4 text-ink group-hover:text-paper" />
                                            </div>
                                            <span className="font-mono text-xs font-bold tracking-widest uppercase text-ink group-hover:text-paper">GENERATE_VISUAL_ID</span>
                                        </button>
                                    </div>
                                )}

                                {imageState === 'loading' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-mono">
                                            <span className="animate-pulse">/// RENDERING_NEURAL_PATHWAYS...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 border border-ink">
                                            <div 
                                                className="h-full bg-accent transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {imageState === 'error' && (
                                    <div className="flex items-center gap-2 text-red-600 text-xs font-mono bg-red-50 dark:bg-red-900/20 p-2 border border-red-200">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>GENERATION_FAILURE. RETRY?</span>
                                        <button onClick={generateProfileImage} className="underline hover:text-red-800 ml-auto">RETRY</button>
                                    </div>
                                )}

                                {imageState === 'loaded' && imageUrl && (
                                    <div className="relative mt-4">
                                        <div className="relative inline-block group/image">
                                            <div 
                                                className="w-32 h-32 md:w-40 md:h-40 border-2 border-ink shadow-hard overflow-hidden relative cursor-pointer"
                                                onClick={() => setIsImageModalOpen(true)}
                                                title="Click to expand"
                                            >
                                                <img src={imageUrl} alt="Generated Founder Profile" className="w-full h-full object-cover" />
                                                
                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-ink/0 group-hover/image:bg-ink/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover/image:opacity-100">
                                                    <span className="text-white font-mono text-xs font-bold flex items-center gap-1">
                                                        <Maximize2 className="w-4 h-4" /> VIEW_PROFILE_PICTURE
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Clear Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImageUrl(null);
                                                    setImageState('idle');
                                                }}
                                                className="absolute -top-3 -right-3 z-10 bg-paper text-ink border-2 border-ink p-1.5 shadow-hard-sm hover:translate-y-[1px] hover:shadow-none hover:bg-red-50 hover:text-red-600 transition-all"
                                                title="Clear Image"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="mt-2 text-[10px] font-mono text-gray-400">
                                            * This is a real photo
                                        </div>
                                    </div>
                                )}
                            </div>

                             {/* Footer Note */}
                             <div className="pt-2 text-xs text-gray-500 italic border-t border-gray-300 dark:border-gray-700 mt-4">
                                Preferred Modus Operandi: Perceived Chaos - We Call It "Paralleled Phase Implementation" (sounds good)
                             </div>

                        </div>
                     </PaperCard>
                 </div>
             </div>

             {/* Modal for Full Image */}
             <PaperModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                title="VISUAL_ID_VERIFICATION"
            >
                <div className="flex flex-col gap-4">
                    <div className="border-2 border-ink bg-gray-100 dark:bg-zinc-800 p-2 shadow-sm flex items-center justify-center">
                         {/* Fallback check in case imageUrl is null (shouldn't happen if modal is open) */}
                        {imageUrl && (
                            <img src={imageUrl} alt="Full Profile" className="w-full h-auto max-h-[60vh] object-contain" />
                        )}
                    </div>
                    
                    <div className="bg-surface p-3 border border-ink text-xs font-mono text-ink">
                        <span className="font-bold block mb-1">/// GENERATION_METADATA</span>
                        <span className="block text-gray-600 dark:text-gray-400">MODEL: {selectedModel}</span>
                        <span className="block text-gray-600 dark:text-gray-400">STYLE: {selectedStyle}</span>
                    </div>

                    <div className="flex justify-end gap-2">
                         <PaperButton onClick={handleDownload} variant="secondary">
                            <Download className="w-4 h-4" /> SAVE TO DISK
                         </PaperButton>
                         <PaperButton onClick={() => { setIsImageModalOpen(false); generateProfileImage(); }}>
                            <Loader className="w-4 h-4" /> REGENERATE
                         </PaperButton>
                    </div>
                </div>
            </PaperModal>

          </div>

       </div>
    </section>
  );
};

export default AboutSection;