
import React, { useState } from 'react';
import { PortalUpdate, Comment, UserRole } from '../types';
import { PaperCard, PaperButton, PaperBadge } from './PaperComponents';
import { MessageSquare, Send, Clock, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { addComment } from '../services/portalService';

interface UpdateCardProps {
    update: PortalUpdate;
    currentUser: string;
    isNew: boolean;
}

const UpdateCard: React.FC<UpdateCardProps> = ({ update, currentUser, isNew }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState<Comment[]>(update.comments || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePostComment = async () => {
        if (!commentText.trim()) return;
        setIsSubmitting(true);
        const newComment: Comment = {
            id: `c-${Date.now()}`,
            author: currentUser,
            text: commentText,
            timestamp: new Date().toISOString()
        };
        try {
            await addComment(update.id, newComment);
            setLocalComments([...localComments, newComment]);
            setCommentText('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = () => {
        switch (update.type) {
            case 'decision': return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'risk': return <ShieldAlert className="w-4 h-4 text-red-600" />;
            case 'progress': return <Clock className="w-4 h-4 text-emerald-600" />;
            default: return <Info className="w-4 h-4 text-gray-600" />;
        }
    };

    const getConfidenceColor = (conf: string) => {
        if (conf === 'high') return 'emerald';
        if (conf === 'medium') return 'orange';
        return 'gray';
    };

    return (
        <PaperCard className={`relative group ${isNew ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}>
            {isNew && (
                <div className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-bold font-mono shadow-sm z-10">
                    NEW
                </div>
            )}
            
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    {getTypeIcon()}
                    <h3 className="font-bold text-lg font-serif">{update.title}</h3>
                </div>
                <div className="flex gap-2">
                    {update.type === 'decision' && (
                        <PaperBadge color={getConfidenceColor(update.confidence) as any}>
                            Conf: {update.confidence}
                        </PaperBadge>
                    )}
                    <span className="text-[10px] font-mono border border-ink px-1.5 py-0.5 uppercase text-gray-500">
                        {update.type}
                    </span>
                </div>
            </div>

            <p className="text-gray-700 leading-relaxed font-sans mb-4 text-sm">
                {update.content}
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 font-mono text-xs text-gray-500">
                <div className="flex gap-3">
                    <span>{update.author}</span>
                    <span>{new Date(update.date).toLocaleDateString()}</span>
                </div>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-1 hover:text-ink transition-colors"
                >
                    <MessageSquare className="w-3 h-3" />
                    {localComments.length} {localComments.length === 1 ? 'Note' : 'Notes'}
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 bg-surface border-t-2 border-ink p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                        {localComments.length === 0 && <span className="text-xs text-gray-400 italic">No notes yet.</span>}
                        {localComments.map(c => (
                            <div key={c.id} className="text-xs">
                                <span className="font-bold">{c.author}:</span> <span className="text-gray-700">{c.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 bg-white border border-gray-300 p-2 text-xs font-mono focus:outline-none focus:border-ink"
                            placeholder="Add a note..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                        />
                        <PaperButton size="sm" onClick={handlePostComment} disabled={isSubmitting}>
                            <Send className="w-3 h-3" />
                        </PaperButton>
                    </div>
                </div>
            )}
        </PaperCard>
    );
};

export default UpdateCard;
