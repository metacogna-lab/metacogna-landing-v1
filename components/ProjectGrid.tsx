import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PaperCard, PaperButton, PaperBadge, PaperModal, PaperInput, PaperTextArea, PaperSelect } from './PaperComponents';
import { Project } from '../types';
import { ArrowRight, Plus, Edit2, Trash2, Settings, Save, Github, Network, Globe, Lock, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'compilar',
    title: 'Compilar',
    description: 'A structured analysis and graphical representation of over 20 years of research into group dynamics, grounded in PILAR theory. Compilar makes invisible coordination forces visible—without prescribing how groups should behave.',
    status: 'beta',
    tags: ['Sociology', 'Graph Theory', 'PILAR'],
    githubUrl: 'https://github.com/metacogna-lab/compilar'
  },
  {
    id: 'neural-shadow',
    title: 'Neural Shadow',
    description: 'An adversarial honeypot for intelligent agents. Neural Shadow explores how AI systems behave under pressure, deception, and constraint—designed to surface failure modes before they matter.',
    status: 'concept',
    tags: ['Security', 'AI Agents', 'Adversarial'],
    githubUrl: 'https://github.com/metacogna-lab/neural-shadow'
  },
  {
    id: 'timeless-love',
    title: 'Timeless Love',
    description: 'A grounded, human product focused on memory, legacy, and connection across generations. Proof that not all meaningful technology needs to be complex to be profound.',
    status: 'active',
    tags: ['Human', 'Memory', 'Legacy'],
    webUrl: 'https://timelesslove.ai'
  }
];

const EMPTY_PROJECT: Project = {
    id: '',
    title: '',
    description: '',
    status: 'concept',
    tags: []
};

// --- Knowledge Graph Ontology ---

