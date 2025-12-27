import React, { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/*
 * METACOGNA.AI DESIGN SYSTEM v1.0
 * -------------------------------
 * 
 * CORE PRINCIPLES:
 * 1. "Digital Paper": UI elements are treated as physical sheets with distinct borders and hard shadows.
 * 2. High Contrast: Strict adherence to #18181b (Ink) and #ffffff (Paper) for readability and authority.
 * 3. Functional Brutalism: No blurred shadows, no gradients (except specific textures). Form follows data structure.
 */

// --- Types ---
interface PaperCardProps extends HTMLMotionProps<'div'> {
  title?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

interface PaperButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

interface PaperBadgeProps {
  children: React.ReactNode;
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
}

interface PaperInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface PaperTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

interface PaperSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

interface PaperModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// --- Components ---

export const PaperCard: React.FC<PaperCardProps> = ({ 
  title, 
  headerAction, 
  children, 
  className = '', 
  noPadding = false,
  ...props 
}) => {
  return (
    <motion.div 
      className={`bg-paper border-2 border-ink shadow-hard flex flex-col ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      {title && (
        <div className="border-b-2 border-ink bg-surface px-6 py-3 flex justify-between items-center">
          <h3 className="font-serif font-bold text-lg text-ink tracking-wide uppercase">
            {title}
          </h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </motion.div>
  );
};

export const PaperButton: React.FC<PaperButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  // Base styles
  const baseStyles = "font-bold font-sans border-2 border-ink transition-all duration-100 active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Variants
  const variants = {
    primary: "bg-ink text-paper hover:bg-accent hover:text-ink hover:border-ink shadow-hard",
    secondary: "bg-paper text-ink hover:bg-surface shadow-hard",
    ghost: "bg-transparent border-transparent hover:border-ink hover:bg-surface text-ink shadow-none hover:shadow-hard",
    danger: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-ink hover:bg-red-100 dark:hover:bg-red-900/50 shadow-hard",
  };

  // Sizes
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-8 py-4",
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const PaperBadge: React.FC<PaperBadgeProps> = ({ children, color = 'gray' }) => {
  const colors = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
    blue: "bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700",
    purple: "bg-purple-50 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700",
    orange: "bg-orange-50 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700",
    red: "bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700",
    gray: "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 border text-xs font-mono font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

export const PaperInput: React.FC<PaperInputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="font-mono text-xs uppercase font-bold text-ink">{label}</label>}
      <input 
        className="bg-paper border-2 border-ink p-3 text-ink font-sans placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-hard transition-all duration-200"
        {...props}
      />
      {error && <span className="text-red-600 dark:text-red-400 text-xs font-mono">{error}</span>}
    </div>
  );
};

export const PaperTextArea: React.FC<PaperTextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="font-mono text-xs uppercase font-bold text-ink">{label}</label>}
      <textarea 
        className="bg-paper border-2 border-ink p-3 text-ink font-sans placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-hard transition-all duration-200 min-h-[120px]"
        {...props}
      />
      {error && <span className="text-red-600 dark:text-red-400 text-xs font-mono">{error}</span>}
    </div>
  );
};

export const PaperSelect: React.FC<PaperSelectProps> = ({ label, error, options, className = '', ...props }) => {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label className="font-mono text-xs uppercase font-bold text-ink">{label}</label>}
        <div className="relative">
            <select 
              className="appearance-none w-full bg-paper border-2 border-ink p-3 text-ink font-sans focus:outline-none focus:ring-0 focus:shadow-hard transition-all duration-200"
              {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ink">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
        {error && <span className="text-red-600 dark:text-red-400 text-xs font-mono">{error}</span>}
      </div>
    );
};

export const PaperModal: React.FC<PaperModalProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative z-10 w-full max-w-lg"
                    >
                        <PaperCard title={title} headerAction={
                            <button onClick={onClose} className="hover:text-accent transition-colors text-ink">
                                <X className="w-5 h-5" />
                            </button>
                        }>
                            {children}
                        </PaperCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};