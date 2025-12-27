
import React, { useEffect, useState } from 'react';
import { PortalUpdate } from '../types';
import { fetchUpdates } from '../services/portalService';
import { PaperCard, PaperBadge } from './PaperComponents';
import { CheckCircle, Loader } from 'lucide-react';

const DecisionLog: React.FC = () => {
    const [decisions, setDecisions] = useState<PortalUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await fetchUpdates();
            // Filter only decisions
            setDecisions(data.filter(u => u.type === 'decision'));
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="p-12 flex justify-center"><Loader className="animate-spin text-ink" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-b-2 border-ink pb-4">
                <h1 className="font-serif text-3xl font-bold">Decision Log</h1>
                <p className="font-mono text-gray-500 mt-2 text-sm">
                    /// ORIENTATION ONLY - NOT FOR DEBATE
                </p>
            </div>

            <div className="grid gap-4">
                {decisions.length === 0 && (
                    <div className="p-8 text-center text-gray-400 font-mono">No formalized decisions recorded yet.</div>
                )}
                {decisions.map(d => (
                    <PaperCard key={d.id} noPadding className="flex flex-col md:flex-row">
                        <div className="bg-surface p-4 border-b md:border-b-0 md:border-r border-ink w-full md:w-48 flex-shrink-0 flex flex-col justify-center">
                            <span className="font-mono text-xs text-gray-500 mb-1">{d.date}</span>
                            <div className="flex items-center gap-2">
                                <PaperBadge color={d.confidence === 'high' ? 'emerald' : 'orange'}>
                                    {d.confidence} Conf
                                </PaperBadge>
                            </div>
                        </div>
                        <div className="p-6 flex-1">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                {d.title}
                            </h3>
                            <p className="text-gray-700 text-sm leading-relaxed">{d.content}</p>
                        </div>
                    </PaperCard>
                ))}
            </div>
        </div>
    );
};

export default DecisionLog;
