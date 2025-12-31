import React, { useEffect, useState, useRef } from 'react';
import { fetchUpdates, fetchGoals, fetchToolLinks, searchPortal, fetchStatus, fetchLinearTasks, fetchNotionPages, fetchOrgMatrix, startSso } from '../services/portalService';
import { PortalUpdate, PortalGoal, UserRole, ToolLinkResponse, SearchResult, StatusResponse, LinearTask, NotionPage, OrgMatrixRow } from '../types';
import { PaperButton, PaperCard } from './PaperComponents';
import UpdateCard from './UpdateCard';
import { RefreshCw, User, Bell, Layout, AlertTriangle, CheckCircle, Activity, ExternalLink, Search as SearchIcon } from 'lucide-react';

interface PortalDashboardProps {
    user: string;
    role: UserRole;
    onLogout: () => void;
}

const PortalDashboard: React.FC<PortalDashboardProps> = ({ user, role, onLogout }) => {
    const [updates, setUpdates] = useState<PortalUpdate[]>([]);
    const [goals, setGoals] = useState<PortalGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastLogin, setLastLogin] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');
    const [toolLinks, setToolLinks] = useState<ToolLinkResponse>({});
    const [portalStatus, setPortalStatus] = useState<StatusResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLatency, setSearchLatency] = useState(0);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const searchDebounce = useRef<number | null>(null);
    const [linearTasks, setLinearTasks] = useState<LinearTask[]>([]);
    const [notionPages, setNotionPages] = useState<NotionPage[]>([]);
    const [orgMatrix, setOrgMatrix] = useState<OrgMatrixRow[]>([]);
    const [ssoLoading, setSsoLoading] = useState<string | null>(null);
    const [ssoMessage, setSsoMessage] = useState<string | null>(null);

    // Load Data
    const loadData = async () => {
        setLoading(true);
        const [allData, goalData, taskData, pageData, matrixData] = await Promise.all([
            fetchUpdates(),
            fetchGoals(),
            fetchLinearTasks().catch((err) => {
                console.warn('PORTAL: linear tasks failed', err);
                return [];
            }),
            fetchNotionPages().catch((err) => {
                console.warn('PORTAL: notion pages failed', err);
                return [];
            }),
            fetchOrgMatrix().catch((err) => {
                console.warn('PORTAL: org matrix failed', err);
                return [];
            })
        ]);
        
        // Role Filtering
        const filtered = allData.filter(u => {
            if (role === 'client') return u.visibility === 'client' || u.visibility === 'both';
            return true; // Associates see everything
        });

        // Sort: Latest first
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUpdates(filtered);
        setGoals(goalData);
        setLinearTasks(taskData);
        setNotionPages(pageData);
        setOrgMatrix(matrixData);
        setLoading(false);
    };

    useEffect(() => {
        // "What Changed" Logic
        const storedLastLogin = localStorage.getItem('last_portal_visit');
        setLastLogin(storedLastLogin || new Date().toISOString());
        
        loadData();
        const init = async () => {
            try {
                const [links, status] = await Promise.all([fetchToolLinks(), fetchStatus()]);
                setToolLinks(links);
                setPortalStatus(status);
            } catch (err) {
                console.warn('PORTAL: bootstrap extras failed', err);
            }
        };
        init();

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

    // Goal Metrics
    const onTrackGoals = goals.filter(g => g.status === 'on_track');
    const atRiskGoals = goals.filter(g => g.status === 'at_risk');
    const blockedGoals = goals.filter(g => g.status === 'blocked');
    const avgProgress = goals.length ? Math.round((goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) * 100) : 0;
    const latestGoalSync = goals.reduce((latest, g) => {
        if (!g.lastSync) return latest;
        const ts = new Date(g.lastSync).getTime();
        if (ts > latest) return ts;
        return latest;
    }, 0);
    const lastSyncLabel = latestGoalSync ? new Date(latestGoalSync).toLocaleString() : 'n/a';

    // Summaries
    const latestDecision = updates.find(u => u.type === 'decision');
    const criticalRisks = updates.filter(u => u.type === 'risk' && u.priority === 'critical');
    const highlightedGoals = goals.slice(0, 3);

    const statusBadgeStyle = (status: PortalGoal['status']) => {
        switch (status) {
            case 'on_track':
                return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            case 'at_risk':
                return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'blocked':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'done':
                return 'bg-slate-100 text-slate-700 border-slate-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }
        if (!value.trim()) {
            setSearchResults([]);
            setSearchLatency(0);
            return;
        }
        setSearchLoading(true);
        searchDebounce.current = window.setTimeout(async () => {
            try {
                const result = await searchPortal(value);
                setSearchResults(result.results);
                setSearchLatency(result.latencyMs);
            } catch (err) {
                console.warn('PORTAL: Search failed', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
    };

    const statusChipClass = (status: 'healthy' | 'delayed' | 'failing') => {
        switch (status) {
            case 'healthy':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'delayed':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'failing':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleSsoLaunch = async (provider: string) => {
        setSsoLoading(provider);
        setSsoMessage(null);
        try {
            const result = await startSso(provider);
            window.open(result.url, '_blank', 'noopener');
            setSsoMessage(`${provider.toUpperCase()} SSO launched.`);
        } catch (err) {
            console.error('SSO launch failed', err);
            setSsoMessage(`Unable to start ${provider} SSO. Using fallback link.`);
            const fallback = (toolLinks as any)?.[provider];
            if (fallback) window.open(fallback, '_blank', 'noopener');
        } finally {
            setSsoLoading(null);
        }
    };

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

                {/* SSO Launcher & Search */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em]">Unified Search</label>
                            <div className="relative mt-2">
                                <div className="flex items-center border-2 border-ink bg-paper shadow-hard-sm px-3 py-2">
                                    <SearchIcon className="w-4 h-4 text-gray-500 mr-2" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onFocus={() => setShowSearchPanel(true)}
                                        onBlur={() => setTimeout(() => setShowSearchPanel(false), 150)}
                                        placeholder="Search goals, risks, decisions..."
                                        className="flex-1 bg-transparent focus:outline-none font-mono text-sm"
                                    />
                                    {searchLoading && <span className="font-mono text-[0.6rem] text-gray-500">SCANNING...</span>}
                                    {!searchLoading && searchLatency > 0 && (
                                        <span className="font-mono text-[0.6rem] text-gray-500">{searchLatency} ms</span>
                                    )}
                                </div>
                                {showSearchPanel && searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 bg-paper border-2 border-ink border-t-0 shadow-hard-sm z-20">
                                        {searchResults.map(result => (
                                            <a
                                                key={result.id}
                                                href={result.url || '#'}
                                                target={result.url ? '_blank' : undefined}
                                                rel="noreferrer"
                                                className="block px-4 py-3 border-b border-dashed border-ink/30 hover:bg-accent/20 text-sm"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">{result.title}</span>
                                                    <span className="font-mono text-[0.6rem] uppercase text-gray-500">{result.source}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{result.snippet}</p>
                                            </a>
                                        ))}
                                        <div className="px-4 py-2 text-[0.6rem] font-mono text-gray-500">
                                            Showing {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:w-64">
                            <label className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em]">SSO Launcher</label>
                            <div className="flex gap-2 mt-2">
                                {['notion', 'linear', 'github'].map(tool => {
                                    const label = tool.charAt(0).toUpperCase() + tool.slice(1);
                                    const hasLink = Boolean((toolLinks as any)?.[tool]);
                                    return (
                                        <button
                                            key={tool}
                                            type="button"
                                            onClick={() => handleSsoLaunch(tool)}
                                            disabled={!hasLink || ssoLoading === tool}
                                            className={`flex-1 border-2 border-ink bg-paper shadow-hard-sm px-3 py-2 flex flex-col gap-1 transition-colors ${hasLink ? 'hover:bg-accent/20' : 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            <span className="font-serif text-sm capitalize flex items-center gap-2 justify-between">
                                                {label}
                                                {ssoLoading === tool && <span className="font-mono text-[0.6rem] text-gray-500">...</span>}
                                            </span>
                                            <span className="font-mono text-[0.6rem] text-gray-500 flex items-center gap-1">
                                                Launch <ExternalLink className="w-3 h-3" />
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {ssoMessage && (
                                <p className="mt-2 font-mono text-[0.65rem] text-gray-600">{ssoMessage}</p>
                            )}
                        </div>
                    </div>
                    {portalStatus?.ingestion && (
                        <div className="flex flex-wrap gap-2">
                            {portalStatus.ingestion.map(service => (
                                <div key={service.service} className={`px-3 py-1 border text-xs font-mono ${statusChipClass(service.status)}`}>
                                    {service.service}: {service.status.toUpperCase()} — {new Date(service.lastSync).toLocaleTimeString()}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
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

                {/* Goal Overview */}
                <section className="mb-10 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <PaperCard noPadding className="border-l-4 border-l-emerald-500">
                            <div className="px-4 py-3 border-b border-ink flex items-center justify-between">
                                <span className="font-mono text-xs text-gray-500 uppercase">On Track</span>
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="p-4">
                                <div className="text-4xl font-bold text-ink">{onTrackGoals.length}</div>
                                <p className="text-xs font-mono text-gray-500 mt-1">Goals running hot</p>
                            </div>
                        </PaperCard>
                        <PaperCard noPadding className="border-l-4 border-l-amber-500">
                            <div className="px-4 py-3 border-b border-ink flex items-center justify-between">
                                <span className="font-mono text-xs text-gray-500 uppercase">At Risk</span>
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="p-4">
                                <div className="text-4xl font-bold text-ink">{atRiskGoals.length}</div>
                                <p className="text-xs font-mono text-gray-500 mt-1">Needs intervention</p>
                            </div>
                        </PaperCard>
                        <PaperCard noPadding className="border-l-4 border-l-slate-500">
                            <div className="px-4 py-3 border-b border-ink flex items-center justify-between">
                                <span className="font-mono text-xs text-gray-500 uppercase">Avg Progress</span>
                                <Activity className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="p-4">
                                <div className="text-4xl font-bold text-ink">{avgProgress}%</div>
                                <p className="text-xs font-mono text-gray-500 mt-1">Across {goals.length || '0'} goals</p>
                            </div>
                        </PaperCard>
                    </div>
                    <PaperCard className="border-dashed border-ink">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em]">Strategic Goals</p>
                                    <h2 className="font-serif text-2xl">High Signal Worklist</h2>
                                </div>
                                <p className="font-mono text-[0.65rem] text-gray-500">Last sync: {lastSyncLabel}</p>
                            </div>
                            {highlightedGoals.length === 0 ? (
                                <div className="text-sm font-mono text-gray-500">No goals available.</div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-3">
                                    {highlightedGoals.map(goal => (
                                        <div key={goal.id} className="border-2 border-ink p-4 flex flex-col gap-3 bg-paper shadow-hard-sm">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-serif text-lg">{goal.title}</h3>
                                                <span className={`text-[0.6rem] font-mono px-2 py-0.5 border ${statusBadgeStyle(goal.status)}`}>
                                                    {goal.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-3">{goal.description}</p>
                                            <div>
                                                <div className="flex justify-between text-xs font-mono mb-1 text-gray-500">
                                                    <span>{Math.round(goal.progress * 100)}%</span>
                                                    <span>Owner: {goal.owner}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200">
                                                    <div className={`h-full ${goal.status === 'blocked' ? 'bg-red-500' : goal.status === 'at_risk' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${goal.progress * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-[0.65rem] font-mono text-gray-500">
                                                {goal.dueDate && <span>Due {new Date(goal.dueDate).toLocaleDateString()}</span>}
                                                {goal.notionUrl && <a href={goal.notionUrl} target="_blank" rel="noreferrer" className="underline">Notion</a>}
                                                {goal.linearUrl && <a href={goal.linearUrl} target="_blank" rel="noreferrer" className="underline">Linear</a>}
                                                {goal.githubUrl && <a href={goal.githubUrl} target="_blank" rel="noreferrer" className="underline">GitHub</a>}
                                            </div>
                                            {goal.projectName && (
                                                <p className="text-xs text-gray-500 font-mono">Project: {goal.projectName}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PaperCard>
                    <PaperCard noPadding className="border border-ink">
                        <div className="px-4 py-3 border-b border-ink flex items-center justify-between">
                            <div>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em]">Goal Registry</p>
                                <h3 className="font-serif text-xl">Portfolio Overview</h3>
                            </div>
                            <span className="font-mono text-xs text-gray-500">{goals.length} goals tracked</span>
                        </div>
                        <div className="overflow-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-surface border-b border-ink">
                                    <tr className="text-left">
                                        <th className="px-4 py-2 font-mono text-xs uppercase">Goal</th>
                                        <th className="px-4 py-2 font-mono text-xs uppercase">Project</th>
                                        <th className="px-4 py-2 font-mono text-xs uppercase">Owner</th>
                                        <th className="px-4 py-2 font-mono text-xs uppercase">Status</th>
                                        <th className="px-4 py-2 font-mono text-xs uppercase">Due</th>
                                        <th className="px-4 py-2 font-mono text-xs uppercase text-right">Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {goals.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-3 text-center text-xs text-gray-500 font-mono">No goals available.</td>
                                        </tr>
                                    ) : (
                                        goals.map(goal => (
                                            <tr key={goal.id} className="border-b border-dashed border-ink/30">
                                                <td className="px-4 py-3 font-semibold">{goal.title}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{goal.projectName || '—'}</td>
                                                <td className="px-4 py-3 text-xs font-mono text-gray-600">{goal.owner}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <span className={`px-2 py-0.5 border ${statusBadgeStyle(goal.status)}`}>{goal.status.replace('_', ' ').toUpperCase()}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : '—'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600 text-right font-mono">{Math.round(goal.progress * 100)}%</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </PaperCard>
                </section>

                {/* Org Matrix */}
                <section className="mb-10">
                    <PaperCard noPadding className="border border-ink">
                        <div className="px-4 py-3 border-b border-ink flex items-center justify-between">
                            <div>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em]">Team Directory</p>
                                <h3 className="font-serif text-xl">People & Projects</h3>
                            </div>
                            <span className="font-mono text-xs text-gray-500">{orgMatrix.length} members</span>
                        </div>
                        <div className="overflow-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-surface border-b border-ink">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-mono text-xs uppercase">Member</th>
                                        <th className="px-4 py-2 text-left font-mono text-xs uppercase">Role</th>
                                        <th className="px-4 py-2 text-left font-mono text-xs uppercase">Team</th>
                                        <th className="px-4 py-2 text-left font-mono text-xs uppercase">Project</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgMatrix.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-4 text-center text-xs font-mono text-gray-500">Org matrix unavailable.</td>
                                        </tr>
                                    ) : (
                                        orgMatrix.map(row => (
                                            <tr key={`${row.member}-${row.team}`} className="border-b border-dashed border-ink/30">
                                                <td className="px-4 py-3 font-semibold">{row.member}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600">{row.role || '—'}</td>
                                                <td className="px-4 py-3 text-xs font-mono text-gray-500">{row.team || '—'}</td>
                                                <td className="px-4 py-3 text-xs font-mono text-gray-500">{row.project || '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </PaperCard>
                </section>

                {/* Execution + Knowledge */}
                <section className="mb-10 grid gap-6 md:grid-cols-2">
                    <PaperCard className="h-full" noPadding>
                        <div className="px-4 py-3 border-b border-ink flex items-center justify-between">
                            <div>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em]">Linear Tasks</p>
                                <h3 className="font-serif text-xl">Active Work Queue</h3>
                            </div>
                            <span className="font-mono text-xs text-gray-500">{linearTasks.length} tracked</span>
                        </div>
                        <div className="divide-y divide-dashed divide-ink/30">
                            {linearTasks.length === 0 ? (
                                <div className="p-6 text-sm font-mono text-gray-500">No open tasks pulled from Linear.</div>
                            ) : (
                                linearTasks.slice(0, 6).map(task => (
                                    <a
                                        key={task.id}
                                        href={task.url || '#'}
                                        target={task.url ? '_blank' : undefined}
                                        rel="noreferrer"
                                        className="block px-4 py-4 hover:bg-accent/20 transition-colors"
                                    >
                                        <div className="flex justify-between items-center gap-3">
                                            <p className="font-semibold">{task.title}</p>
                                            <span className="font-mono text-[0.65rem] px-2 py-0.5 border border-ink/40 uppercase">
                                                {task.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
                                            <span>{task.assignee || 'Unassigned'}</span>
                                            {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </PaperCard>
                    <PaperCard className="h-full" noPadding>
                        <div className="px-4 py-3 border-b border-ink flex items-center justify-between">
                            <div>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em]">Notion Docs</p>
                                <h3 className="font-serif text-xl">Latest Briefs & Notes</h3>
                            </div>
                            <span className="font-mono text-xs text-gray-500">{notionPages.length} entries</span>
                        </div>
                        <div className="divide-y divide-dashed divide-ink/30">
                            {notionPages.length === 0 ? (
                                <div className="p-6 text-sm font-mono text-gray-500">No recent Notion pages synced.</div>
                            ) : (
                                notionPages.slice(0, 6).map(page => (
                                    <a
                                        key={page.id}
                                        href={page.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block px-4 py-4 hover:bg-accent/20 transition-colors"
                                    >
                                        <p className="font-semibold">{page.title}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-1">
                                            Updated {page.lastEditedTime ? new Date(page.lastEditedTime).toLocaleString() : 'unknown'}
                                        </p>
                                    </a>
                                ))
                            )}
                        </div>
                    </PaperCard>
                </section>

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
