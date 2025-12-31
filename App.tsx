
import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import HeroSection from './components/HeroSection';
import ProjectGrid from './components/ProjectGrid';
import Footer from './components/Footer';
import MethodologySection from './components/MethodologySection';
import AboutSection from './components/AboutSection';
import { PaperButton, PaperModal } from './components/PaperComponents';
import ContactModal from './components/ContactModal';
import HowWeWorkSection from './components/HowWeWorkSection';
import RealityAnchor from './components/RealityAnchor';
import HubspotTerminal from './components/HubspotTerminal';
import Toast from './components/Toast';
import { Menu, Github, Loader, Moon, Sun } from 'lucide-react';
import { UserRole } from './types';
import { useAuth } from 'react-oidc-context';

// Lazy load portal components to optimize landing page performance
const PortalDashboard = lazy(() => import('./components/PortalDashboard'));
const DecisionLog = lazy(() => import('./components/DecisionLog'));
const ProjectGallery = lazy(() => import('./components/ProjectGallery'));
const ServicesBase = lazy(() => import('./components/ServicesBase'));

// --- Feature Flags ---
const ENABLE_PROJECT_GRID = (import.meta as any).env?.VITE_ENABLE_PROJECT_GRID !== 'false';
const ENABLE_METHODOLOGY = (import.meta as any).env?.VITE_ENABLE_METHODOLOGY !== 'false';

type RunProject = {
  label: string;
  href: string;
  description: string;
  tagline: string;
  isTmp?: boolean;
};

const RUN_PROJECTS: RunProject[] = [
  {
    label: 'Compilar',
    href: 'https://compilar.app',
    description: 'Analysis and translation of 15 years of social dynamics research and PILAR Theory into a gamified education platform spanning 20 structured datasets.',
    tagline: 'Takes 15 years of social dynamics research and ships it like a co-op game with cheat codes.',
  },
  {
    label: 'Aware',
    href: 'https://aware.metacogna.ai',
    description: 'Upload your project documents, surface hidden links, and experience metacognition with a background Supervizor.',
    tagline: 'Uploads your war-room binder and lets a background Supervizor whisper why page 3 ruins sprint 12.',
  },
  {
    label: 'MetaGoal',
    href: 'https://app.metacogna.ai',
    description: 'A “Metacognitive Agent” that digests your interactions and docs, nudging you toward goals while prep work for external tool hooks continues.',
    tagline: 'Compresses your second brain into a single “do this next” nudge—no oracle robes required.',
  },
  {
    label: 'Debate Sense (Early Dev)',
    href: 'https://debate-sense-615cf021.base44.app',
    description: 'An early prototype AI coach and practice arena following Australian competitive debating standards.',
    tagline: 'Australian debate prep meets AI coach who’s part judge, part hype squad.',
  },
  {
    label: '/tmp',
    href: '#',
    description: 'A rotating lab of agentic experiments poking every edge case we can conjure.',
    tagline: '🤖 /tmp is a neon-green sandbox where robots learn new party tricks hourly.',
    isTmp: true,
  },
];

