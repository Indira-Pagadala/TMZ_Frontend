import { useEffect, useState } from 'react';
import { MessageCircleQuestion, Check } from 'lucide-react';
import type { Opinion } from '@/types';
import { useAuth } from '@/lib/auth';
import { submitOpinion, hasUserSubmittedOpinion } from '@/lib/api';
import { useToast } from '@/lib/toast';

export function OpinionBlock({ opinion, onSubmit }: { opinion: Opinion; onSubmit?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    hasUserSubmittedOpinion(user.id, opinion.id).then(setSubmitted).catch(() => {});
  }, [user, opinion.id]);

  const handleSubmit = async () => {
    if (!selected || loading || submitted) return;
    setLoading(true);
    try {
      if (user) {
        await submitOpinion(opinion.id, user.id, selected);
      }
      setSubmitted(true);
      showToast('Your opinion has been recorded +50 XP!', 'success');
      onSubmit?.();
    } catch {
      showToast('Could not submit opinion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-surface p-6 md:p-8 my-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
          <MessageCircleQuestion className="w-5 h-5 text-brand-secondary" />
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider">Opinion</p>
        </div>
      </div>

      <p className="text-base mb-5" style={{ color: 'var(--article-text)' }}>{opinion.question}</p>

      <div className="space-y-3">
        {opinion.options.map((option) => {
          const isSelected = selected === option;
          const showSelected = submitted && isSelected;
          return (
            <button
              key={option}
              onClick={() => !submitted && setSelected(option)}
              disabled={submitted || loading}
              className="w-full text-left p-4 rounded-xl transition-all disabled:cursor-default"
              style={{
                background: showSelected ? 'var(--quiz-correct)' : isSelected ? 'var(--glow-primary)' : 'transparent',
                border: `1px solid ${showSelected ? 'var(--quiz-correct-border)' : isSelected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm" style={{ color: 'var(--article-text)' }}>{option}</span>
                {showSelected && <Check className="w-5 h-5" style={{ color: 'var(--quiz-correct-text)' }} />}
              </div>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="btn-primary mt-4 text-sm disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Opinion'}
        </button>
      )}

      {submitted && (
        <div className="mt-5 p-4 rounded-xl animate-fade-in" style={{ background: 'var(--quiz-correct)', border: '1px solid var(--quiz-correct-border)' }}>
          <p className="text-sm" style={{ color: 'var(--quiz-correct-text)' }}>
            Thank you for sharing your opinion. Your response has been recorded.
          </p>
        </div>
      )}
    </div>
  );
}
