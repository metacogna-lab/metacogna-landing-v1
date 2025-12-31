
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Database, AlertCircle } from 'lucide-react';
import { metacognaProfile } from '../data/profile';

interface HubspotTerminalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const HubspotTerminal: React.FC<HubspotTerminalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        interest: 'just_browsing',
        position: 'founder',
        objective: ''
    });
    const [status, setStatus] = useState<'idle' | 'transmitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('transmitting');

        // Mocking Network Delay and API Call
        setTimeout(async () => {
            const payload = {
                ...formData,
                timestamp: new Date().toISOString(),
                requestedAsset: "METACOGNA_PROSPECTUS_PDF_V2025",
                profileContext: {
                    contact: metacognaProfile.contact.email,
                    services_count: metacognaProfile.services.technical.length + 
                                  metacognaProfile.services.executiveOps.length + 
                                  metacognaProfile.services.solutionsDesign.length
                }
            };

            console.log("/// UPLINK ESTABLISHED ///");
            console.log("PAYLOAD DISPATCHED TO HUBSPOT:", payload);
            console.log("PDF GENERATION TRIGGERED FOR:", formData.email);

            // Trigger Client-Side Generation
            try {
                const { generateProspectusPDF } = await import('../services/pdfGenerator');
                await generateProspectusPDF();
            } catch (err) {
                console.error("PDF Generation Failed:", err);
            }

            setStatus('success');
            
            setTimeout(() => {
                onSuccess();
                setStatus('idle');
                setFormData({ 
                    name: '', 
                    email: '', 
                    interest: 'just_browsing',
                    position: 'founder',
                    objective: ''
                });
            }, 800);
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Terminal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative z-10 w-full max-w-lg bg-paper border-2 border-ink shadow-hard overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-ink text-paper px-4 py-2 flex items-center justify-between border-b-2 border-ink flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-accent" />
                                <span className="font-mono text-xs font-bold tracking-widest uppercase">
                                    Requisition Form: PDF Export // V.2025
                                </span>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 relative overflow-y-auto custom-scrollbar">
                            {/* Background Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />

                            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <label className="block font-mono text-xs font-bold uppercase text-gray-500 mb-1 group-focus-within:text-ink transition-colors">
                                            Identification Tag (Name)
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-transparent border-b-2 border-gray-300 font-mono text-lg py-2 text-ink focus:outline-none focus:border-ink transition-colors placeholder-gray-300"
                                            placeholder="Ex: Agent Smith"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <label className="block font-mono text-xs font-bold uppercase text-gray-500 mb-1 group-focus-within:text-ink transition-colors">
                                            Comms Channel (Email)
                                        </label>
                                        <input 
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-transparent border-b-2 border-gray-300 font-mono text-lg py-2 text-ink focus:outline-none focus:border-ink transition-colors placeholder-gray-300"
                                            placeholder="Ex: smith@matrix.sys"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative group">
                                            <label className="block font-mono text-xs font-bold uppercase text-gray-500 mb-1 group-focus-within:text-ink transition-colors">
                                                Operative Rank (Position)
                                            </label>
                                            <select 
                                                value={formData.position}
                                                onChange={e => setFormData({...formData, position: e.target.value})}
                                                className="w-full bg-transparent border-b-2 border-gray-300 font-mono text-sm py-2.5 text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer appearance-none rounded-none"
                                            >
                                                <option value="founder">Founder / Co-Founder</option>
                                                <option value="c_suite">C-Suite (CEO, CTO, COO)</option>
                                                <option value="vp_director">VP / Director</option>
                                                <option value="manager">Manager / Lead</option>
                                                <option value="individual">Individual Contributor</option>
                                                <option value="other">Other Entity</option>
                                            </select>
                                            <div className="absolute right-0 bottom-3 pointer-events-none text-xs text-ink font-bold">
                                                ▼
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <label className="block font-mono text-xs font-bold uppercase text-gray-500 mb-1 group-focus-within:text-ink transition-colors">
                                                Current Status (Interest)
                                            </label>
                                            <select 
                                                value={formData.interest}
                                                onChange={e => setFormData({...formData, interest: e.target.value})}
                                                className="w-full bg-transparent border-b-2 border-gray-300 font-mono text-sm py-2.5 text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer appearance-none rounded-none"
                                            >
                                                <option value="just_browsing">Just Browsing (Recon)</option>
                                                <option value="ready_to_build">Ready to Build (Action)</option>
                                                <option value="crisis_mode">Crisis Mode (Emergency)</option>
                                            </select>
                                            <div className="absolute right-0 bottom-3 pointer-events-none text-xs text-ink font-bold">
                                                ▼
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="block font-mono text-xs font-bold uppercase text-gray-500 mb-1 group-focus-within:text-ink transition-colors">
                                            Mission Objective <span className="text-[10px] text-gray-400 normal-case">(Optional)</span>
                                        </label>
                                        <textarea 
                                            value={formData.objective}
                                            onChange={e => setFormData({...formData, objective: e.target.value})}
                                            className="w-full bg-transparent border-2 border-gray-300 font-mono text-sm py-2 px-3 text-ink focus:outline-none focus:border-ink transition-colors placeholder-gray-300 min-h-[100px] resize-y"
                                            placeholder="Ex: Reduce entropy, Scale rapidly... (Tell us more about your goals)"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed border-ink/30">
                                    <button 
                                        type="submit"
                                        disabled={status === 'transmitting'}
                                        className="w-full bg-ink text-paper font-mono font-bold py-4 text-sm uppercase tracking-widest border-2 border-transparent hover:bg-accent hover:text-ink hover:border-ink transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3 shadow-hard"
                                    >
                                        {status === 'transmitting' ? (
                                            <>
                                                <span className="animate-pulse">ESTABLISHING UPLINK...</span>
                                            </>
                                        ) : (
                                            <>
                                                [ TRANSMIT_DATA ] <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="text-center">
                                    <p className="font-mono text-[10px] text-gray-400">
                                        SECURE TRANSMISSION // SSL ENCRYPTED // NO SPAM PROTOCOLS
                                    </p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HubspotTerminal;
