/**
 * Mock API service layer.
 * All function signatures match the real backend API interface.
 * Replace each function body with your actual backend calls when ready.
 */

import type {
  Category, Promotion, Article, ArticleWithBlocks, Comment,
  ReadingProgress, UserProfile, Level, Badge, UserBadge, Bookmark,
  OpinionSubmission, CompletionCard, TeamMember,
  ReadingHistoryItem, SavedArticleItem, QuizStats, OpinionWithArticle,
  AchievementItem, CompletionResult, QuizAttemptResult,
} from '@/types';

import {
  CATEGORIES, PROMOTIONS, ARTICLES, ARTICLES_WITH_BLOCKS,
  COMMENTS, LEVELS, BADGES, TEAM_MEMBERS,
  DEFAULT_PROFILE, DEFAULT_USER_BADGES, DEFAULT_COMPLETION_CARDS,
  DEFAULT_READING_HISTORY, DEFAULT_SAVED_ARTICLES, DEFAULT_OPINIONS,
  DEFAULT_ACHIEVEMENTS,
  generateArticleWithBlocks,
} from './mock/data';

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

/* --------- in-memory session state (resets on page refresh, with localStorage persistence for user progression) --------- */
const COMPLETION_CARDS_STORAGE_KEY = 'tms_completion_cards';

