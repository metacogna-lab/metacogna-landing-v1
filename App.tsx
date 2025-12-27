
import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import HeroSection from './components/HeroSection';
import ProjectGrid from './components/ProjectGrid';
import Footer from './components/Footer';
import MethodologySection from './components/MethodologySection';
import AboutSection from './components/AboutSection';
import { PaperButton } from './components/PaperComponents';
import LoginModal from './components/LoginModal';
import ContactModal from './components/ContactModal';
import HowWeWorkSection from './components/HowWeWorkSection';
import { Menu, Github, Loader, Moon, Sun } from 'lucide-react';
import { UserRole } from './types';
import { exchangeGithubCode } from './services/authService';

// Lazy load portal components to optimize landing page performance
const PortalDashboard = lazy(() => import('./components/PortalDashboard'));
const DecisionLog = lazy(() => import('./components/DecisionLog'));
const ProjectGallery = lazy(() => import('./components/ProjectGallery'));

const Header: React.FC<{ 
    onLoginClick: () => void; 
    onContactClick: () => void;
    currentView: string;
    onChangeView: (v: any) => void;
    isDark: boolean;
    onToggleTheme: () => void;
}> = ({ onLoginClick, onContactClick, currentView, onChangeView, isDark, onToggleTheme }) => {
  
  const isPortal = currentView.startsWith('portal') || currentView === 'decisions';
  const isGallery = currentView === 'gallery';

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
          {!isPortal ? (
             <>
                <button 
                    onClick={() => onChangeView('gallery')} 
                    className={`hover:text-accent uppercase ${isGallery ? 'underline decoration-2 underline-offset-4 text-accent' : ''}`}
                >
                    PROJECTS
                </button>
                {/* Only show scroll links if we are on landing page, otherwise they should probably go back to landing or just hide */}
                {!isGallery && (
                    <>
                        <button onClick={() => scrollToSection('methodology')} className="hover:text-accent uppercase">METHODOLOGY</button>
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

          {!isPortal && <PaperButton size="sm" variant="secondary" onClick={onLoginClick}>LOGIN</PaperButton>}
        </nav>

        <div className="md:hidden flex items-center gap-4">
            <button onClick={onToggleTheme} className="text-ink hover:text-accent transition-colors p-1">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-surface border border-transparent hover:border-ink transition-all text-ink">
              <Menu className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};

type ViewState = 'landing' | 'portal' | 'decisions' | 'gallery';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('associate'); 
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  
  // Guard to prevent double execution of OAuth callback in React Strict Mode
  const authCodeProcessed = useRef(false);

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

  const toggleTheme = () => setIsDark(!isDark);

  const handleLoginSuccess = (username: string, role: string, token: string) => {
      console.log("Login Success:", username, role);
      
      // 1. Set Session Storage
      localStorage.setItem('metacogna_user', username);
      localStorage.setItem('metacogna_role', role);
      localStorage.setItem('metacogna_token', token);

      // 2. Update React State
      setCurrentUser(username);
      setUserRole(role as UserRole);
      
      // 3. Force Navigation & Cleanup
      // Important: Explicitly set view to portal so Header knows we are in app
      setCurrentView('portal');
      setIsLoginOpen(false);
  };

  const handleGithubCallback = async (code: string) => {
      setIsAuthProcessing(true);
      // Clean URL immediately
      window.history.replaceState({}, document.title, "/");
      
      try {
          const authData = await exchangeGithubCode(code);
          handleLoginSuccess(authData.user, authData.role, authData.token);
      } catch (e) {
          console.error("Auth Failed", e);
          alert("Authentication Failed: You must be a member of the required organizations.");
          // Reset processed flag in case of failure so they can try again if they reload with new code
          authCodeProcessed.current = false; 
      } finally {
          setIsAuthProcessing(false);
      }
  };

  useEffect(() => {
    // 0. Dev Bypass
    const meta = import.meta as any;
    const isDev = meta.env && meta.env.DEV;
    
    if (isDev) {
         console.log("DEV MODE: Bypassing authentication for rapid development.");
         // Check if we are already logged in to avoid overwriting/reloading unnecessary state
         const storedUser = localStorage.getItem('metacogna_user');
         if (!storedUser) {
             handleLoginSuccess('Dev_Admin', 'admin', 'dev-bypass-token');
             return; // State update triggers re-render, effectively handling the flow
         }
    }

    // 1. Check for existing session
    const storedUser = localStorage.getItem('metacogna_user');
    const storedRole = localStorage.getItem('metacogna_role');
    const storedToken = localStorage.getItem('metacogna_token');

    if (storedUser && storedToken) {
        // If they were logged in, default them to portal unless they were deep linked elsewhere
        setCurrentUser(storedUser);
        setUserRole((storedRole as UserRole) || 'associate');
        setCurrentView('portal');
    }

    // 2. Check for GitHub OAuth Code Callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !authCodeProcessed.current) {
        authCodeProcessed.current = true;
        handleGithubCallback(code);
    }
  }, []);

  const handleLogout = () => {
      setCurrentUser(null);
      setCurrentView('landing');
      localStorage.removeItem('metacogna_user');
      localStorage.removeItem('metacogna_role');
      localStorage.removeItem('metacogna_token');
  };

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
                onLoginClick={() => {}} 
                onContactClick={() => setIsContactOpen(true)} 
                currentView={currentView}
                onChangeView={setCurrentView}
                isDark={isDark}
                onToggleTheme={toggleTheme}
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
        </div>
      );
  }

  // --- Render Public Views (Landing / Gallery) ---
  return (
    <div className="min-h-screen flex flex-col text-ink font-sans selection:bg-accent selection:text-ink transition-colors duration-300">
      <Header 
        onLoginClick={() => setIsLoginOpen(true)} 
        onContactClick={() => setIsContactOpen(true)} 
        currentView={currentView}
        onChangeView={setCurrentView}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <main className="flex-grow pt-16">
        
        {currentView === 'gallery' ? (
             <Suspense fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader className="w-8 h-8 animate-spin text-ink" />
                    <p className="font-mono text-xs text-gray-400">LOADING_STUFF_AND_THINGS...</p>
                </div>
             }>
                <ProjectGallery onBack={() => { setCurrentView('landing'); window.scrollTo(0,0); }} />
             </Suspense>
        ) : (
            <>
                <HeroSection />
                
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
                    <ProjectGrid isAuthenticated={!!currentUser} />
                </div>
                
                <MethodologySection onOpenContact={() => setIsContactOpen(true)} />
                
                <AboutSection isAuthenticated={!!currentUser} />
            </>
        )}

      </main>
      <Footer onContactClick={() => setIsContactOpen(true)} />
    </div>
  );
};

export default App;