interface GraphNode {
    id: string;
    label: string;
    group: 'core' | 'tech' | 'design' | 'strategy' | 'ai' | 'product';
    radius: number;
    level: 0 | 1 | 2; // Hierarchy level for concentric layout
    desc: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface GraphLink {
    source: string;
    target: string;
    type: 'hierarchical' | 'cross';
}

// 1. Define the Logical Schema
const SCHEMA_NODES: Omit<GraphNode, 'x' | 'y' | 'vx' | 'vy'>[] = [
    // LEVEL 0: The Central Hub
    { id: 'meta', label: 'METACOGNA', group: 'core', radius: 45, level: 0, desc: 'Central Intelligence. Aggregation of signal.' },

    // LEVEL 1: Core Domains
    { id: 'ai', label: 'AI RESEARCH', group: 'ai', radius: 32, level: 1, desc: 'Synthetic Cognition & Agentic Behaviors.' },
    { id: 'eng', label: 'ENGINEERING', group: 'tech', radius: 32, level: 1, desc: 'Robust Infrastructure & Execution.' },
    { id: 'des', label: 'DESIGN', group: 'design', radius: 32, level: 1, desc: 'Human-Computer Interface & Aesthetics.' },
    { id: 'prod', label: 'PRODUCT', group: 'product', radius: 32, level: 1, desc: 'Value Synthesis & Utility.' },
    { id: 'strat', label: 'STRATEGY', group: 'strategy', radius: 32, level: 1, desc: 'Systems Thinking & First Principles.' },

    // LEVEL 2: High Frequency Entities
    // AI Branch
    { id: 'llm', label: 'LLMs', group: 'ai', radius: 24, level: 2, desc: 'Generative Language Models.' },
    { id: 'agents', label: 'AGENTS', group: 'ai', radius: 24, level: 2, desc: 'Autonomous Goal-Seeking Units.' },
    { id: 'adv', label: 'ADVERSARIAL', group: 'ai', radius: 24, level: 2, desc: 'Red Teaming & Security.' },
    { id: 'ml', label: 'ML', group: 'ai', radius: 20, level: 2, desc: 'Machine Learning Foundations.' },

    // Engineering Branch
    { id: 'graph', label: 'GRAPH THEORY', group: 'tech', radius: 24, level: 2, desc: 'Relational Data Structures.' },
    { id: 'vec', label: 'VECTOR DB', group: 'tech', radius: 24, level: 2, desc: 'Semantic High-Dimensional Storage.' },
    { id: 'react', label: 'REACT', group: 'tech', radius: 20, level: 2, desc: 'View Layer Library.' },
    { id: 'edge', label: 'EDGE', group: 'tech', radius: 20, level: 2, desc: 'Distributed Compute.' },

    // Design Branch
    { id: 'ux', label: 'UX SYSTEMS', group: 'design', radius: 24, level: 2, desc: 'User Experience Patterns.' },
    { id: 'neo', label: 'NEO-BRUTALISM', group: 'design', radius: 20, level: 2, desc: 'Raw, Honest UI Aesthetic.' },

    // Product Branch
    { id: 'mem', label: 'MEMORY', group: 'product', radius: 24, level: 2, desc: 'Long-term Context & Legacy.' },
    { id: 'legacy', label: 'LEGACY', group: 'product', radius: 20, level: 2, desc: 'Digital Afterlife.' },

    // Strategy Branch
    { id: 'soc', label: 'SOCIOLOGY', group: 'strategy', radius: 24, level: 2, desc: 'Group Dynamics Analysis.' },
    { id: 'anal', label: 'ANALYSIS', group: 'strategy', radius: 24, level: 2, desc: 'Data Interpretation.' },
    { id: 'sys', label: 'SYSTEMS', group: 'strategy', radius: 20, level: 2, desc: 'Holistic Modeling.' },
];

const SCHEMA_LINKS: GraphLink[] = [
    // Hub -> Domains (Star Topology)
    { source: 'meta', target: 'ai', type: 'hierarchical' },
    { source: 'meta', target: 'eng', type: 'hierarchical' },
    { source: 'meta', target: 'des', type: 'hierarchical' },
    { source: 'meta', target: 'prod', type: 'hierarchical' },
    { source: 'meta', target: 'strat', type: 'hierarchical' },

    // Domains -> Entities (Cluster Topology)
    { source: 'ai', target: 'llm', type: 'hierarchical' },
    { source: 'ai', target: 'agents', type: 'hierarchical' },
    { source: 'ai', target: 'adv', type: 'hierarchical' },
    { source: 'ai', target: 'ml', type: 'hierarchical' },

    { source: 'eng', target: 'graph', type: 'hierarchical' },
    { source: 'eng', target: 'vec', type: 'hierarchical' },
    { source: 'eng', target: 'react', type: 'hierarchical' },
    { source: 'eng', target: 'edge', type: 'hierarchical' },

    { source: 'des', target: 'ux', type: 'hierarchical' },
    { source: 'des', target: 'neo', type: 'hierarchical' },

    { source: 'prod', target: 'mem', type: 'hierarchical' },
    { source: 'prod', target: 'legacy', type: 'hierarchical' },

    { source: 'strat', target: 'soc', type: 'hierarchical' },
    { source: 'strat', target: 'anal', type: 'hierarchical' },
    { source: 'strat', target: 'sys', type: 'hierarchical' },

    // Cross-Domain Connections (The Logical Web)
    { source: 'agents', target: 'soc', type: 'cross' },      // Agents mimic social dynamics
    { source: 'vec', target: 'mem', type: 'cross' },         // Vectors power memory
    { source: 'graph', target: 'soc', type: 'cross' },       // Graphs represent social networks
    { source: 'llm', target: 'ux', type: 'cross' },          // LLM as interface
    { source: 'adv', target: 'strat', type: 'cross' },       // Security is strategic
    { source: 'neo', target: 'react', type: 'cross' },       // Implementation details
    { source: 'legacy', target: 'mem', type: 'cross' },
    { source: 'sys', target: 'eng', type: 'cross' },
    { source: 'anal', target: 'ml', type: 'cross' },
];

const KnowledgeGraph: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
    
