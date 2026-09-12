export function GlowingEffect({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative isolate ${className}`}>
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(115deg, #0066FF, hsl(162 72% 40%), #f5c542, #e7a6d8, #0066FF)',
          backgroundSize: '260% 260%',
          animation: 'glowTrace 7s linear infinite',
        }}
      />
      <div className="pointer-events-none absolute -inset-2 rounded-[inherit] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: 'linear-gradient(115deg, #0066FF, hsl(162 72% 40%), #e7a6d8)' }} />
      <div className="relative rounded-[inherit]">{children}</div>
    </div>
  );
}
