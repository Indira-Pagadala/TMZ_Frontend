import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Home, Layers, User } from 'lucide-react';
import type { ArticleWithBlocks, Level, Badge, Article } from '@/types';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import {
  fetchArticleById,
  fetchReadingProgress,
  updateReadingProgress,
  hasCompletionCard,
  createCompletionCard,
  createOpinionCard,
  fetchProfile,
  fetchLevels,
  fetchLevelByNumber,
  fetchUserBadges,
  fetchLatestArticles,
  fetchAuthorsPicks,
} from '@/lib/api';
import { ArticleBlockRenderer } from '@/components/articles/ArticleBlockRenderer';
import { CommentsSection } from '@/components/articles/CommentsSection';
import { BookmarkButton } from '@/components/articles/BookmarkButton';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { XPRewardAnimation } from '@/components/articles/XPRewardAnimation';
import { CompletionCard } from '@/components/articles/CompletionCard';
import { LevelUpModal } from '@/components/articles/LevelUpModal';
import { BadgePopup } from '@/components/articles/BadgePopup';
import { ReadingUnlockOverlay } from '@/components/articles/ReadingUnlockOverlay';
import { ConditionalAdSlot } from '@/components/articles/AdSlot';

const LOCK_PERCENT = 40;

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [article, setArticle] = useState<ArticleWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unlockedPct, setUnlockedPct] = useState(0);
  const [showXp, setShowXp] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [_xpBreakdown, setXpBreakdown] = useState<{ label: string; amount: number }[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [levelUp, setLevelUp] = useState<Level | null>(null);
  const [levelUpPrev, setLevelUpPrev] = useState<Level | null>(null);
  const [levelUpNextXp, setLevelUpNextXp] = useState<number | null>(null);
  const [levelUpCurrentXp, setLevelUpCurrentXp] = useState(0);
  const [badgePopup, setBadgePopup] = useState<Badge | null>(null);
  const [completionChecked, setCompletionChecked] = useState(false);
  const [sidebarLatest, setSidebarLatest] = useState<Article[]>([]);
  const [sidebarPicks, setSidebarPicks] = useState<Article[]>([]);
  const [completionCardXp, setCompletionCardXp] = useState(30);
  const [opinionModalData, setOpinionModalData] = useState<{
    opinionText: string;
    xpGained: number;
  } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const lastSaveRef = useRef<number>(0);
  const quizXpRef = useRef<number>(0);
  const userDidScrollRef = useRef<boolean>(false);
  const completionTriggeredRef = useRef<boolean>(false);

  // Scroll to top on every article open — do NOT inherit previous scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Load article
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    setUnlockedPct(0);
    setShowCompletionModal(false);
    setOpinionModalData(null);
    completionTriggeredRef.current = false;
    userDidScrollRef.current = false;
    setCompletionChecked(false);
    setTotalXp(0);
    setXpBreakdown([]);
    setCompletionCardXp(30);
    quizXpRef.current = 0;
    fetchArticleById(id)
      .then((art) => { if (!art) { setError(true); return; } setArticle(art); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Load sidebar data
  useEffect(() => {
    fetchLatestArticles(5).then(setSidebarLatest).catch(() => {});
    fetchAuthorsPicks(5).then(setSidebarPicks).catch(() => {});
  }, []);

  // Load saved reading progress (resume only if user has saved progress)
  useEffect(() => {
    if (!user || !id) return;
    fetchReadingProgress(user.id, id)
      .then((p) => {
        if (p) {
          setUnlockedPct(p.percentage);
          if (p.scroll_position > 0) {
            setTimeout(() => window.scrollTo({ top: p.scroll_position, behavior: 'smooth' }), 400);
          }
        }
      })
      .catch(() => {});
  }, [user, id]);

  // Check for existing completion card (do NOT show modal on initial load)
  useEffect(() => {
    if (!user || !id) return;
    hasCompletionCard(user.id, id).then(() => {
      setCompletionChecked(true);
    }).catch(() => setCompletionChecked(true));
  }, [user, id]);

  // Scroll-based progressive unlock
  useEffect(() => {
    if (!article || !contentRef.current) return;

    const handleScroll = () => {
      if (!contentRef.current) return;
      userDidScrollRef.current = true;
      const el = contentRef.current;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const contentHeight = el.offsetHeight;

      if (contentHeight === 0) return;

      const scrolledIntoView = Math.max(0, windowHeight - rect.top);
      const visiblePct = Math.min(100, (scrolledIntoView / contentHeight) * 100);

      const step = 5;
      const newUnlocked = Math.min(100, Math.max(unlockedPct, Math.ceil(visiblePct / step) * step));

      if (newUnlocked > unlockedPct) {
        setUnlockedPct(newUnlocked);
      }

      const now = Date.now();
      if (now - lastSaveRef.current > 3000 && user && id) {
        lastSaveRef.current = now;
        const scrollPos = window.scrollY;
        updateReadingProgress(user.id, id, newUnlocked, scrollPos, newUnlocked >= 100).catch(() => {});
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, unlockedPct, user, id]);

  // Completion — only when user has genuinely scrolled to 100%
  useEffect(() => {
    if (!user || !id || !article || unlockedPct < 100 || !completionChecked || completionTriggeredRef.current) return;
    // Trigger ONLY after genuine article completion/reading progress, NOT on open
    if (!userDidScrollRef.current) return;

    completionTriggeredRef.current = true;

    const checkCompletion = async () => {
      try {
        const completionXp = 30 + quizXpRef.current;
        setCompletionCardXp(completionXp);
        setTotalXp(completionXp);
        const result = await createCompletionCard(user.id, id, article.title, completionXp, 'completion');

        if (!result.already_completed) {
          setShowXp(true);
          await refreshProfile();

          const updatedProfile = await fetchProfile(user.id);
          if (updatedProfile && profile && result.new_level > profile.level) {
            const newLevel = await fetchLevelByNumber(result.new_level);
            const prevLevel = await fetchLevelByNumber(profile.level);
            const levels = await fetchLevels();
            const nextLevel = levels.find((l) => l.level_number === result.new_level + 1);
            if (newLevel) {
              setLevelUp(newLevel);
              setLevelUpPrev(prevLevel);
              setLevelUpNextXp(nextLevel?.xp_threshold ?? null);
              setLevelUpCurrentXp(result.total_xp);
            }
          }

          const badges = await fetchUserBadges(user.id);
          if (badges.length > 0 && badges[0].badge) {
            const recentBadge = badges[0];
            const recentTime = new Date(recentBadge.earned_at).getTime();
            if (Date.now() - recentTime < 10000) {
              setBadgePopup(recentBadge.badge ?? null);
            }
          }
        }

        // Show the completion modal popup
        setShowCompletionModal(true);
      } catch {
        showToast('Could not save completion', 'error');
      }
    };

    checkCompletion();
  }, [unlockedPct, user, id, article, completionChecked, profile, showToast, refreshProfile]);

  const handleQuizResult = useCallback((xp: number) => {
    quizXpRef.current += xp;
    setShowXp(true);
    setTotalXp((prev) => prev + xp);
    setTimeout(() => setShowXp(false), 2000);
  }, []);

  const handleOpinionSubmit = useCallback(async (opinionText: string) => {
    if (!user || !article || !id) return;
    const opinionXp = 50;
    setShowXp(true);
    try {
      await createOpinionCard(user.id, id, article.title, opinionText, opinionXp);
      await refreshProfile();
      setOpinionModalData({
        opinionText,
        xpGained: opinionXp,
      });
    } catch {
      /* fallback */
    }
    setTimeout(() => setShowXp(false), 2000);
  }, [user, article, id, refreshProfile]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) { navigate(-1); } else { navigate('/'); }
  }, [navigate]);

  if (loading) return <LoadingState message="Loading article..." />;
  if (error || !article) return <ErrorState message="Article not found." onRetry={() => navigate('/')} />;
  if (!user) { navigate('/auth', { state: { redirect: `/article/${id}` } }); return null; }

  const isFullyUnlocked = unlockedPct >= 100;

  const typeLabel = article.article_type === 'PODCAST' ? 'Podcast'
    : article.article_type === 'QUIZ' ? 'Quiz'
    : article.article_type === 'OPINION' ? 'Opinion'
    : article.article_type === 'FEATURED' ? 'Featured'
    : 'Article';

  return (
    <div className="relative min-h-screen">
      {/* Left navigation rail (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-16 flex-col items-center gap-4 py-8 z-20" style={{ borderRight: '1px solid var(--border-subtle)' }}>
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-secondary hover:text-brand-primary transition-colors" aria-label="Home">
          <Home className="w-5 h-5" />
        </button>
        <button onClick={() => navigate('/about')} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-secondary hover:text-brand-primary transition-colors" aria-label="Categories">
          <Layers className="w-5 h-5" />
        </button>
        <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-secondary hover:text-brand-primary transition-colors" aria-label="Profile">
          <User className="w-5 h-5" />
        </button>
      </aside>

      {/* Main responsive layout container */}
      <div className="relative z-10 lg:ml-16 max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">
          {/* Main column - responsive majority of width */}
          <div className="flex-1 min-w-0 w-full">
            {/* Top controls */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <button onClick={handleBack} className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <BookmarkButton articleId={article.id} variant="toggle" />
            </div>

            {/* Article surface */}
            <article ref={articleRef} className="article-surface p-6 sm:p-8 md:p-12 w-full">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {article.category && (
                    <span className="text-xs px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-body">
                      {article.category.name}
                    </span>
                  )}
                  <span className="text-xs text-muted">{typeLabel}</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl leading-tight mb-3" style={{ color: 'var(--article-text)' }}>
                  {article.title}
                </h1>
                <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--article-muted)' }}>
                  {article.subtitle}
                </p>
              </div>

              {/* ALL blocks are in the DOM. Glassmorphism overlay covers the locked portion. */}
              <div ref={contentRef} className="relative">
                {/* Render all blocks — content stays in DOM */}
                {article.blocks.map((block) => (
                  <ArticleBlockRenderer
                    key={block.id}
                    block={block}
                    onQuizResult={handleQuizResult}
                    onOpinionSubmit={handleOpinionSubmit}
                  />
                ))}

                {/* Glassmorphism lock overlay — covers the bottom portion until fully unlocked */}
                {!isFullyUnlocked && article.blocks.length > 0 && (
                  <div
                    className="absolute left-0 right-0 bottom-0 pointer-events-none"
                    style={{ top: `${LOCK_PERCENT}%` }}
                  >
                    <ReadingUnlockOverlay remainingPct={100 - unlockedPct} completedPct={unlockedPct} />
                  </div>
                )}
              </div>

              {/* Ad slot */}
              <ConditionalAdSlot enabled={false} />

              {/* Comments */}
              <CommentsSection articleId={article.id} />
            </article>
          </div>

          {/* Sticky Sidebar on desktop, responsive stack below on mobile/tablet */}
          <aside className="w-full lg:w-[320px] xl:w-[360px] 2xl:w-[380px] shrink-0 lg:sticky lg:top-20 space-y-8">
            {sidebarLatest.length > 0 && (
              <div>
                <h3 className="font-display text-lg text-primary mb-4">Latest Articles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {sidebarLatest.map((a) => (
                    <SidebarItem key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}

            {sidebarPicks.length > 0 && (
              <div>
                <h3 className="font-display text-lg text-primary mb-4">Author's Picks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {sidebarPicks.map((a) => (
                    <SidebarItem key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* XP Animation */}
      {showXp && (
        <XPRewardAnimation xp={totalXp} onComplete={() => setShowXp(false)} />
      )}

      {/* Completion Card Popup Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 transition-opacity"
            style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowCompletionModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg">
            <CompletionCard
              cardType="completion"
              username={profile?.display_name || user?.email || 'Reader'}
              articleTitle={article.title}
              articleId={id}
              xpGained={completionCardXp}
              onClose={() => setShowCompletionModal(false)}
            />
          </div>
        </div>
      )}

      {/* Opinion Sharable Card Popup Modal */}
      {opinionModalData && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 transition-opacity"
            style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(10px)' }}
            onClick={() => setOpinionModalData(null)}
          />
          <div className="relative z-10 w-full max-w-lg animate-scale-in">
            <CompletionCard
              cardType="opinion"
              username={profile?.display_name || user?.email || 'Reader'}
              articleTitle={article.title}
              articleId={id}
              xpGained={opinionModalData.xpGained}
              opinionText={opinionModalData.opinionText}
              onClose={() => setOpinionModalData(null)}
            />
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {levelUp && (
        <LevelUpModal
          level={levelUp}
          prevLevel={levelUpPrev}
          currentXp={levelUpCurrentXp}
          nextLevelXp={levelUpNextXp}
          onClose={() => setLevelUp(null)}
        />
      )}

      {/* Badge Popup */}
      {badgePopup && (
        <BadgePopup badge={badgePopup} onClose={() => setBadgePopup(null)} />
      )}
    </div>
  );
}

/* ===== Sidebar Item (no glow) ===== */

function SidebarItem({ article }: { article: Article }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate(`/article/${article.id}`);
    } else {
      navigate('/auth', { state: { redirect: `/article/${article.id}` } });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="glass-card p-4 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {article.cover_image_url && (
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
            <img src={article.cover_image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm text-primary font-body line-clamp-2 leading-snug mb-1">{article.title}</h4>
          <p className="text-xs text-muted line-clamp-1">{article.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