const Header: React.FC<{ 
    onLoginClick: () => void; 
    onLogoutClick: () => void;
    onContactClick: () => void;
    currentView: string;
    onChangeView: (v: any) => void;
    isDark: boolean;
    onToggleTheme: () => void;
    runProjects: RunProject[];
    onRunProjectSelect: (project: RunProject) => void;
    isAuthenticated: boolean;
}> = ({ onLoginClick, onLogoutClick, onContactClick, currentView, onChangeView, isDark, onToggleTheme, runProjects, onRunProjectSelect, isAuthenticated }) => {
  
  const [isRunMenuOpen, setIsRunMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isPortal = currentView.startsWith('portal') || currentView === 'decisions';
  const isGallery = currentView === 'gallery';
  const isServices = currentView === 'services';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    if (isPortal) {
        onChangeView('portal');
    } else {
        onChangeView('landing');
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-paper/90 backdrop-blur-sm border-b-2 border-ink transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={handleLogoClick}>
          <div className="w-8 h-8 bg-ink flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="text-paper font-serif font-bold text-xl">M</span>
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-ink">METACOGNA LAB</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 font-mono text-sm font-medium text-ink">
          <div 
            className="relative"
            onMouseEnter={() => setIsRunMenuOpen(true)}
            onMouseLeave={() => setIsRunMenuOpen(false)}
            onFocusCapture={() => setIsRunMenuOpen(true)}
            onBlurCapture={(event) => {
              const nextTarget = event.relatedTarget as Node | null;
              if (nextTarget && !event.currentTarget.contains(nextTarget)) {
                setIsRunMenuOpen(false);
              }
            }}
          >
            <button
              onClick={() => setIsRunMenuOpen(!isRunMenuOpen)}
              className={`uppercase px-3 py-1 border-2 transition-all ${isRunMenuOpen ? 'bg-accent text-ink border-ink font-bold shadow-hard' : 'bg-ink text-paper border-transparent hover:bg-accent hover:text-ink'}`}
              aria-haspopup="true"
              aria-expanded={isRunMenuOpen}
            >
              ./run.sh
            </button>
            <div className={`absolute right-0 mt-2 w-64 bg-paper border-2 border-ink shadow-hard-sm transition-all ${isRunMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <div className="px-3 py-2 border-b-2 border-ink text-[0.7rem] tracking-[0.2em] text-ink/70">
                PROJECTS
              </div>
              {runProjects.map((project) => (
                <button
                  key={project.label}
                  type="button"
                  onClick={() => {
                    setIsRunMenuOpen(false);
                    onRunProjectSelect(project);
                  }}
                  className={`flex flex-col w-full px-3 py-2 transition-colors text-left border-b border-ink/30 last:border-b-0 ${project.isTmp ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'hover:bg-accent/30'}`}
                >
                  <span className={`font-semibold ${project.isTmp ? 'text-white' : 'text-ink'}`}>{project.label}</span>
                  <span className={`text-xs ${project.isTmp ? 'text-white/90' : 'text-ink/70'}`}>{project.tagline}</span>
                </button>
              ))}
            </div>
          </div>
          {!isPortal ? (
             <>
                <button 
                    onClick={() => onChangeView('services')} 
                    className={`uppercase px-3 py-1 transition-all border-2 ${isServices ? 'bg-accent text-ink border-ink font-bold shadow-hard' : 'bg-ink text-paper border-transparent hover:bg-accent hover:text-ink'}`}
                >
                    SERVICES
                </button>
                <button 
                    onClick={() => onChangeView('gallery')} 
                    className={`hover:text-accent uppercase ${isGallery ? 'underline decoration-2 underline-offset-4 text-accent' : ''}`}
                >
                    PROJECTS
                </button>
                {/* Only show scroll links if we are on landing page, otherwise they should probably go back to landing or just hide */}
                {!isGallery && !isServices && (
                    <>
                        {ENABLE_METHODOLOGY && (
                            <button onClick={() => scrollToSection('methodology')} className="hover:text-accent uppercase">METHODOLOGY</button>
                        )}
                        <button onClick={() => scrollToSection('about')} className="hover:text-accent uppercase">ABOUT</button>
                    </>
                )}
             </>
          ) : (
             <>
                <button onClick={() => onChangeView('portal')} className={`hover:text-accent uppercase ${currentView === 'portal' ? 'underline' : ''}`}>DASHBOARD</button>
                <button onClick={() => onChangeView('decisions')} className={`hover:text-accent uppercase ${currentView === 'decisions' ? 'underline' : ''}`}>DECISION LOG</button>
             </>
          )}
          
          <button onClick={onContactClick} className="hover:text-accent uppercase">CONTACT</button>
          
          <div className="h-4 w-[2px] bg-gray-300 dark:bg-gray-700 mx-2"></div>

          {/* Theme Toggle */}
          <button onClick={onToggleTheme} className="hover:text-accent transition-colors p-1" title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* External Links */}
          <div className="flex items-center gap-4">
              <a href="https://github.com/metacogna-lab" target="_blank" rel="noopener noreferrer" title="Metacogna Lab">
                <Github className="w-5 h-5 hover:text-accent transition-colors" />
              </a>
              <a href="https://github.com/PratejraTech" target="_blank" rel="noopener noreferrer" title="Pratejra Tech" className="bg-accent text-ink p-1.5 border border-ink shadow-hard-sm hover:translate-y-[1px] hover:shadow-none transition-all">
                <Github className="w-4 h-4" />
              </a>
          </div>

          {!isPortal && (
            isAuthenticated ? (
              <PaperButton size="sm" variant="secondary" onClick={onLogoutClick}>LOGOUT</PaperButton>
            ) : (
              <PaperButton size="sm" variant="secondary" onClick={onLoginClick}>LOGIN</PaperButton>
            )
          )}
        </nav>

        <div className="md:hidden flex items-center gap-4">
            <button onClick={onToggleTheme} className="text-ink hover:text-accent transition-colors p-1">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-surface border border-transparent hover:border-ink transition-all text-ink"
              aria-label="Toggle navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-b-2 border-ink bg-paper px-4 py-6 shadow-hard-sm">
          <div className="mb-4">
            <div className="text-[0.65rem] tracking-[0.3em] text-ink/70 mb-2">./run.sh</div>
            <div className="space-y-2">
              {runProjects.map((project) => (
                <button
                  key={project.label}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onRunProjectSelect(project);
                  }}
                  className={`block w-full px-3 py-2 border-2 border-ink transition-colors text-left ${project.isTmp ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-surface hover:bg-accent/30'}`}
                >
                  <div className={`text-sm font-semibold ${project.isTmp ? 'text-white' : 'text-ink'}`}>{project.label}</div>
                  <div className={`text-xs ${project.isTmp ? 'text-white/90' : 'text-ink/70'}`}>{project.tagline}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm font-mono text-ink">
            {!isPortal ? (
              <>
                <button onClick={() => { onChangeView('services'); setIsMobileMenuOpen(false); }} className="text-left uppercase">SERVICES</button>
                <button onClick={() => { onChangeView('gallery'); setIsMobileMenuOpen(false); }} className="text-left uppercase">PROJECTS</button>
                {!isGallery && !isServices && (
                  <>
                    {ENABLE_METHODOLOGY && (
                      <button onClick={() => { scrollToSection('methodology'); setIsMobileMenuOpen(false); }} className="text-left uppercase">METHODOLOGY</button>
                    )}
                    <button onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }} className="text-left uppercase">ABOUT</button>
                  </>
                )}
              </>
            ) : (
              <>
                <button onClick={() => { onChangeView('portal'); setIsMobileMenuOpen(false); }} className="text-left uppercase">DASHBOARD</button>
                <button onClick={() => { onChangeView('decisions'); setIsMobileMenuOpen(false); }} className="text-left uppercase">DECISION LOG</button>
              </>
            )}
            <button onClick={() => { onContactClick(); setIsMobileMenuOpen(false); }} className="text-left uppercase">CONTACT</button>
            <div className="flex items-center gap-4 border-t border-ink/40 pt-4">
              <a href="https://github.com/metacogna-lab" target="_blank" rel="noopener noreferrer" title="Metacogna Lab" className="text-ink hover:text-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://github.com/PratejraTech" target="_blank" rel="noopener noreferrer" title="Pratejra Tech" className="text-ink hover:text-accent transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
            {!isPortal && (
              isAuthenticated ? (
                <PaperButton size="sm" variant="secondary" onClick={() => { setIsMobileMenuOpen(false); onLogoutClick(); }}>
                  LOGOUT
                </PaperButton>
              ) : (
                <PaperButton size="sm" variant="secondary" onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}>
                  LOGIN
                </PaperButton>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

type ViewState = 'landing' | 'portal' | 'decisions' | 'gallery' | 'services';

const App: React.FC = () => {
  const auth = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('associate'); 
  
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // Serious Mode States
  const [isHubspotOpen, setIsHubspotOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('DISPATCHED');
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedRunProject, setSelectedRunProject] = useState<RunProject | null>(null);
  const [asciiArt, setAsciiArt] = useState('');

  const isAuthProcessing = auth.isLoading;


  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return false;
    }
    return false;
  });

  // Apply Theme
  useEffect(() => {
    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);
  
  useEffect(() => {
    let isMounted = true;
    fetch('/ascii-metacogna.txt')
      .then((res) => res.text())
      .then((text) => {
        if (isMounted) {
          setAsciiArt(text);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAsciiArt('METACOGNA LAB');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const handleRunProjectSelect = (project: RunProject) => {
      setSelectedRunProject(project);
      setIsRunModalOpen(true);
  };

  const closeRunModal = () => {
      setIsRunModalOpen(false);
      setSelectedRunProject(null);
  };

  const handleSsoParams = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const provider = urlParams.get('sso_provider');
    const state = urlParams.get('state');
    const status = urlParams.get('sso_status') || 'success';
    if (!provider || !state) return;
    try {
        await fetch(`/api/sso/callback?provider=${encodeURIComponent(provider)}&state=${encodeURIComponent(state)}&status=${encodeURIComponent(status)}`, {
            method: 'GET',
            credentials: 'include',
        });
        setToastMessage(`${provider.toUpperCase()} SSO ${status === 'success' ? 'ready' : 'returned'}`);
    } catch (err) {
        setToastMessage(`${provider.toUpperCase()} SSO failed`);
    } finally {
        setIsToastVisible(true);
        urlParams.delete('sso_provider');
        urlParams.delete('sso_status');
        urlParams.delete('state');
        const newSearch = urlParams.toString();
        const cleanUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
        window.history.replaceState({}, document.title, cleanUrl);
    }
  };

  useEffect(() => {
    handleSsoParams();
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
        const email = auth.user?.profile?.email || auth.user?.profile?.preferred_username || auth.user?.profile?.sub || 'member';
        const token = auth.user?.id_token || '';
        setCurrentUser(email);
        setUserRole('associate');
        setCurrentView((view) => view === 'landing' ? 'portal' : view);
        localStorage.setItem('metacogna_user', email);
        localStorage.setItem('metacogna_role', 'associate');
        if (token) {
            localStorage.setItem('metacogna_token', token);
        }
    } else if (!auth.isLoading) {
        setCurrentUser(null);
        localStorage.removeItem('metacogna_user');
        localStorage.removeItem('metacogna_role');
        localStorage.removeItem('metacogna_token');
    }
  }, [auth.isAuthenticated, auth.user, auth.isLoading]);

  const handleLogin = () => {
      auth.signinRedirect();
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setCurrentView('landing');
      localStorage.removeItem('metacogna_user');
      localStorage.removeItem('metacogna_role');
      localStorage.removeItem('metacogna_token');
      auth.signoutRedirect();
  };

  const runProjectModal = (
      <PaperModal 
        isOpen={isRunModalOpen && !!selectedRunProject}
        onClose={closeRunModal}
        title="./run.sh"
        maxWidth="max-w-2xl"
      >
        {selectedRunProject && (
          <div className="flex flex-col gap-4">
            <pre className="font-mono text-xs md:text-sm text-emerald-400 leading-tight whitespace-pre overflow-auto border-2 border-ink bg-paper shadow-hard-sm p-4">
              {asciiArt}
            </pre>
            <div className="space-y-2">
              <p className="font-mono text-[0.65rem] tracking-[0.3em] text-ink/60">PROJECT BRIEF</p>
              <h3 className="text-2xl font-serif text-ink">{selectedRunProject.label}</h3>
              <p className="text-sm text-ink/80 leading-relaxed">
                {selectedRunProject.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href={selectedRunProject.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 font-bold font-sans border-2 border-ink bg-ink text-paper hover:bg-accent hover:text-ink transition-colors shadow-hard px-5 py-2.5 text-center uppercase tracking-wide"
              >
                Launch Project
              </a>
              <PaperButton 
                variant="secondary" 
                size="md" 
                className="flex-1"
                onClick={closeRunModal}
              >
                Close
              </PaperButton>
            </div>
          </div>
        )}
      </PaperModal>
  );

  if (isAuthProcessing) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-surface flex-col gap-4">
              <Loader className="w-8 h-8 animate-spin text-ink" />
              <p className="font-mono text-sm text-ink">VERIFYING_CREDENTIALS...</p>
          </div>
      );
  }

  // --- Render Portal Area ---
  // If currentUser is set, we render the Portal Environment regardless of currentView state details
  if (currentUser) {
      return (
        <div className="min-h-screen bg-surface">
             <Header 
                onLoginClick={handleLogin} 
                onLogoutClick={handleLogout}
                onContactClick={() => setIsContactOpen(true)} 
                currentView={currentView}
                onChangeView={setCurrentView}
                isDark={isDark}
                onToggleTheme={toggleTheme}
                runProjects={RUN_PROJECTS}
                onRunProjectSelect={handleRunProjectSelect}
                isAuthenticated={!!currentUser}
             />
             <main className="pt-16">
                 <Suspense fallback={
                     <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                         <Loader className="w-10 h-10 animate-spin text-ink" />
                         <p className="font-mono text-sm text-gray-500">LOADING_SECURE_ENVIRONMENT...</p>
                     </div>
                 }>
                     {currentView === 'decisions' ? (
                         <div className="pt-8 px-4">
                             <DecisionLog />
                         </div>
                     ) : (
                         // Default to dashboard for any other view when logged in
                         <PortalDashboard user={currentUser} role={userRole} onLogout={handleLogout} />
                     )}
             </Suspense>
         </main>
         <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
         {runProjectModal}
    </div>
  );
}

  // --- Render Public Views (Landing / Gallery / Services) ---
  return (
    <div className="min-h-screen flex flex-col text-ink font-sans selection:bg-accent selection:text-ink transition-colors duration-300">
      <Header 
        onLoginClick={handleLogin} 
        onLogoutClick={handleLogout}
        onContactClick={() => setIsContactOpen(true)} 
        currentView={currentView}
        onChangeView={setCurrentView}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        runProjects={RUN_PROJECTS}
        onRunProjectSelect={handleRunProjectSelect}
        isAuthenticated={!!currentUser}
      />
      
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      {runProjectModal}

      {/* Serious Mode Components */}
      <HubspotTerminal 
        isOpen={isHubspotOpen} 
        onClose={() => setIsHubspotOpen(false)} 
        onSuccess={() => { 
            setIsHubspotOpen(false); 
            setToastMessage('Dispatch successful'); 
            setIsToastVisible(true); 
        }}
      />
      
      <Toast 
        message={toastMessage} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />
      
      <RealityAnchor onTrigger={() => setIsHubspotOpen(true)} />


      <main className="flex-grow pt-16">
        
        {currentView === 'gallery' ? (
             <Suspense fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader className="w-8 h-8 animate-spin text-ink" />
                    <p className="font-mono text-xs text-gray-400">LOADING_ARTIFACTS...</p>
                </div>
             }>
                <ProjectGallery onBack={() => setCurrentView('landing')} />
             </Suspense>
        ) : currentView === 'services' ? (
             <Suspense fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader className="w-8 h-8 animate-spin text-ink" />
                    <p className="font-mono text-xs text-gray-400">COMPILING_ARCHITECTURE...</p>
                </div>
             }>
                <ServicesBase onBack={() => setCurrentView('landing')} />
             </Suspense>
        ) : (
            <>
                <HeroSection onExploreServices={() => setCurrentView('services')} />
                
                <HowWeWorkSection />

                <div className="w-full h-12 bg-ink text-paper flex items-center overflow-hidden whitespace-nowrap border-y-2 border-ink">
                <div className="animate-marquee font-mono text-xs md:text-sm tracking-widest flex gap-12 px-4 w-full justify-around opacity-90">
                    <span>/// ARCHITECTURE GUIDANCE: STRONG OPINIONS HELD LOOSELY</span>
                    <span>/// CONNECTING TO NEURAL FABRIC</span>
                    <span>/// READY FOR INPUT</span>
                    <span>/// PRATEJRA V1.2 ACTIVE</span>
                    <span>/// SYSTEM INTEGRITY: 100%</span>
                </div>
                </div>

                <div id="projects">
                    {ENABLE_PROJECT_GRID && <ProjectGrid isAuthenticated={!!currentUser} />}
                </div>
                
                {ENABLE_METHODOLOGY && <MethodologySection onOpenContact={() => setIsContactOpen(true)} />}
                
                <AboutSection isAuthenticated={!!currentUser} />
            </>
        )}

      </main>
      <Footer 
        onContactClick={() => setIsContactOpen(true)} 
        onEmailClick={() => setIsHubspotOpen(true)}
      />
    </div>
  );
};

export default App;