function loadCompletionCards(): CompletionCard[] {
  try {
    const raw = localStorage.getItem(COMPLETION_CARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_COMPLETION_CARDS];
}

function saveCompletionCards(cards: CompletionCard[]) {
  try {
    localStorage.setItem(COMPLETION_CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // ignore
  }
}

let _profile: UserProfile = { ...DEFAULT_PROFILE };
const _bookmarks = new Set<string>(DEFAULT_SAVED_ARTICLES.map((b) => b.article_id));
const _readingProgress: Record<string, ReadingProgress> = {};
let _completionCards: CompletionCard[] = loadCompletionCards();
const _completedArticleIds = new Set<string>(_completionCards.map((c) => c.article_id));
let _comments: Comment[] = [...COMMENTS];
const _quizAttempted = new Set<string>();
const _opinionSubmitted = new Set<string>();
const _opinions: OpinionSubmission[] = [...DEFAULT_OPINIONS];
let _bookmarkList: Bookmark[] = DEFAULT_SAVED_ARTICLES.map((s) => ({
  id: s.id,
  user_id: s.user_id,
  article_id: s.article_id,
  created_at: s.created_at,
}));

/* ===================== CATEGORIES ===================== */

export async function fetchCategories(): Promise<Category[]> {
  await delay();
  return [...CATEGORIES];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  await delay();
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/* ===================== HERO BANNER CONFIG ===================== */

export interface HeroConfig {
  imageUrl: string;
  title: string;
  subtitle: string;
  badgeText: string;
  linkText: string;
  linkUrl: string;
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  imageUrl: '/modern_stories_hero.jpg',
  title: 'Human stories & modern ideas',
  subtitle: 'A sanctuary to read, write, and deepen your understanding across technology, science, culture, and human ingenuity.',
  badgeText: 'The Modern Stories • Curated Editorial',
  linkText: 'Know more',
  linkUrl: '/about',
};

const HERO_CONFIG_KEY = 'tms_hero_banner_config';

export function getStoredHeroConfig(): HeroConfig {
  try {
    const raw = localStorage.getItem(HERO_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.imageUrl === 'string') {
        const isLegacyUnsplash =
          parsed.imageUrl.includes('photo-1499750310107-5fef28a66643') ||
          parsed.imageUrl.includes('photo-1513694203232-719a280e022f');
        return {
          ...DEFAULT_HERO_CONFIG,
          ...parsed,
          imageUrl: isLegacyUnsplash ? DEFAULT_HERO_CONFIG.imageUrl : parsed.imageUrl,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_HERO_CONFIG };
}

export function saveStoredHeroConfig(config: Partial<HeroConfig>): HeroConfig {
  const current = getStoredHeroConfig();
  const updated: HeroConfig = {
    ...current,
    ...config,
  };
  try {
    localStorage.setItem(HERO_CONFIG_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('tms_hero_config_updated', { detail: updated }));
  } catch {
    /* ignore */
  }
  return updated;
}

export async function fetchHeroConfig(): Promise<HeroConfig> {
  await delay(50);
  return getStoredHeroConfig();
}

/* ===================== PROMOTIONS ===================== */

export async function fetchPromotions(): Promise<Promotion[]> {
  await delay();
  return [...PROMOTIONS];
}

/* ===================== ARTICLES ===================== */

const AUTHORS_PICKS_KEY = 'tms_authors_picks_order';

export function getStoredAuthorsPicksOrder(): string[] {
  try {
    const raw = localStorage.getItem(AUTHORS_PICKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveStoredAuthorsPicksOrder(orderedIds: string[]): void {
  try {
    localStorage.setItem(AUTHORS_PICKS_KEY, JSON.stringify(orderedIds));
  } catch {
    /* ignore */
  }
}

/**
 * Sorts articles by published date descending (latest posted first).
 */
export function sortArticlesByDate<T extends { published_at?: string | null; created_at?: string | null }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const dateA = a.published_at || a.created_at;
    const dateB = b.published_at || b.created_at;
    const timeA = dateA ? new Date(dateA).getTime() : 0;
    const timeB = dateB ? new Date(dateB).getTime() : 0;
    return timeB - timeA;
  });
}

export async function fetchLatestArticles(limit = 10): Promise<Article[]> {
  await delay();
  // Combined latest articles across ALL categories, sorted datewise (newest first)
  const sorted = sortArticlesByDate(ARTICLES);
  return sorted.slice(0, limit);
}

export async function fetchArticlesByCategory(categoryId: string): Promise<Article[]> {
  await delay();
  // Category articles, sorted datewise (newest first)
  const filtered = ARTICLES.filter((a) => a.category_id === categoryId);
  return sortArticlesByDate(filtered);
}

export async function fetchAuthorsPicks(limit = 10): Promise<Article[]> {
  await delay();
  const order = getStoredAuthorsPicksOrder();
  if (order.length > 0) {
    const map = new Map(ARTICLES.map((a) => [a.id, a]));
    const picked: Article[] = [];
    for (const id of order) {
      const art = map.get(id);
      if (art) picked.push(art);
    }
    // Include any other articles with is_authors_pick true not in explicit order
    for (const a of sortArticlesByDate(ARTICLES)) {
      if (a.is_authors_pick && !order.includes(a.id)) {
        picked.push(a);
      }
    }
    return picked.slice(0, limit);
  }
  const picks = ARTICLES.filter((a) => a.is_authors_pick);
  return sortArticlesByDate(picks).slice(0, limit);
}

export async function fetchFeaturedArticles(limit = 5): Promise<Article[]> {
  await delay();
  const featured = ARTICLES.filter((a) => a.is_featured);
  return sortArticlesByDate(featured).slice(0, limit);
}

export async function fetchArticleById(id: string): Promise<ArticleWithBlocks | null> {
  await delay();
  if (ARTICLES_WITH_BLOCKS[id]) return { ...ARTICLES_WITH_BLOCKS[id] };
  const base = ARTICLES.find((a) => a.id === id);
  if (!base) return null;
  return generateArticleWithBlocks(base);
}

/* ===================== BOOKMARKS ===================== */

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  await delay();
  return _bookmarkList.filter((b) => b.user_id === userId);
}

export async function isBookmarked(_userId: string, articleId: string): Promise<boolean> {
  await delay(50);
  return _bookmarks.has(articleId);
}

export async function addBookmark(_userId: string, articleId: string): Promise<void> {
  await delay(50);
  _bookmarks.add(articleId);
  _bookmarkList.push({
    id: `bm-${Date.now()}`,
    user_id: _userId,
    article_id: articleId,
    created_at: new Date().toISOString(),
  });
}

export async function removeBookmark(_userId: string, articleId: string): Promise<void> {
  await delay(50);
  _bookmarks.delete(articleId);
  _bookmarkList = _bookmarkList.filter((b) => b.article_id !== articleId);
}

/* ===================== READING PROGRESS ===================== */

export async function fetchReadingProgress(_userId: string, articleId: string): Promise<ReadingProgress | null> {
  await delay(50);
  return _readingProgress[articleId] ?? null;
}

export async function updateReadingProgress(
  userId: string,
  articleId: string,
  percentage: number,
  scrollPosition: number,
  completed: boolean,
): Promise<void> {
  _readingProgress[articleId] = {
    article_id: articleId,
    user_id: userId,
    percentage,
    scroll_position: Math.round(scrollPosition),
    completed,
    updated_at: new Date().toISOString(),
  };
  if (completed) _completedArticleIds.add(articleId);
}

/* ===================== QUIZ ATTEMPTS ===================== */

export async function submitQuizAttempt(
  quizId: string,
  _userId: string,
  _selectedOptionId: string,
  isCorrect: boolean,
  xpEarned: number,
): Promise<QuizAttemptResult> {
  await delay();
  _quizAttempted.add(quizId);
  if (isCorrect) {
    _profile = { ..._profile, xp: _profile.xp + xpEarned };
  }
  return {
    attempt_id: `attempt-${Date.now()}`,
    xp_earned: isCorrect ? xpEarned : 0,
    total_xp: _profile.xp,
    new_level: _profile.level,
    already_attempted: false,
  };
}

export async function hasUserAttemptedQuiz(_userId: string, quizId: string): Promise<boolean> {
  await delay(50);
  return _quizAttempted.has(quizId);
}

/* ===================== OPINIONS ===================== */

export async function submitOpinion(
  opinionId: string,
  userId: string,
  selectedOption: string,
): Promise<OpinionSubmission> {
  await delay();
  _opinionSubmitted.add(opinionId);
  const sub: OpinionSubmission = {
    id: `op-sub-${Date.now()}`,
    opinion_id: opinionId,
    user_id: userId,
    selected_option: selectedOption,
    created_at: new Date().toISOString(),
  };
  _opinions.push(sub as OpinionWithArticle);
  _profile = { ..._profile, xp: _profile.xp + 50 };
  return sub;
}

export async function hasUserSubmittedOpinion(_userId: string, opinionId: string): Promise<boolean> {
  await delay(50);
  return _opinionSubmitted.has(opinionId);
}

/* ===================== COMMENTS ===================== */

export async function fetchComments(articleId: string, _page = 1, _pageSize = 10): Promise<Comment[]> {
  await delay();
  return _comments.filter((c) => c.article_id === articleId);
}

export async function addComment(articleId: string, userId: string, content: string): Promise<Comment> {
  await delay();
  const comment: Comment = {
    id: `c-${Date.now()}`,
    article_id: articleId,
    user_id: userId,
    display_name: _profile.display_name,
    avatar_url: _profile.avatar_url,
    content,
    created_at: new Date().toISOString(),
  };
  _comments = [comment, ..._comments];
  return comment;
}

export async function deleteComment(commentId: string, _userId: string): Promise<void> {
  await delay(50);
  _comments = _comments.filter((c) => c.id !== commentId);
}

/* ===================== USER PROFILE ===================== */

export async function fetchProfile(userId?: string): Promise<UserProfile | null> {
  await delay(50);
  if (userId === 'admin-mock-user-id' || _profile.email === 'admin@modernstories.com') {
    return {
      id: 'admin-mock-user-id',
      email: 'admin@modernstories.com',
      display_name: 'Editorial Admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      xp: 3500,
      level: 6,
      bio: 'Lead Editorial Director & Superadmin at The Modern Stories.',
      ..._profile,
      ...(userId === 'admin-mock-user-id' ? { id: 'admin-mock-user-id', email: 'admin@modernstories.com' } : {}),
    };
  }
  return { ..._profile };
}

export async function updateProfile(_userId: string, updates: Partial<UserProfile>): Promise<void> {
  await delay();
  _profile = { ..._profile, ...updates };
}

/* ===================== LEVELS ===================== */

export async function fetchLevels(): Promise<Level[]> {
  await delay(50);
  return [...LEVELS];
}

export async function fetchLevelByNumber(levelNumber: number): Promise<Level | null> {
  await delay(50);
  return LEVELS.find((l) => l.level_number === levelNumber) ?? null;
}

/* ===================== BADGES ===================== */

export async function fetchUserBadges(_userId: string): Promise<UserBadge[]> {
  await delay(50);
  return [...DEFAULT_USER_BADGES];
}

/* ===================== COMPLETION CARDS ===================== */

export async function fetchCompletionCards(_userId: string): Promise<CompletionCard[]> {
  await delay(50);
  return [..._completionCards];
}

export async function createCompletionCard(
  userId: string,
  articleId: string,
  articleTitle: string,
  xpGained: number,
  cardType: 'completion' | 'opinion' = 'completion',
  opinionText?: string,
): Promise<CompletionResult & { card?: CompletionCard }> {
  await delay();

  // Prevent duplicate cards for the same article and type
  const existing = _completionCards.find(
    (c) => c.article_id === articleId && (c.card_type ?? 'completion') === cardType
  );
  if (existing) {
    return {
      card_id: existing.id,
      xp_gained: 0,
      total_xp: _profile.xp,
      new_level: _profile.level,
      already_completed: true,
      card: existing,
    };
  }

  if (cardType === 'completion') {
    _completedArticleIds.add(articleId);
  }

  const newXp = _profile.xp + xpGained;
  const newLevel = LEVELS.filter((l) => l.xp_threshold <= newXp).length;

  _profile = { ..._profile, xp: newXp, level: newLevel };

  const card: CompletionCard = {
    id: `cc-${cardType === 'opinion' ? 'op-' : ''}${Date.now()}`,
    user_id: userId,
    article_id: articleId,
    article_title: articleTitle,
    xp_gained: xpGained,
    created_at: new Date().toISOString(),
    card_type: cardType,
    opinion_text: opinionText,
  };
  _completionCards = [card, ..._completionCards];
  saveCompletionCards(_completionCards);

  return {
    card_id: card.id,
    xp_gained: xpGained,
    total_xp: newXp,
    new_level: newLevel,
    already_completed: false,
    card,
  };
}

export async function createOpinionCard(
  userId: string,
  articleId: string,
  articleTitle: string,
  opinionText: string,
  xpGained = 50,
): Promise<CompletionCard> {
  const result = await createCompletionCard(userId, articleId, articleTitle, xpGained, 'opinion', opinionText);
  return result.card || {
    id: result.card_id,
    user_id: userId,
    article_id: articleId,
    article_title: articleTitle,
    xp_gained: xpGained,
    created_at: new Date().toISOString(),
    card_type: 'opinion',
    opinion_text: opinionText,
  };
}

export async function hasCompletionCard(_userId: string, articleId: string): Promise<boolean> {
  await delay(50);
  return _completedArticleIds.has(articleId) || _completionCards.some((c) => c.article_id === articleId);
}

/* ===================== TEAM ===================== */

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  await delay();
  return [...TEAM_MEMBERS];
}

/* ===================== CONTACT / FEEDBACK ===================== */

export async function submitBusinessEnquiry(_data: {
  name: string; company: string; purpose: string; phone: string; email: string;
}): Promise<void> {
  await delay(400);
  // no-op in mock mode
}

export async function submitFeedback(_data: { content: string }): Promise<void> {
  await delay(400);
  // no-op in mock mode
}

/* ===================== PROFILE DATA ===================== */

export async function fetchReadingHistory(_userId: string): Promise<ReadingHistoryItem[]> {
  await delay();
  return [...DEFAULT_READING_HISTORY];
}

export async function fetchCompletedArticles(_userId: string): Promise<ReadingHistoryItem[]> {
  await delay();
  return _completionCards.map((cc) => {
    const article = ARTICLES.find((a) => a.id === cc.article_id);
    return {
      article_id: cc.article_id,
      user_id: _userId,
      percentage: 100,
      scroll_position: 0,
      completed: true,
      updated_at: cc.created_at,
      article,
    };
  });
}

export async function fetchSavedArticles(_userId: string): Promise<SavedArticleItem[]> {
  await delay();
  return _bookmarkList.map((b) => ({
    ...b,
    article: ARTICLES.find((a) => a.id === b.article_id),
  }));
}

export async function fetchQuizStats(_userId: string): Promise<QuizStats> {
  await delay(50);
  const total = _quizAttempted.size;
  return { total, correct: total, incorrect: 0, accuracy: total > 0 ? 100 : 0 };
}

export async function fetchUserOpinions(_userId: string): Promise<OpinionWithArticle[]> {
  await delay();
  return [...DEFAULT_OPINIONS];
}

export async function fetchAllBadges(_userId: string): Promise<{ all: Badge[]; earned: Set<string> }> {
  await delay();
  const earned = new Set(DEFAULT_USER_BADGES.map((ub) => ub.badge_id));
  return { all: [...BADGES], earned };
}

export async function fetchAchievementHistory(_userId: string): Promise<AchievementItem[]> {
  await delay();
  return [...DEFAULT_ACHIEVEMENTS];
}

/* ===================== AVATAR UPLOAD ===================== */

export async function uploadAvatar(_userId: string, file: File): Promise<string> {
  await delay(600);
  // Return a local object URL as placeholder (no actual upload)
  return URL.createObjectURL(file);
}

export async function updateAvatar(_userId: string, avatarUrl: string): Promise<void> {
  await delay(50);
  _profile = { ..._profile, avatar_url: avatarUrl };
}

/* ===================== COUNTS ===================== */

export async function fetchArticlesCompletedCount(_userId: string): Promise<number> {
  return _completionCards.length;
}

export async function fetchShareCardsCount(_userId: string): Promise<number> {
  return _completionCards.length;
}

export async function fetchOpinionsCount(_userId: string): Promise<number> {
  return _opinionSubmitted.size;
}
