import { useState } from 'react';
import { BookOpen, Share2, Download, Copy } from 'lucide-react';
import { useToast } from '@/lib/toast';

interface CompletionCardProps {
  username: string;
  articleTitle: string;
  xpGained: number;
  xpBreakdown?: { label: string; amount: number }[];
}

export function CompletionCard({ username, articleTitle, xpGained, xpBreakdown }: CompletionCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `${username} completed "${articleTitle}" on The Modern Stories and earned ${xpGained} XP!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'The Modern Stories', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast('Copied to clipboard', 'success');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled share */
    }
  };

  const handleCopy = async () => {
    const text = `${username} completed "${articleTitle}" on The Modern Stories and earned ${xpGained} XP!`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="article-surface p-8 md:p-10 my-8 max-w-lg mx-auto animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-sm text-primary">The Modern Stories</span>
        </div>
        <div className="px-4 py-2 rounded-full bg-brand-secondary/10 flex items-center gap-1.5">
          <span className="font-display text-lg text-brand-secondary">+{xpGained}</span>
          <span className="text-xs text-brand-secondary">XP</span>
        </div>
      </div>

      {/* XP Breakdown */}
      {xpBreakdown && xpBreakdown.length > 0 && (
        <div className="space-y-2 mb-6">
          {xpBreakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted">{item.label}</span>
              <span className="text-brand-secondary font-body">+{item.amount} XP</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-subtle">
            <span className="text-primary font-body text-sm">Total Earned</span>
            <span className="font-display text-lg text-brand-secondary">+{xpGained} XP</span>
          </div>
        </div>
      )}

      {/* Center */}
      <div className="text-center py-6">
        <p className="text-sm text-muted mb-2 uppercase tracking-wider">Completed</p>
        <p className="font-display text-2xl text-primary mb-4">{username}</p>
        <div className="w-16 h-px mx-auto mb-4" style={{ background: 'var(--brand-accent)' }} />
        <p className="font-display text-lg text-secondary leading-snug px-4">{articleTitle}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-subtle">
        <button
          onClick={handleShare}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleCopy}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          {copied ? <span className="text-brand-secondary">Copied!</span> : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