    // Calculate Neighbors for Metadata Display
    const getNeighbors = (nodeId: string) => {
        const neighbors: string[] = [];
        SCHEMA_LINKS.forEach(link => {
            if (link.source === nodeId) neighbors.push(link.target);
            if (link.target === nodeId) neighbors.push(link.source);
        });
        return SCHEMA_NODES.filter(n => neighbors.includes(n.id));
    };

    // Initialize Nodes with Schematic Positioning
    useEffect(() => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const cx = width / 2;
        const cy = height / 2;

        const initializedNodes = SCHEMA_NODES.map((n) => {
            // Initial positioning logic: Concentric Rings
            let initX = cx;
            let initY = cy;
            
            if (n.level === 1) {
                // Distribute domains in a circle
                const angle = Math.random() * Math.PI * 2;
                initX = cx + Math.cos(angle) * 150;
                initY = cy + Math.sin(angle) * 150;
            } else if (n.level === 2) {
                // Distribute entities further out
                const angle = Math.random() * Math.PI * 2;
                initX = cx + Math.cos(angle) * 280;
                initY = cy + Math.sin(angle) * 280;
            }

            return {
                ...n,
                x: initX,
                y: initY,
                vx: 0,
                vy: 0
            };
        });
        setNodes(initializedNodes);
    }, []);

    // Physics Simulation
    useEffect(() => {
        if (nodes.length === 0) return;
        
        let animationFrameId: number;
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 600;
        const cx = width / 2;
        const cy = height / 2;
        
        // Physics Constants
        const k = 0.03; // Spring stiffness
        const repulsion = 800; // Repulsion strength
        const damping = 0.88; // Friction
        const centerForce = 0.012; // Gravity to center

        const tick = () => {
            setNodes(prevNodes => {
                const nextNodes = prevNodes.map(n => ({ ...n }));

                // 1. Repulsion (Nodes push apart)
                for (let i = 0; i < nextNodes.length; i++) {
                    for (let j = i + 1; j < nextNodes.length; j++) {
                        const n1 = nextNodes[i];
                        const n2 = nextNodes[j];
                        const dx = n1.x - n2.x;
                        const dy = n1.y - n2.y;
                        const distSq = dx * dx + dy * dy || 1;
                        const dist = Math.sqrt(distSq);
                        
                        // Interaction radius varies by level
                        const interactionRadius = 400;

                        if (dist < interactionRadius) {
                            const force = repulsion / distSq;
                            const fx = (dx / dist) * force;
                            const fy = (dy / dist) * force;
                            
                            n1.vx += fx;
                            n1.vy += fy;
                            n2.vx -= fx;
                            n2.vy -= fy;
                        }
                    }
                }

                // 2. Attraction (Links pull together)
                SCHEMA_LINKS.forEach(link => {
                    const source = nextNodes.find(n => n.id === link.source);
                    const target = nextNodes.find(n => n.id === link.target);
                    if (source && target) {
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        // Hierarchical links are tighter, cross links are looser
                        const restLen = link.type === 'hierarchical' ? 100 : 180;
                        
                        const force = (dist - restLen) * k;
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;

                        source.vx += fx;
                        source.vy += fy;
                        target.vx -= fx;
                        target.vy -= fy;
                    }
                });

                // 3. Central Gravity & Boundaries
                nextNodes.forEach(n => {
                    // Stronger center pull for Level 0/1, weaker for Level 2
                    const gravity = n.level === 0 ? 0.05 : n.level === 1 ? 0.015 : 0.005;
                    
                    n.vx += (cx - n.x) * gravity;
                    n.vy += (cy - n.y) * gravity;

                    // Apply Velocity
                    n.x += n.vx;
                    n.y += n.vy;

                    // Damping
                    n.vx *= damping;
                    n.vy *= damping;

                    // Boundary constraint
                    const margin = n.radius + 10;
                    if (n.x < margin) n.vx += 2;
                    if (n.x > width - margin) n.vx -= 2;
                    if (n.y < margin) n.vy += 2;
                    if (n.y > height - margin) n.vy -= 2;
                });

                return nextNodes;
            });
            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrameId);
    }, [nodes.length]); 

    // Visual Helpers
    const getNodeColor = (group: string) => {
        switch(group) {
            case 'core': return 'bg-ink text-paper border-4 border-paper z-50';
            case 'tech': return 'bg-blue-600 text-white';
            case 'design': return 'bg-purple-600 text-white';
            case 'ai': return 'bg-accent text-ink';
            case 'strategy': return 'bg-orange-500 text-white';
            case 'product': return 'bg-rose-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const activeNode = nodes.find(n => n.id === activeNodeId);
    const activeNeighbors = activeNodeId ? getNeighbors(activeNodeId) : [];

    return (
        <div ref={containerRef} className="w-full h-[650px] bg-surface relative border-2 border-ink overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner group">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
            
            {/* SVG Lines Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {SCHEMA_LINKS.map((link, i) => {
                    const source = nodes.find(n => n.id === link.source);
                    const target = nodes.find(n => n.id === link.target);
                    if (!source || !target) return null;
                    
                    // Highlight logic
                    const isActive = activeNodeId && (link.source === activeNodeId || link.target === activeNodeId);
                    const isDimmed = activeNodeId && !isActive;

                    return (
                        <line 
                            key={i}
                            x1={source.x} 
                            y1={source.y} 
                            x2={target.x} 
                            y2={target.y} 
                            stroke={isActive ? 'var(--color-accent)' : 'var(--color-ink)'}
                            strokeWidth={isActive ? 2 : link.type === 'hierarchical' ? 1.5 : 0.5}
                            strokeOpacity={isDimmed ? 0.05 : isActive ? 1 : link.type === 'hierarchical' ? 0.2 : 0.15}
                            strokeDasharray={link.type === 'cross' ? "4 4" : "0"}
                        />
                    );
                })}
            </svg>

            {/* Nodes Layer */}
            {nodes.map(node => {
                const isActive = activeNodeId === node.id;
                const isNeighbor = activeNeighbors.some(n => n.id === node.id);
                const isHovered = hoverNodeId === node.id;
                const isDimmed = activeNodeId && !isActive && !isNeighbor;
                
                // Dynamic Sizing
                const size = isActive ? 120 : node.radius * 2;

                return (
                    <motion.div
                        key={node.id}
                        layout
                        className={`absolute rounded-full shadow-hard-sm flex items-center justify-center cursor-pointer ${getNodeColor(node.group)}`}
                        style={{ 
                            left: node.x, 
                            top: node.y,
                            x: '-50%', // Center pivot
                            y: '-50%',
                        }}
                        animate={{
                            width: size,
                            height: size,
                            opacity: isDimmed ? 0.2 : 1,
                            scale: isHovered && !isActive ? 1.1 : 1,
                            zIndex: isActive ? 60 : isNeighbor ? 50 : 10
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={(e) => { e.stopPropagation(); setActiveNodeId(isActive ? null : node.id); }}
                        onMouseEnter={() => setHoverNodeId(node.id)}
                        onMouseLeave={() => setHoverNodeId(null)}
                        drag
                        dragConstraints={containerRef}
                    >
                        <AnimatePresence mode="wait">
                             {isActive ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-center"
                                >
                                    <span className="font-bold text-2xl">{node.id.substring(0,2).toUpperCase()}</span>
                                </motion.div>
                             ) : (
                                <motion.div 
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    {(node.level < 2 || isHovered || isNeighbor) && (
                                        <span className={`font-bold uppercase tracking-tighter text-center leading-none ${node.level === 0 ? 'text-[10px]' : 'text-[8px]'}`}>
                                            {node.label}
                                        </span>
                                    )}
                                </motion.div>
                             )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
            
            {/* Active Node Metadata Panel */}
            <AnimatePresence>
                {activeNode && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-4 right-4 w-64 bg-paper border-2 border-ink shadow-hard z-50 p-4 font-mono text-xs pointer-events-none"
                    >
                        <div className="border-b-2 border-ink pb-2 mb-2 flex justify-between items-center">
                            <span className="font-bold text-lg uppercase">{activeNode.label}</span>
                            <span className="bg-ink text-paper px-1">{activeNode.group.toUpperCase()}</span>
                        </div>
                        <p className="text-gray-600 mb-4 font-sans leading-snug">
                            {activeNode.desc}
                        </p>
                        
                        <div className="border-t border-gray-200 pt-2">
                            <span className="text-gray-400 block mb-1">CONNECTED_ENTITIES:</span>
                            <div className="flex flex-wrap gap-1">
                                {activeNeighbors.map(n => (
                                    <span key={n.id} className="bg-surface border border-gray-300 px-1 text-[10px]">
                                        {n.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend / Key */}
            <div className="absolute bottom-4 left-4 bg-paper/90 backdrop-blur border border-ink p-3 shadow-hard-sm z-50 text-[10px] font-mono">
                <div className="font-bold mb-2 border-b border-gray-200 pb-1">SCHEMA_ONTOLOGY:</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 bg-ink rounded-full"></div> HUB_CORE</div>
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> STRATEGY</div>
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 bg-accent rounded-full"></div> AI_RESEARCH</div>
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> ENGINEERING</div>
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 bg-purple-600 rounded-full"></div> DESIGN_SYS</div>
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> PRODUCT</div>
                </div>
            </div>
        </div>
    );
};

interface ProjectGridProps {
    isAuthenticated: boolean;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ isAuthenticated }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isManaging, setIsManaging] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Project>(EMPTY_PROJECT);
  const [tagInput, setTagInput] = useState('');

  const handleAdminToggle = () => {
      if (!isAuthenticated) {
          setShowAuthError(true);
          setTimeout(() => setShowAuthError(false), 3000);
          return;
      }
      setIsManaging(!isManaging);
  };

  const handleEdit = (project: Project) => {
      setEditingProject(project);
      setFormData(project);
      setTagInput(project.tags.join(', '));
      setIsModalOpen(true);
  };

  const handleAddNew = () => {
      setEditingProject(null);
      setFormData({ ...EMPTY_PROJECT, id: `proj-${Date.now()}` }); 
      setTagInput('');
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this project node?')) {
          setProjects(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      const tags = tagInput.split(',').map(t => t.trim()).filter(t => t !== '');
      const projectToSave = { ...formData, tags };

      if (editingProject) {
          setProjects(prev => prev.map(p => p.id === editingProject.id ? projectToSave : p));
      } else {
          setProjects(prev => [...prev, projectToSave]);
      }
      setIsModalOpen(false);
  };

  const getBadgeColor = (status: Project['status']) => {
      switch (status) {
          case 'active': return 'emerald';
          case 'beta': return 'blue';
          default: return 'gray';
      }
  };

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="flex justify-center mb-12">
        <button 
            onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-block border-b-2 border-ink pb-1 font-mono text-sm text-ink hover:text-accent transition-colors font-bold tracking-wider cursor-pointer"
        >
            CONFUSION AWAITS &darr;
        </button>
      </div>

      <div className="mb-12 border-b-2 border-ink pb-4 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="font-serif text-4xl font-bold text-ink mb-2">Active Initiatives</h2>
          <p className="font-mono text-gray-600 dark:text-gray-400">From deeply human to deeply technical.</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsGraphOpen(true)}
                className="font-mono text-xs flex items-center gap-2 px-3 py-1 border border-ink bg-surface text-ink hover:bg-accent transition-colors shadow-sm"
            >
                <Network className="w-3 h-3" />
                VISUALIZE COMPETENCIES
            </button>
            
            <div className="relative">
                <button 
                    onClick={handleAdminToggle}
                    className={`font-mono text-xs flex items-center gap-2 px-3 py-1 border border-ink transition-colors shadow-sm ${isManaging ? 'bg-ink text-paper' : 'bg-transparent text-ink hover:bg-surface'}`}
                >
                    <Settings className="w-3 h-3" />
                    {isManaging ? 'LAB ADMIN' : 'LAB ADMIN'}
                </button>
                
                <AnimatePresence>
                    {showAuthError && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
                        >
                            <div className="bg-red-600 text-white text-xs font-mono font-bold px-3 py-2 shadow-hard border border-ink flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                ACCESS DENIED: AUTH REQUIRED
                            </div>
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-red-600 mx-auto border-b-0"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <PaperCard 
            key={project.id} 
            title={project.title}
            className="h-full hover:-translate-y-1 hover:shadow-hard-hover transition-all duration-300 relative group"
            headerAction={
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 border border-ink ${project.status === 'active' ? 'bg-accent' : project.status === 'beta' ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    {project.webUrl && (
                         <a href={project.webUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-accent transition-colors">
                            <Globe className="w-4 h-4" />
                         </a>
                    )}
                    {project.githubUrl && (
                         <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-accent transition-colors">
                            <Github className="w-4 h-4" />
                         </a>
                    )}
                </div>
            }
          >
            {isManaging && (
                <div className="absolute top-14 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => handleEdit(project)} className="p-1 bg-paper border border-ink shadow-sm hover:bg-accent hover:text-white text-ink"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(project.id)} className="p-1 bg-paper border border-ink shadow-sm hover:bg-red-500 hover:text-white text-ink"><Trash2 className="w-3 h-3" /></button>
                </div>
            )}

            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <p className="font-sans text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <PaperBadge key={tag} color={getBadgeColor(project.status)}>{tag}</PaperBadge>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="font-mono text-xs text-gray-500">ID: {project.id.toUpperCase()}</span>
                {project.webUrl ? (
                    <a href={project.webUrl} target="_blank" rel="noopener noreferrer">
                         <PaperButton size="sm" variant="ghost">
                            VIEW PROJECT <ArrowRight className="w-4 h-4 ml-1" />
                        </PaperButton>
                    </a>
                ) : (
                    <PaperButton size="sm" variant="ghost">
                        VIEW <ArrowRight className="w-4 h-4 ml-1" />
                    </PaperButton>
                )}
              </div>
            </div>
          </PaperCard>
        ))}
        
        {isManaging && (
            <button 
                onClick={handleAddNew}
                className="h-full min-h-[300px] border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-accent hover:text-accent hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-all gap-4 group"
            >
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-mono text-sm uppercase font-bold tracking-wider">Add Initiative</span>
            </button>
        )}
      </div>

      <PaperModal
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
        title="Knowledge Graph: DOMAIN_TOPOLOGY_V6"
      >
        <div className="p-0">
            <KnowledgeGraph />
            <div className="p-4 bg-paper border-t border-ink">
                <p className="font-mono text-xs text-gray-500">
                    /// INTERACTIVE MODE: DRAG NODES TO REORGANIZE, CLICK TO EXPAND
                </p>
            </div>
        </div>
      </PaperModal>

      <PaperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? `Edit Node: ${editingProject.id}` : 'Initialize New Node'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
            <PaperInput 
                label="Project Title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
            />
            
            <div className="grid grid-cols-2 gap-4">
                <PaperInput 
                    label="System ID" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    disabled={!!editingProject} 
                    required
                />
                <PaperSelect 
                    label="Lifecycle Status"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    options={[
                        { value: 'active', label: 'ACTIVE' },
                        { value: 'beta', label: 'BETA' },
                        { value: 'concept', label: 'CONCEPT' },
                    ]}
                />
            </div>

            <PaperTextArea 
                label="Description" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
            />

            <PaperInput 
                label="Tags (Comma Separated)" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Sociology, Graph Theory..."
            />
            <div className="grid grid-cols-2 gap-4">
                <PaperInput 
                    label="Github URL" 
                    value={formData.githubUrl || ''}
                    onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                    placeholder="https://github.com/..."
                />
                <PaperInput 
                    label="Web URL" 
                    value={formData.webUrl || ''}
                    onChange={e => setFormData({...formData, webUrl: e.target.value})}
                    placeholder="https://..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                <PaperButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    CANCEL
                </PaperButton>
                <PaperButton type="submit">
                    <Save className="w-4 h-4" /> SAVE CHANGES
                </PaperButton>
            </div>
        </form>
      </PaperModal>
    </section>
  );
};

export default ProjectGrid;