import { Lock } from 'lucide-react';

interface ReadingUnlockOverlayProps {
  remainingPct: number;
  completedPct: number;
}

export function ReadingUnlockOverlay({ remainingPct, completedPct }: ReadingUnlockOverlayProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (circumference * completedPct) / 100;

  return (
    <div className="relative w-full h-full min-h-[300px]">
      {/* Gradient fade from transparent to frosted glass */}
      <div
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--bg-glass))',
        }}
      />

      {/* Main frosted glass area */}
      <div
        className="absolute inset-x-0 top-24 bottom-0"
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--bg-glass-border)',
        }}
      />

      {/* Centered content card */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-16 px-4">
        {/* Semi-circular progress indicator */}
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="var(--border-default)"
              strokeWidth="6"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="font-display text-2xl text-primary">{completedPct}%</span>
            <span className="text-[10px] text-muted uppercase tracking-wider">complete</span>
          </div>
        </div>

        {/* Glass card with lock info */}
        <div
          className="rounded-2xl p-6 max-w-sm w-full text-center pointer-events-auto"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--bg-glass-border)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-brand-primary" />
          </div>
          <p className="font-display text-lg text-primary mb-2">
            You've completed {completedPct}% of this story
          </p>
          <p className="text-sm text-muted mb-5">
            {remainingPct}% remaining — keep scrolling to unlock
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completedPct}%`,
                background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
