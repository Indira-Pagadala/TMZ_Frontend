import { useTheme } from '@/lib/theme';

interface TMSLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  hideSubtitleOnMobile?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TMSLogo({
  className = '',
  variant = 'auto',
  showSubtitle = true,
  hideSubtitleOnMobile = false,
  size = 'md',
}: TMSLogoProps) {
  const { theme } = useTheme();
  const isDark = variant === 'auto' ? theme === 'dark' : variant === 'dark';

  const leftColor = isDark ? '#CCCCCC' : '#222B36';
  const middleColor = isDark ? '#E2E8F0' : '#1E293B';
  const rightColor = '#0066FF';
  const tmsTextColor = isDark ? '#FFFFFF' : '#0066FF';
  const subtitleColor = isDark ? '#CBD5E1' : '#1E293B';

  const sizeClasses = {
    sm: { icon: 'w-6 h-6 sm:w-7 sm:h-7', text: 'text-lg sm:text-xl', sub: 'text-[9px]' },
    md: { icon: 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10', text: 'text-xl sm:text-2xl md:text-[28px]', sub: 'text-[10px] sm:text-xs' },
    lg: { icon: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      {/* 3-Facet Diamond Mark */}
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses.icon} shrink-0 transition-transform duration-200`}
        aria-hidden="true"
      >
        {/* Left Outer Blade */}
        <path
          d="M 140 155 C 105 190 62 230 42 250 C 26 266 26 280 44 298 L 222 458 C 236 470 244 466 244 446 L 118 252 L 158 175 C 166 160 156 142 140 155 Z"
          fill={leftColor}
        />
        {/* Middle Blade */}
        <path
          d="M 188 78 C 176 66 186 60 198 75 L 244 425 C 246 438 240 444 234 438 L 142 248 L 188 78 Z"
          fill={middleColor}
        />
        {/* Right Diamond Half */}
        <path
          d="M 256 32 C 256 24 265 20 274 29 L 468 223 C 484 239 484 265 468 281 L 274 475 C 265 484 256 480 256 472 Z"
          fill={rightColor}
        />
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none shrink-0">
        <span
          className={`font-serif font-bold tracking-tight ${sizeClasses.text}`}
          style={{
            color: tmsTextColor,
            fontFamily: "Georgia, 'Times New Roman', 'Playfair Display', serif",
            textShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.45)' : 'none',
          }}
        >
          TMS
        </span>
        {showSubtitle && (
          <span
            className={`font-sans font-semibold tracking-normal mt-0.5 whitespace-nowrap ${
              hideSubtitleOnMobile ? 'hidden sm:inline-block' : 'inline-block'
            } ${sizeClasses.sub}`}
            style={{ color: subtitleColor }}
          >
            The Modern Stories
          </span>
        )}
      </div>
    </div>
  );
}
