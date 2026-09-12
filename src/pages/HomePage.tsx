import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ExternalLink } from 'lucide-react';
import type { Category, Promotion, Article } from '@/types';
import {
  fetchCategories,
  fetchPromotions,
  fetchLatestArticles,
  fetchFeaturedArticles,
  fetchAuthorsPicks,
  fetchArticlesByCategory,
} from '@/lib/api';
import { SectionHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { BookmarkButton } from '@/components/articles/BookmarkButton';
import { useAuth } from '@/lib/auth';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [authorsPicks, setAuthorsPicks] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cats, promos, latestArts, featuredArts, picks] = await Promise.all([
          fetchCategories(),
          fetchPromotions(),
          fetchLatestArticles(10),
          fetchFeaturedArticles(5),
          fetchAuthorsPicks(10),
        ]);
        setCategories(cats);
        setPromotions(promos);
        setLatest(latestArts);
        setFeatured(featuredArts);
        setAuthorsPicks(picks);

        const catArts: Record<string, Article[]> = {};
        if (cats.length > 0) {
          const firstCat = cats[0];
          const arts = await fetchArticlesByCategory(firstCat.id);
          catArts[firstCat.id] = arts;
        }
        setCategoryArticles(catArts);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingState message="Loading stories..." />;
  if (error) return <ErrorState message="Could not load content. Please try again." onRetry={() => window.location.reload()} />;

  const featuredCategory = categories[0];
  const remainingCategories = categories.slice(1);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleArticleClick = (articleId: string) => {
    if (user) {
      navigate(`/article/${articleId}`);
    } else {
      navigate('/auth', { state: { redirect: `/article/${articleId}` } });
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-20">
      {/* 1. PROMOTIONS CAROUSEL — top, 3s auto-slideshow */}
      {promotions.length > 0 && (
        <section>
          <SectionHeader title="Promotions" />
          <PromotionCarousel promotions={promotions} intervalMs={3000} formatDate={formatDate} />
        </section>
      )}

      {/* 2. LATEST — continuous marquee with LARGER vertical cards */}
      {latest.length > 0 && (
        <section>
          <SectionHeader title="Latest" />
          <LatestMarquee articles={latest} onArticleClick={handleArticleClick} />
        </section>
      )}

      {/* 3. FEATURED CATEGORY — smaller compact cards */}
      {featuredCategory && categoryArticles[featuredCategory.id]?.length > 0 && (
        <section>
          <SectionHeader
            title={featuredCategory.name}
            action="See all"
            onAction={() => navigate(`/category/${featuredCategory.slug}`)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryArticles[featuredCategory.id].map((article) => (
              <AuthorsPickCard key={article.id} article={article} onClick={() => handleArticleClick(article.id)} />
            ))}
          </div>
        </section>
      )}

      {/* 4. AUTHOR'S PICKS — smaller compact cards */}
      {authorsPicks.length > 0 && (
        <section>
          <SectionHeader
            title="Author's Picks"
            action="See all"
            onAction={() => navigate('/authors-picks')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {authorsPicks.map((article) => (
              <AuthorsPickCard key={article.id} article={article} onClick={() => handleArticleClick(article.id)} />
            ))}
          </div>
        </section>
      )}

      {/* 5. PROMOTIONS CAROUSEL #2 — after Author's Picks, 5s */}
      {promotions.length > 0 && (
        <section>
          <SectionHeader title="Featured Promotions" />
          <PromotionCarousel promotions={promotions} intervalMs={5000} formatDate={formatDate} />
        </section>
      )}

      {/* 6. REMAINING CATEGORIES — smaller compact cards */}
      {remainingCategories.map((cat) => (
        <CategorySection key={cat.id} category={cat} onSeeAll={() => navigate(`/category/${cat.slug}`)} onArticleClick={handleArticleClick} />
      ))}
    </div>
  );
}

/* ===== Promotion Carousel (auto-slideshow, wide cards) ===== */

function PromotionCarousel({ promotions, intervalMs, formatDate }: { promotions: Promotion[]; intervalMs: number; formatDate: (d: string | null) => string }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % promotions.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [promotions.length, intervalMs]);

  const scrollTo = useCallback((i: number) => {
    setIndex(i);
  }, []);

  return (
    <div className="relative">
      <div ref={trackRef} className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {promotions.map((promo) => (
            <div key={promo.id} className="min-w-full">
              <a
                href={promo.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block glass-card overflow-hidden group"
              >
                <div className="relative h-64 md:h-72 overflow-hidden">
                  {promo.image_url && (
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      {promo.date_time && (
                        <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                          <span className="text-xs text-primary">{formatDate(promo.date_time)}</span>
                        </div>
                      )}
                      <ExternalLink className="w-4 h-4 text-white/70" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl text-white mb-2">{promo.title}</h3>
                    <p className="text-sm text-white/80 line-clamp-2 max-w-2xl">{promo.description}</p>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {promotions.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {promotions.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8' : 'w-2'}`}
              style={{
                background: i === index ? 'var(--brand-primary)' : 'var(--border-strong)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Author's Pick Card (SMALLER compact card — used for Author's Picks + Categories) ===== */

function AuthorsPickCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const typeLabel = article.article_type === 'PODCAST' ? 'Podcast'
    : article.article_type === 'QUIZ' ? 'Quiz'
    : article.article_type === 'OPINION' ? 'Opinion'
    : article.article_type === 'FEATURED' ? 'Featured'
    : 'Article';

  return (
    <div onClick={onClick} className="glass-card overflow-hidden cursor-pointer group h-full flex flex-col">
      <div className="relative h-36 overflow-hidden">
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass text-xs text-primary font-body">
          {typeLabel}
        </span>
        <div className="absolute top-3 right-3">
          <BookmarkButton articleId={article.id} size="sm" />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display text-sm text-primary leading-snug mb-1 line-clamp-2">{article.title}</h3>
        <p className="text-xs text-muted line-clamp-2 flex-1">{article.subtitle}</p>
      </div>
    </div>
  );
}

/* ===== Latest Marquee (LARGER vertical cards, infinite horizontal scroll) ===== */

function LatestMarquee({ articles, onArticleClick }: { articles: Article[]; onArticleClick: (id: string) => void }) {
  const typeLabel = (type: string) =>
    type === 'PODCAST' ? 'Podcast' : type === 'QUIZ' ? 'Quiz' : type === 'OPINION' ? 'Opinion' : type === 'FEATURED' ? 'Featured' : 'Article';

  const items = [...articles, ...articles];

  return (
    <div className="relative overflow-hidden">
      <div className="marquee-track gap-6">
        {items.map((article, i) => (
          <div
            key={`${article.id}-${i}`}
            onClick={() => onArticleClick(article.id)}
            className="glass-card overflow-hidden cursor-pointer group w-[340px] sm:w-[400px] transition-transform duration-300 hover:scale-105 flex-shrink-0"
            style={{ transformOrigin: 'center' }}
          >
            <div className="relative h-52 overflow-hidden">
              {article.cover_image_url && (
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-xs text-primary font-body">
                {typeLabel(article.article_type)}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg text-primary leading-snug mb-1.5 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-muted line-clamp-2">{article.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Category Section (uses smaller compact card style) ===== */

function CategorySection({
  category,
  onSeeAll,
  onArticleClick,
}: {
  category: Category;
  onSeeAll: () => void;
  onArticleClick: (id: string) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchArticlesByCategory(category.id)
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [category.id]);

  if (!loaded) return null;
  if (articles.length === 0) return null;

  return (
    <section>
      <SectionHeader title={category.name} action="See all" onAction={onSeeAll} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article) => (
          <AuthorsPickCard key={article.id} article={article} onClick={() => onArticleClick(article.id)} />
        ))}
      </div>
    </section>
  );
}
