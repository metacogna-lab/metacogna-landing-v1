
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperButton } from './PaperComponents';
import { Play } from 'lucide-react';

interface MermaidSolutionsProps {
    code: string;
    onExecute: () => void;
    terminalLines: string[];
}

const MermaidSolutions: React.FC<MermaidSolutionsProps> = ({ code, onExecute, terminalLines }) => {
    return (
        <div className="w-full flex flex-col items-end gap-6">
            <div className="w-full bg-ink border-2 border-ink shadow-hard p-4 rounded-sm relative min-h-[50vh] font-mono text-sm overflow-hidden text-gray-300">
                {/* Editor Header */}
                <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-gray-500 text-xs font-mono">/src/architecture/solution_topology.mmd</div>
                </div>

                {/* Line Numbers & Code */}
                <div className="flex gap-4 overflow-x-auto pb-20">
                    <div className="flex flex-col text-gray-600 text-right select-none border-r border-gray-800 pr-4">
                        {code.split('\n').map((_, i) => (
                            <span key={i} className="leading-relaxed">{i + 1}</span>
                        ))}
                    </div>
                    <div className="text-gray-300 whitespace-pre font-mono leading-relaxed w-full">
                        {code.split('\n').map((line, i) => (
                             <div key={i}>
                                {line.includes('graph') ? (
                                    <span className="text-purple-400 font-bold">{line}</span>
                                ) : line.includes('-->') ? (
                                    <span>
                                        <span className="text-blue-300">{line.split('-->')[0]}</span>
                                        <span className="text-accent font-bold">--&gt;</span>
                                        <span className="text-yellow-300">{line.split('-->')[1]}</span>
                                    </span>
                                ) : (
                                    line
                                )}
                             </div>
                        ))}
                    </div>
                </div>

                {/* Terminal Overlay */}
                <AnimatePresence>
                    {terminalLines.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="absolute bottom-0 left-0 right-0 bg-black/95 text-accent p-4 font-mono text-xs border-t border-accent z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.5)]"
                        >
                            {terminalLines.map((line, idx) => (
                                <div key={idx} className="mb-1">
                                    <span className="opacity-50 mr-2">&gt;</span>
                                    {line}
                                </div>
                            ))}
                            <div className="w-3 h-3 bg-accent inline-block animate-pulse mt-1"/>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <PaperButton 
                onClick={onExecute} 
                className="bg-ink text-paper hover:bg-accent hover:text-ink font-bold border-2 border-transparent shadow-xl"
                size="lg"
            >
                <Play className="w-4 h-4 mr-2 fill-current" />
                [ EXECUTE_RENDER_PIPELINE ]
            </PaperButton>
        </div>
    );
};

export default MermaidSolutions;
