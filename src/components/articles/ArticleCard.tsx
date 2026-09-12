import { useNavigate } from 'react-router-dom';
import type { Article } from '@/types';
import { BookmarkButton } from './BookmarkButton';
import { useAuth } from '@/lib/auth';

interface ArticleCardProps {
  article: Article;
  showType?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export function ArticleCard({ article, showType = true, variant = 'default' }: ArticleCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate(`/article/${article.id}`);
    } else {
      navigate('/auth', { state: { redirect: `/article/${article.id}` } });
    }
  };

  const typeLabel = article.article_type === 'PODCAST' ? 'Podcast'
    : article.article_type === 'QUIZ' ? 'Quiz'
    : article.article_type === 'OPINION' ? 'Opinion'
    : article.article_type === 'FEATURED' ? 'Featured'
    : 'Article';

  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className="glass-card overflow-hidden cursor-pointer group"
      >
        <div className="relative h-40 overflow-hidden">
          {article.cover_image_url && (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="absolute top-3 right-3">
            <BookmarkButton articleId={article.id} size="sm" />
          </div>
          {showType && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass text-xs text-primary font-body">
              {typeLabel}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display text-base text-primary leading-snug mb-1 line-clamp-2">{article.title}</h3>
          <p className="text-xs text-muted line-clamp-1">{article.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="glass-card overflow-hidden cursor-pointer group h-full flex flex-col"
    >
      <div className="relative h-56 overflow-hidden">
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3">
          <BookmarkButton articleId={article.id} size="sm" />
        </div>
        {showType && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-xs text-primary font-body">
            {typeLabel}
          </span>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg text-primary leading-snug mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-sm text-muted line-clamp-2 mb-3 flex-1">{article.subtitle}</p>
      </div>
    </div>
  );
}
