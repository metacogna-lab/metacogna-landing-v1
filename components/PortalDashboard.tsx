import React, { useEffect, useState } from 'react';
import { fetchUpdates } from '../services/portalService';
import { PortalUpdate, UserRole } from '../types';
import { PaperButton, PaperCard } from './PaperComponents';
import UpdateCard from './UpdateCard';
import { RefreshCw, User, Bell, Layout, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface PortalDashboardProps {
    user: string;
    role: UserRole;
    onLogout: () => void;
}

const PortalDashboard: React.FC<PortalDashboardProps> = ({ user, role, onLogout }) => {
    const [updates, setUpdates] = useState<PortalUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastLogin, setLastLogin] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');

    // Load Data
    const loadData = async () => {
        setLoading(true);
        const allData = await fetchUpdates();
        
        // Role Filtering
        const filtered = allData.filter(u => {
            if (role === 'client') return u.visibility === 'client' || u.visibility === 'both';
            return true; // Associates see everything
        });

        // Sort: Latest first
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUpdates(filtered);
        setLoading(false);
    };

    useEffect(() => {
        // "What Changed" Logic
        const storedLastLogin = localStorage.getItem('last_portal_visit');
        setLastLogin(storedLastLogin || new Date().toISOString());
        
        loadData();

        return () => {
            // Update last visit on unmount
            localStorage.setItem('last_portal_visit', new Date().toISOString());
        };
    }, []);

    // Helper: Check if update is new since last login
    const isNew = (updateDate: string) => {
        if (!lastLogin) return false;
        const compDate = updateDate; 
        return new Date(compDate).getTime() > new Date(lastLogin).getTime();
    };

    // Derived Lists for UI Sections
    const displayUpdates = filterType === 'all' ? updates : updates.filter(u => u.type === filterType);
    const newCount = updates.filter(u => isNew(u.updatedAt || u.date)).length;

    // Summaries
    const latestDecision = updates.find(u => u.type === 'decision');
    const criticalRisks = updates.filter(u => u.type === 'risk' && u.priority === 'critical');

    return (
        <div className="min-h-screen bg-surface font-sans text-ink pb-20">
            {/* Header */}
            <header className="bg-ink text-paper h-16 border-b-4 border-accent flex items-center justify-between px-6 sticky top-0 z-40 shadow-hard">
                <div className="flex items-center gap-3">
                    <Layout className="w-5 h-5 text-accent" />
                    <span className="font-mono font-bold tracking-widest text-lg hidden md:inline">PORTAL.METACOGNA</span>
                    <span className="font-mono text-xs text-gray-400 px-2 border border-gray-600 rounded uppercase">
                        {role === 'client' ? 'Client_View' : 'Lab_Associate'}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <User className="w-3 h-3" /> {user}
                    </div>
                    <button onClick={onLogout} className="hover:text-red-400">LOGOUT</button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                
                {/* Dashboard Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b-2 border-ink pb-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold mb-1">
                            {role === 'client' ? 'Project Status' : 'Lab Operations'}
                        </h1>
                        <p className="font-mono text-xs text-gray-500 flex items-center gap-2">
                            {newCount > 0 ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <Bell className="w-3 h-3" /> {newCount} UPDATES SINCE LAST VISIT
                                </span>
                            ) : (
                                "/// NO NEW SIGNALS"
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {['all', 'progress', 'decision', 'risk'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-3 py-1 font-mono text-xs border border-ink transition-all uppercase ${
                                    filterType === t ? 'bg-ink text-paper' : 'bg-transparent hover:bg-gray-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                        <PaperButton onClick={loadData} size="sm" variant="ghost">
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        </PaperButton>
                    </div>
                </div>

                {/* Role-Specific Summary Sections */}
                {filterType === 'all' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {role === 'client' ? (
                            <>
                                <PaperCard className="h-full border-l-4 border-l-blue-500 relative" noPadding>
                                    <div className="bg-surface border-b border-ink px-4 py-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        <h3 className="font-bold font-serif text-sm uppercase tracking-wider">Latest Decision</h3>
                                    </div>
                                    <div className="p-4">
                                        {latestDecision ? (
                                            <>
                                                <div className="font-bold text-lg mb-2">{latestDecision.title}</div>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{latestDecision.content}</p>
                                                <div className="text-xs font-mono text-gray-400">{new Date(latestDecision.date).toLocaleDateString()}</div>
                                            </>
                                        ) : <div className="text-gray-400 font-mono text-xs py-4">NO RECORDED DECISIONS</div>}
                                    </div>
                                </PaperCard>

                                <PaperCard className="h-full border-l-4 border-l-red-500 relative" noPadding>
                                    <div className="bg-surface border-b border-ink px-4 py-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <h3 className="font-bold font-serif text-sm uppercase tracking-wider">Risk Assessment</h3>
                                    </div>
                                     <div className="p-4 flex items-center justify-between h-full">
                                        <div>
                                            <div className="text-4xl font-bold text-ink mb-1">{criticalRisks.length}</div>
                                            <div className="text-xs font-mono text-gray-500 uppercase">Critical Items</div>
                                        </div>
                                        {criticalRisks.length === 0 && (
                                            <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 border border-emerald-200">
                                                STATUS: NOMINAL
                                            </div>
                                        )}
                                     </div>
                                </PaperCard>
                            </>
                        ) : (
                             <>
                                <PaperCard className="h-full border-l-4 border-l-emerald-500" noPadding>
                                     <div className="bg-surface border-b border-ink px-4 py-2 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-emerald-600" />
                                        <h3 className="font-bold font-serif text-sm uppercase tracking-wider">Associate Tasks</h3>
                                     </div>
                                     <div className="p-6 text-gray-400 font-mono text-sm italic text-center">
                                        /// QUEUE EMPTY
                                     </div>
                                </PaperCard>
                                <PaperCard className="h-full" noPadding>
                                     <div className="bg-surface border-b border-ink px-4 py-2 flex items-center gap-2">
                                        <Layout className="w-4 h-4 text-gray-600" />
                                        <h3 className="font-bold font-serif text-sm uppercase tracking-wider">System Health</h3>
                                     </div>
                                     <div className="p-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-mono text-gray-500">API LATENCY</span>
                                            <span className="font-bold text-emerald-600 text-xs">24ms</span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-1.5 mb-4">
                                            <div className="bg-emerald-500 h-full w-[98%]"></div>
                                        </div>
                                        <div className="text-xs font-mono text-gray-400 text-right">UPTIME: 99.9%</div>
                                     </div>
                                </PaperCard>
                             </>
                        )}
                    </div>
                )}

                {/* Main Feed */}
                <div className="space-y-6 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300 md:left-8 -z-10"></div>

                    {loading ? (
                        <div className="p-12 text-center font-mono text-gray-400">LOADING_NEURAL_STATE...</div>
                    ) : displayUpdates.length === 0 ? (
                        <div className="p-12 text-center font-mono text-gray-400 bg-paper border border-dashed border-gray-300">
                            NO UPDATES FOUND FOR FILTER "{filterType.toUpperCase()}"
                        </div>
                    ) : (
                        displayUpdates.map((update) => (
                            <div key={update.id} className="pl-8 md:pl-16 relative">
                                {/* Timeline Dot */}
                                <div className={`absolute left-[13px] md:left-[29px] top-6 w-2.5 h-2.5 rounded-full border border-ink z-10 ${
                                    isNew(update.updatedAt || update.date) ? 'bg-emerald-500' : 'bg-paper'
                                }`}></div>
                                
                                <UpdateCard 
                                    update={update} 
                                    currentUser={user}
                                    isNew={isNew(update.updatedAt || update.date)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default PortalDashboard;