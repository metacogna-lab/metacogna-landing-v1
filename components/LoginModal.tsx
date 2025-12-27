
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Lock, AlertTriangle, FileKey, CheckCircle, Loader, KeyRound, ArrowRight, Upload, Scan } from 'lucide-react';
import { PaperButton } from './PaperComponents';
import { loginAdmin, GITHUB_CLIENT_ID } from '../services/authService';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: (username: string, role: string, token: string) => void;
}

const TARGET_PHRASE = "We're all just walking each other home.";
const TARGET_BINARY = "010101110110010100100111011100100110010100100000011000010110110001101100001000000110101001110101011100110111010000100000011101110110000101101100011010110110100101101110011001110010000001100101011000010110001101101000001000000110111101110100011010000110010101110010001000000110100001101111011011010110010100101110";

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    // Stage: 'upload' -> 'password' -> 'success'
    const [loginStage, setLoginStage] = useState<'upload' | 'password' | 'success'>('upload');
    
    // Upload State
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stegError, setStegError] = useState<string | null>(null);
    const [scanProgress, setScanProgress] = useState(0);

    // Password State
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    
    // GitHub Auth State
    const [isGhLoading, setIsGhLoading] = useState(false);

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Short delay to allow exit animation to finish before resetting state
            const timer = setTimeout(() => resetFlow(), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Shared File Processing Logic
    const processFile = async (file: File) => {
        setIsProcessing(true);
        setStegError(null);
        setScanProgress(0);

        // Fake scanning effect
        const scanInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 5, 99));
        }, 50);

        try {
            const text = await file.text();
            const hasPhrase = text.includes(TARGET_PHRASE);
            const hasBinary = text.includes(TARGET_BINARY);
            const isTargetFile = file.name.includes("steg_diffusion"); 
            
            if (hasPhrase || hasBinary || isTargetFile) {
                clearInterval(scanInterval);
                setScanProgress(100);
                await new Promise(resolve => setTimeout(resolve, 500)); // Success pause
                setLoginStage('password');
            } else {
                throw new Error("INVALID_KEY_IMAGE: Hidden signature not found.");
            }
        } catch (err) {
            clearInterval(scanInterval);
            setStegError("ACCESS DENIED: Visual Key signature invalid.");
        } finally {
            clearInterval(scanInterval);
            setIsProcessing(false);
        }
    };

    // 1. File Handler (Step 1)
    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file) {
            await processFile(file);
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // 2. Password Handler (Step 2 - Now calls Worker)
    const handlePasswordSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!password.trim()) return;

        setPasswordError(null);
        setIsProcessing(true);

        try {
            const response = await loginAdmin(password);
            
            setLoginStage('success');
            
            // Wait briefly to show success state before triggering app login
            setTimeout(() => {
                if (onLoginSuccess) {
                    onLoginSuccess(response.user, response.role, response.token);
                }
                onClose();
            }, 1000);
        } catch (err: any) {
            console.error("Login attempt failed:", err);
            setPasswordError(`ACCESS DENIED: ${err.message || 'Verification failed'}`);
            setIsProcessing(false); 
        }
    };

    // GitHub OAuth Redirect
    const handleGithubLogin = () => {
        setIsGhLoading(true);
        // Build OAuth URL
        const redirectUri = window.location.origin; // Callback to homepage
        const scope = 'read:org'; // Required to check membership
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
        
        window.location.href = authUrl;
    };

    const resetFlow = () => {
        setLoginStage('upload');
        setPassword('');
        setStegError(null);
        setPasswordError(null);
        setScanProgress(0);
        setIsProcessing(false);
        setIsGhLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10 w-full max-w-2xl bg-paper border-2 border-ink shadow-hard overflow-hidden flex flex-col md:flex-row min-h-[450px]"
                    >
                        {/* LEFT: Multi-Step Admin Login */}
                        <div 
                            className={`w-full md:w-1/2 relative flex flex-col items-center justify-center p-6 border-b-2 md:border-b-0 md:border-r-2 border-ink transition-colors duration-300 ${
                                isDragging ? 'bg-accent text-ink' : 'bg-[#0a0a0a] text-gray-400'
                            }`}
                            onDragOver={(e) => { 
                                if (loginStage === 'upload') {
                                    e.preventDefault(); 
                                    setIsDragging(true); 
                                }
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={loginStage === 'upload' ? handleDrop : undefined}
                        >
                            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
                            
                            <AnimatePresence mode="wait">
                                {loginStage === 'success' ? (
                                    <motion.div 
                                        key="success"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center text-emerald-500"
                                    >
                                        <CheckCircle className="w-16 h-16 mb-4 mx-auto" />
                                        <h3 className="font-mono font-bold text-lg">ACCESS GRANTED</h3>
                                        <p className="text-xs font-mono mt-2">WELCOME_HOME</p>
                                    </motion.div>
                                ) : loginStage === 'password' ? (
                                    <motion.div
                                        key="password"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        className="w-full max-w-xs relative z-10"
                                    >
                                        <div className="text-center mb-6">
                                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/50">
                                                <KeyRound className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-mono font-bold text-emerald-500 text-sm">VISUAL KEY ACCEPTED</h3>
                                            <p className="text-[10px] text-gray-500 mt-1">STEP 2/2: PASSPHRASE</p>
                                        </div>

                                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                            <div>
                                                <input 
                                                    type="password" 
                                                    autoFocus
                                                    placeholder="Enter Passphrase..."
                                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-white font-mono text-sm p-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    autoComplete="off"
                                                    disabled={isProcessing}
                                                />
                                            </div>
                                            
                                            <button 
                                                type="submit"
                                                disabled={isProcessing}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold py-2 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                            >
                                                {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                                AUTHENTICATE
                                            </button>

                                            {passwordError && (
                                                <div className="text-red-500 text-[10px] font-mono bg-red-900/10 p-2 border border-red-900/30">
                                                    {passwordError}
                                                </div>
                                            )}
                                        </form>

                                        <button 
                                            onClick={resetFlow} 
                                            className="w-full text-center mt-4 text-[10px] text-gray-600 hover:text-gray-400 font-mono underline"
                                        >
                                            CANCEL / RETRY KEY
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="upload"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center relative z-10 w-full h-full flex flex-col items-center justify-center"
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*,.txt" 
                                            onChange={handleFileSelect} 
                                        />

                                        {isProcessing ? (
                                            <div className="text-center w-full px-8">
                                                <Scan className="w-12 h-12 mb-4 animate-pulse text-accent mx-auto" />
                                                <p className="font-mono text-xs animate-pulse mb-2">DECODING_STEGANOGRAPHY...</p>
                                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        className="h-full bg-accent"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${scanProgress}%` }}
                                                    />
                                                </div>
                                                <p className="font-mono text-[10px] text-gray-500 mt-2 text-right">{scanProgress}%</p>
                                            </div>
                                        ) : (
                                            <div 
                                                className="cursor-pointer group" 
                                                onClick={() => fileInputRef.current?.click()}
                                                title="Click to upload key file"
                                            >
                                                <div className={`w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                                                    isDragging 
                                                        ? 'border-ink bg-white/20 scale-110' 
                                                        : 'border-gray-600 group-hover:border-emerald-500 group-hover:bg-white/5'
                                                }`}>
                                                    {isDragging ? (
                                                        <Upload className="w-8 h-8 text-ink" />
                                                    ) : (
                                                        <FileKey className="w-8 h-8 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                                                    )}
                                                </div>
                                                <h3 className="font-serif text-xl font-bold text-gray-200 mb-2 group-hover:text-white transition-colors">Visual Key</h3>
                                                <p className="font-mono text-xs max-w-[200px] mx-auto leading-relaxed mb-4 text-gray-400">
                                                    Drop <span className="text-accent">Visual Key File</span> or click to upload to initiate admin protocol.
                                                </p>
                                                <p className="font-mono text-[10px] text-gray-600">STEP 1/2</p>

                                                {stegError && (
                                                    <div className="mt-6 text-red-500 text-[10px] font-mono border border-red-900/50 bg-red-900/10 p-2">
                                                        {stegError}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* RIGHT: OAuth Login */}
                        <div className="w-full md:w-1/2 p-8 flex flex-col relative bg-paper">
                            <button onClick={onClose} className="absolute top-4 right-4 hover:text-accent transition-colors text-ink">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4 text-accent" />
                                        <span className="font-mono text-xs font-bold uppercase text-ink">Secure Portal</span>
                                    </div>
                                    <h2 className="font-serif text-3xl font-bold text-ink">Authenticate</h2>
                                </div>

                                <div className="space-y-4">
                                    <PaperButton 
                                        fullWidth 
                                        onClick={handleGithubLogin} 
                                        disabled={isGhLoading}
                                        className="bg-[#24292e] text-white hover:bg-black border-black"
                                    >
                                        {isGhLoading ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Github className="w-4 h-4" />
                                        )}
                                        {isGhLoading ? 'REDIRECTING...' : 'SIGN IN WITH GITHUB'}
                                    </PaperButton>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-paper text-gray-400 font-mono">IDENTITY_PROVIDER</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-mono">
                                        NOTE: You will be redirected to GitHub to verify your organization membership.
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-6 text-center">
                                <p className="text-[10px] text-gray-400 font-mono">
                                    RESTRICTED: @metacogna-lab / @PratejraTech
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
