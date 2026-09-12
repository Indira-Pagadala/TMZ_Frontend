import { useEffect, useState } from 'react';
import { MessageCircleQuestion, Check, PenLine } from 'lucide-react';
import type { Opinion } from '@/types';
import { useAuth } from '@/lib/auth';
import { submitOpinion, hasUserSubmittedOpinion } from '@/lib/api';
import { useToast } from '@/lib/toast';

export function OpinionBlock({
  opinion,
  onSubmit,
}: {
  opinion: Opinion;
  onSubmit?: (opinionText: string) => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedText, setSubmittedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    hasUserSubmittedOpinion(user.id, opinion.id)
      .then((isSub) => {
        setSubmitted(isSub);
      })
      .catch(() => {});
  }, [user, opinion.id]);

  const handleSubmit = async () => {
    const finalOpinion = isCustomMode ? customText.trim() : (selected || '').trim();
    if (!finalOpinion || loading || submitted) return;

    setLoading(true);
    try {
      if (user) {
        await submitOpinion(opinion.id, user.id, finalOpinion);
      }
      setSubmitted(true);
      setSubmittedText(finalOpinion);
      showToast('Your opinion has been recorded +50 XP!', 'success');
      onSubmit?.(finalOpinion);
    } catch {
      showToast('Could not submit opinion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-surface p-6 md:p-8 my-8 rounded-2xl border border-subtle">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
            <MessageCircleQuestion className="w-5 h-5 text-brand-secondary" />
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">Opinion</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-xs font-semibold text-brand-secondary">
          +50 XP
        </div>
      </div>

      <p className="text-base font-medium mb-5" style={{ color: 'var(--article-text)' }}>
        {opinion.question}
      </p>

      {/* Preset options */}
      <div className="space-y-3">
        {opinion.options.map((option) => {
          const isSelected = !isCustomMode && selected === option;
          const showSelected = submitted && (submittedText === option || isSelected);
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (!submitted) {
                  setIsCustomMode(false);
                  setSelected(option);
                }
              }}
              disabled={submitted || loading}
              className="w-full text-left p-4 rounded-xl transition-all disabled:cursor-default"
              style={{
                background: showSelected
                  ? 'var(--quiz-correct)'
                  : isSelected
                  ? 'var(--glow-primary)'
                  : 'transparent',
                border: `1px solid ${
                  showSelected
                    ? 'var(--quiz-correct-border)'
                    : isSelected
                    ? 'var(--brand-primary)'
                    : 'var(--border-default)'
                }`,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium" style={{ color: 'var(--article-text)' }}>
                  {option}
                </span>
                {showSelected && <Check className="w-5 h-5" style={{ color: 'var(--quiz-correct-text)' }} />}
              </div>
            </button>
          );
        })}

        {/* Custom opinion option */}
        {!submitted && (
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(true);
              setSelected(null);
            }}
            disabled={submitted || loading}
            className="w-full text-left p-4 rounded-xl transition-all border"
            style={{
              background: isCustomMode ? 'var(--glow-primary)' : 'transparent',
              borderColor: isCustomMode ? 'var(--brand-primary)' : 'var(--border-default)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <PenLine className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="text-sm font-medium text-primary">Write your own custom opinion...</span>
            </div>
          </button>
        )}

        {/* Custom text input */}
        {isCustomMode && !submitted && (
          <div className="animate-fade-in pt-1">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type your opinion here..."
              rows={3}
              className="w-full p-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        )}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={(!selected && (!isCustomMode || !customText.trim())) || loading}
          className="btn-primary mt-5 text-sm disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Opinion & Earn Card'}
        </button>
      )}

      {submitted && (
        <div
          className="mt-5 p-4 rounded-xl animate-fade-in"
          style={{ background: 'var(--quiz-correct)', border: '1px solid var(--quiz-correct-border)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--quiz-correct-text)' }}>
            Thank you for sharing your opinion. Your opinion sharable card has been earned!
          </p>
          {submittedText && (
            <p className="text-xs mt-1 italic opacity-90" style={{ color: 'var(--quiz-correct-text)' }}>
              &ldquo;{submittedText}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
