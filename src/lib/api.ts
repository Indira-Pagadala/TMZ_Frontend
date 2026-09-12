import { supabase } from './supabase';
import type {
  Category,
  Promotion,
  Article,
  ArticleWithBlocks,
  Comment,
  ReadingProgress,
  UserProfile,
  Level,
  Badge,
  UserBadge,
  Bookmark,
  QuizAttempt,
  OpinionSubmission,
  CompletionCard,
  TeamMember,
  ReadingHistoryItem,
  SavedArticleItem,
  QuizStats,
  OpinionWithArticle,
  AchievementItem,
  CompletionResult,
  QuizAttemptResult,
} from '@/types';

/* Categories */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* Promotions */
export async function fetchPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* Articles */
export async function fetchLatestArticles(limit = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchArticlesByCategory(categoryId: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAuthorsPicks(limit = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .eq('is_authors_pick', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchFeaturedArticles(limit = 5): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchArticleById(id: string): Promise<ArticleWithBlocks | null> {
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (articleError) throw articleError;
  if (!article) return null;

  const { data: blocks, error: blocksError } = await supabase
    .from('article_blocks')
    .select('*')
    .eq('article_id', id)
    .order('order_index');
  if (blocksError) throw blocksError;

  const enrichedBlocks = await Promise.all(
    (blocks ?? []).map(async (block) => {
      let quiz = null;
      let opinion = null;
      let podcast = null;

      if (block.quiz_id) {
        const { data } = await supabase
          .from('quizzes')
          .select('*, options:quiz_options(*)')
          .eq('id', block.quiz_id)
          .maybeSingle();
        quiz = data;
      }

      if (block.opinion_id) {
        const { data } = await supabase
          .from('opinions')
          .select('*')
          .eq('id', block.opinion_id)
          .maybeSingle();
        opinion = data;
      }

      if (block.podcast_id) {
        const { data } = await supabase
          .from('podcast_blocks')
          .select('*')
          .eq('id', block.podcast_id)
          .maybeSingle();
        podcast = data;
      }

      return { ...block, quiz, opinion, podcast };
    }),
  );

  return { ...article, blocks: enrichedBlocks };
}

/* Bookmarks */
export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function isBookmarked(userId: string, articleId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function addBookmark(userId: string, articleId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, article_id: articleId });
  if (error) throw error;
}

export async function removeBookmark(userId: string, articleId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', articleId);
  if (error) throw error;
}

/* Reading Progress */
export async function fetchReadingProgress(userId: string, articleId: string): Promise<ReadingProgress | null> {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateReadingProgress(
  userId: string,
  articleId: string,
  percentage: number,
  scrollPosition: number,
  completed: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: userId,
      article_id: articleId,
      percentage,
      scroll_position: Math.round(scrollPosition),
      completed,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,article_id' });
  if (error) throw error;
}

/* Quiz Attempts */
export async function submitQuizAttempt(
  quizId: string,
  _userId: string,
  selectedOptionId: string,
  isCorrect: boolean,
  xpEarned: number,
): Promise<QuizAttemptResult> {
  const { data, error } = await supabase
    .rpc('award_quiz_xp', {
      p_quiz_id: quizId,
      p_selected_option_id: selectedOptionId,
      p_is_correct: isCorrect,
      p_xp_earned: xpEarned,
    });
  if (error) throw error;
  return data;
}

export async function hasUserAttemptedQuiz(userId: string, quizId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/* Opinion Submissions */
export async function submitOpinion(
  opinionId: string,
  userId: string,
  selectedOption: string,
): Promise<OpinionSubmission> {
  const { data, error } = await supabase
    .from('opinion_submissions')
    .insert({
      opinion_id: opinionId,
      user_id: userId,
      selected_option: selectedOption,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function hasUserSubmittedOpinion(userId: string, opinionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('opinion_submissions')
    .select('id')
    .eq('user_id', userId)
    .eq('opinion_id', opinionId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/* Comments */
export async function fetchComments(articleId: string, page = 1, pageSize = 10): Promise<Comment[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return data ?? [];
}

export async function addComment(articleId: string, userId: string, content: string): Promise<Comment> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  const { data, error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      user_id: userId,
      display_name: profile?.display_name || 'Anonymous',
      avatar_url: profile?.avatar_url,
      content,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);
  if (error) throw error;
}

/* User Profile */
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

/* Levels */
export async function fetchLevels(): Promise<Level[]> {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('level_number');
  if (error) throw error;
  return data ?? [];
}

export async function fetchLevelByNumber(levelNumber: number): Promise<Level | null> {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('level_number', levelNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* Badges */
export async function fetchUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* Completion Cards */
export async function fetchCompletionCards(userId: string): Promise<CompletionCard[]> {
  const { data, error } = await supabase
    .from('completion_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCompletionCard(
  _userId: string,
  articleId: string,
  _articleTitle: string,
  xpGained: number,
): Promise<CompletionResult> {
  const { data, error } = await supabase
    .rpc('award_completion_xp', {
      p_article_id: articleId,
      p_xp_amount: xpGained,
    });
  if (error) throw error;
  return data;
}

export async function hasCompletionCard(userId: string, articleId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('completion_cards')
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/* Team */
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('order_index');
  if (error) throw error;
  return data ?? [];
}

/* Contact forms — abstraction for future backend connection */
export async function submitBusinessEnquiry(data: {
  name: string;
  company: string;
  purpose: string;
  phone: string;
  email: string;
}): Promise<void> {
  const { error } = await supabase.from('business_enquiries').insert(data);
  if (error) throw error;
}

export async function submitFeedback(data: { content: string }): Promise<void> {
  const { error } = await supabase.from('feedback').insert(data);
  if (error) throw error;
}

/* ===== Part 3: Profile data ===== */

/* Reading History (unfinished articles) */
export async function fetchReadingHistory(userId: string): Promise<ReadingHistoryItem[]> {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*, article:articles(*)')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* Completed articles */
export async function fetchCompletedArticles(userId: string): Promise<ReadingHistoryItem[]> {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*, article:articles(*)')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* Saved articles (bookmarks with article data) */
export async function fetchSavedArticles(userId: string): Promise<SavedArticleItem[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, article:articles(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* Quiz stats */
export async function fetchQuizStats(userId: string): Promise<QuizStats> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('is_correct')
    .eq('user_id', userId);
  if (error) throw error;
  const attempts = data ?? [];
  const total = attempts.length;
  const correct = attempts.filter((a: { is_correct: boolean }) => a.is_correct).length;
  const incorrect = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { total, correct, incorrect, accuracy };
}

/* Opinions with article data */
export async function fetchUserOpinions(userId: string): Promise<OpinionWithArticle[]> {
  const { data, error } = await supabase
    .from('opinion_submissions')
    .select('*, opinion:opinions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const submissions = data ?? [];
  const withArticles = await Promise.all(
    submissions.map(async (sub: OpinionWithArticle) => {
      if (sub.opinion?.article_id) {
        const { data: art } = await supabase
          .from('articles')
          .select('*')
          .eq('id', sub.opinion.article_id)
          .maybeSingle();
        return { ...sub, article: art };
      }
      return sub;
    }),
  );
  return withArticles;
}

/* All badges (earned + unearned) */
export async function fetchAllBadges(userId: string): Promise<{ all: Badge[]; earned: Set<string> }> {
  const [allBadges, userBadges] = await Promise.all([
    supabase.from('badges').select('*').order('name'),
    supabase.from('user_badges').select('badge_id').eq('user_id', userId),
  ]);
  if (allBadges.error) throw allBadges.error;
  if (userBadges.error) throw userBadges.error;
  const earned = new Set((userBadges.data ?? []).map((ub: { badge_id: string }) => ub.badge_id));
  return { all: allBadges.data ?? [], earned };
}

/* Achievement history (completion cards + badges + quiz milestones) */
export async function fetchAchievementHistory(userId: string): Promise<AchievementItem[]> {
  const [cards, badges, quizAttempts] = await Promise.all([
    supabase.from('completion_cards').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', userId).order('earned_at', { ascending: false }),
    supabase.from('quiz_attempts').select('*').eq('user_id', userId).eq('is_correct', true).order('created_at', { ascending: false }),
  ]);

  const items: AchievementItem[] = [];

  for (const card of cards.data ?? []) {
    items.push({
      id: `card-${card.id}`,
      type: 'completion',
      title: 'Article Completed',
      description: card.article_title,
      date: card.created_at,
      xp: card.xp_gained,
      article_title: card.article_title,
    });
  }

  for (const ub of badges.data ?? []) {
    items.push({
      id: `badge-${ub.id}`,
      type: 'badge',
      title: ub.badge?.name ?? 'Badge Earned',
      description: ub.badge?.description ?? '',
      date: ub.earned_at,
      xp: 0,
      badge_image: ub.badge?.image_url ?? null,
    });
  }

  for (const qa of (quizAttempts.data ?? []).slice(0, 5)) {
    items.push({
      id: `quiz-${qa.id}`,
      type: 'quiz',
      title: 'Quiz Correct Answer',
      description: `Earned ${qa.xp_earned} XP`,
      date: qa.created_at,
      xp: qa.xp_earned,
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

/* Avatar upload */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `avatars/${userId}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

/* Update profile with avatar */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);
  if (error) throw error;
}

/* Articles completed count */
export async function fetchArticlesCompletedCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('completion_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}

/* Share cards count */
export async function fetchShareCardsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('completion_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}

/* Opinions submitted count */
export async function fetchOpinionsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('opinion_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}
