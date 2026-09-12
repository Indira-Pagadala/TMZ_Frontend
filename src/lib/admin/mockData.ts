/*
 * Mock data for the Superadmin CMS.
 *
 * BACKEND INTEGRATION GUIDE:
 * Each export below corresponds to a backend entity. Replace the mock
 * arrays with API calls in adminApi.ts. The TypeScript interfaces in
 * adminTypes.ts define the exact shapes your backend should return.
 *
 * Key mappings:
 * - articles → GET /api/v1/superadmin/articles
 * - categories → GET /api/v1/superadmin/categories
 * - quizzes → GET /api/v1/superadmin/quizzes
 * - opinions → GET /api/v1/superadmin/opinions
 * - comments → GET /api/v1/superadmin/comments
 * - users → GET /api/v1/superadmin/users
 * - xpRules → GET /api/v1/superadmin/xp-rules
 * - levels → GET /api/v1/superadmin/levels
 * - badges → GET /api/v1/superadmin/badges
 * - promotions → GET /api/v1/superadmin/promotions
 * - advertisements → GET /api/v1/superadmin/advertisements
 * - adSlots → GET /api/v1/superadmin/ad-slots
 * - media → GET /api/v1/superadmin/media
 * - analytics → GET /api/v1/analytics/dashboard
 * - feedback → GET /api/v1/superadmin/feedback
 * - businessEnquiries → GET /api/v1/superadmin/business-enquiries
 * - auditLogs → GET /api/v1/superadmin/audit-logs
 */

import type {
  AdminArticle, AdminCategory, AdminQuiz, AdminOpinion, AdminComment,
  AdminUser, XPRule, AdminLevel, AdminBadge, AdminPromotion,
  Advertisement, AdSlot, MediaItem, AnalyticsData, FeedbackItem,
  BusinessEnquiry, AuditLog,
} from './adminTypes';

export const mockCategories: AdminCategory[] = [
  { id: 'cat-1', name: 'Technology', slug: 'technology', description: 'Latest in tech and innovation', image_url: null, article_count: 12, created_at: '2026-08-01T10:00:00Z' },
  { id: 'cat-2', name: 'Science', slug: 'science', description: 'Scientific discoveries and research', image_url: null, article_count: 8, created_at: '2026-08-01T10:00:00Z' },
  { id: 'cat-3', name: 'Culture', slug: 'culture', description: 'Cultural commentary and arts', image_url: null, article_count: 5, created_at: '2026-08-01T10:00:00Z' },
  { id: 'cat-4', name: 'Business', slug: 'business', description: 'Business and finance insights', image_url: null, article_count: 6, created_at: '2026-08-01T10:00:00Z' },
];

export const mockArticles: AdminArticle[] = [
  {
    id: 'art-1', title: 'The Future of Quantum Computing', subtitle: 'How quantum processors will reshape everything',
    summary: 'An in-depth look at quantum computing breakthroughs in 2026.',
    category_id: 'cat-1', category_name: 'Technology', article_type: 'ARTICLE',
    status: 'PUBLISHED', cover_image_url: null, author_name: 'Dr. Sarah Chen',
    is_featured: true, is_authors_pick: true, reading_time_minutes: 8,
    published_at: '2026-09-01T14:00:00Z', scheduled_at: null, created_at: '2026-08-28T10:00:00Z',
  },
  {
    id: 'art-2', title: 'Mars Colony: The First 100 Days', subtitle: 'A documentary-style deep dive',
    summary: 'What life looks like for the first Mars settlers.',
    category_id: 'cat-2', category_name: 'Science', article_type: 'PODCAST',
    status: 'PENDING_REVIEW', cover_image_url: null, author_name: 'James Park',
    is_featured: false, is_authors_pick: false, reading_time_minutes: 15,
    published_at: null, scheduled_at: null, created_at: '2026-09-03T09:00:00Z',
  },
  {
    id: 'art-3', title: 'The Economics of AI', subtitle: 'Understanding the AI market',
    summary: 'A quiz-driven exploration of AI economics.',
    category_id: 'cat-4', category_name: 'Business', article_type: 'QUIZ',
    status: 'DRAFT', cover_image_url: null, author_name: 'Maria Lopez',
    is_featured: false, is_authors_pick: false, reading_time_minutes: 5,
    published_at: null, scheduled_at: null, created_at: '2026-09-05T12:00:00Z',
  },
  {
    id: 'art-4', title: 'Digital Art Renaissance', subtitle: 'The new wave of creators',
    summary: 'How digital tools are transforming art.',
    category_id: 'cat-3', category_name: 'Culture', article_type: 'ARTICLE',
    status: 'PUBLISHED', cover_image_url: null, author_name: 'Tom Wright',
    is_featured: false, is_authors_pick: true, reading_time_minutes: 6,
    published_at: '2026-09-02T14:00:00Z', scheduled_at: null, created_at: '2026-08-30T10:00:00Z',
  },
  {
    id: 'art-5', title: 'The Opinion Divide', subtitle: 'Reader perspectives on climate',
    summary: 'An opinion-driven piece on climate policy.',
    category_id: 'cat-2', category_name: 'Science', article_type: 'OPINION',
    status: 'SCHEDULED', cover_image_url: null, author_name: 'Dr. Sarah Chen',
    is_featured: false, is_authors_pick: false, reading_time_minutes: 4,
    published_at: null, scheduled_at: '2026-09-15T10:00:00Z', created_at: '2026-09-04T15:00:00Z',
  },
  {
    id: 'art-6', title: 'Neural Networks Explained', subtitle: 'A beginner-friendly guide',
    summary: 'Understanding the basics of neural networks.',
    category_id: 'cat-1', category_name: 'Technology', article_type: 'ARTICLE',
    status: 'UNPUBLISHED', cover_image_url: null, author_name: 'James Park',
    is_featured: false, is_authors_pick: false, reading_time_minutes: 10,
    published_at: '2026-08-20T14:00:00Z', scheduled_at: null, created_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 'art-7', title: 'The Startup Playbook 2026', subtitle: 'Lessons from founders',
    summary: 'A rejected article about startup strategies.',
    category_id: 'cat-4', category_name: 'Business', article_type: 'ARTICLE',
    status: 'REJECTED', cover_image_url: null, author_name: 'Maria Lopez',
    is_featured: false, is_authors_pick: false, reading_time_minutes: 7,
    published_at: null, scheduled_at: null, created_at: '2026-08-25T10:00:00Z',
  },
  {
    id: 'art-8', title: 'Archived: Web3 Revisited', subtitle: 'A retrospective',
    summary: 'An archived article from earlier in the year.',
    category_id: 'cat-1', category_name: 'Technology', article_type: 'ARTICLE',
    status: 'ARCHIVED', cover_image_url: null, author_name: 'Tom Wright',
    is_featured: false, is_authors_pick: false, reading_time_minutes: 6,
    published_at: '2026-07-01T14:00:00Z', scheduled_at: null, created_at: '2026-06-28T10:00:00Z',
  },
];

export const mockQuizzes: AdminQuiz[] = [
  {
    id: 'quiz-1', article_id: 'art-3', article_title: 'The Economics of AI',
    title: 'AI Market Fundamentals', question: 'What is the primary driver of AI market growth?',
    xp_reward: 10,
    options: [
      { id: 'opt-1', label: 'Hardware advancements', is_correct: false, explanation: 'While important, software is the primary driver.', order_index: 0 },
      { id: 'opt-2', label: 'Software and algorithms', is_correct: true, explanation: 'Algorithmic breakthroughs drive the market.', order_index: 1 },
      { id: 'opt-3', label: 'Government regulation', is_correct: false, explanation: 'Regulation follows, not drives, growth.', order_index: 2 },
      { id: 'opt-4', label: 'Consumer demand', is_correct: false, explanation: 'Demand is a factor but not the primary driver.', order_index: 3 },
    ],
  },
  {
    id: 'quiz-2', article_id: 'art-1', article_title: 'The Future of Quantum Computing',
    title: 'Quantum Basics', question: 'What is a qubit?',
    xp_reward: 15,
    options: [
      { id: 'opt-5', label: 'A classical bit', is_correct: false, explanation: 'A classical bit is binary.', order_index: 0 },
      { id: 'opt-6', label: 'A quantum bit', is_correct: true, explanation: 'A qubit is the basic unit of quantum information.', order_index: 1 },
      { id: 'opt-7', label: 'A type of processor', is_correct: false, explanation: 'A qubit is not a processor.', order_index: 2 },
    ],
  },
];

export const mockOpinions: AdminOpinion[] = [
  {
    id: 'op-1', article_id: 'art-5', article_title: 'The Opinion Divide',
    question: 'Should climate policy prioritize economic growth or environmental protection?',
    options: ['Economic growth first', 'Environmental protection first', 'Balance both equally'],
    xp_reward: 5,
  },
  {
    id: 'op-2', article_id: 'art-4', article_title: 'Digital Art Renaissance',
    question: 'Is AI-generated art truly creative?',
    options: ['Yes, it is creative', 'No, it lacks intent', 'It depends on the context'],
    xp_reward: 5,
  },
];

export const mockComments: AdminComment[] = Array.from({ length: 25 }, (_, i) => ({
  id: `cmt-${i + 1}`,
  article_id: `art-${(i % 8) + 1}`,
  article_title: mockArticles[i % 8]?.title ?? 'Unknown',
  user_id: `user-${i + 1}`,
  display_name: `User ${i + 1}`,
  avatar_url: null,
  content: `This is comment number ${i + 1}. Great article! ${i % 3 === 0 ? 'I disagree with the author though.' : 'Very insightful.'}`,
  status: i % 4 === 0 ? 'hidden' : 'visible',
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
}));

export const mockUsers: AdminUser[] = [
  { id: 'user-1', email: 'sarah@example.com', display_name: 'Dr. Sarah Chen', role: 'admin', xp: 1250, level: 5, avatar_url: null, status: 'active', created_at: '2026-07-01T10:00:00Z', articles_completed: 18, quizzes_correct: 12 },
  { id: 'user-2', email: 'james@example.com', display_name: 'James Park', role: 'editor', xp: 820, level: 4, avatar_url: null, status: 'active', created_at: '2026-07-05T10:00:00Z', articles_completed: 10, quizzes_correct: 8 },
  { id: 'user-3', email: 'maria@example.com', display_name: 'Maria Lopez', role: 'author', xp: 540, level: 3, avatar_url: null, status: 'active', created_at: '2026-07-10T10:00:00Z', articles_completed: 7, quizzes_correct: 5 },
  { id: 'user-4', email: 'tom@example.com', display_name: 'Tom Wright', role: 'author', xp: 380, level: 2, avatar_url: null, status: 'active', created_at: '2026-07-15T10:00:00Z', articles_completed: 5, quizzes_correct: 3 },
  { id: 'user-5', email: 'reader@example.com', display_name: 'Jane Reader', role: 'user', xp: 150, level: 1, avatar_url: null, status: 'active', created_at: '2026-08-01T10:00:00Z', articles_completed: 3, quizzes_correct: 1 },
  { id: 'user-6', email: 'banned@example.com', display_name: 'Bad Actor', role: 'user', xp: 0, level: 1, avatar_url: null, status: 'suspended', created_at: '2026-08-10T10:00:00Z', articles_completed: 0, quizzes_correct: 0 },
];

export const mockXPRules: XPRule[] = [
  { id: 'xpr-1', action: 'ARTICLE_COMPLETION', xp_amount: 30, description: 'Awarded when a reader completes an article' },
  { id: 'xpr-2', action: 'QUIZ_CORRECT', xp_amount: 10, description: 'Awarded for a correct quiz answer' },
  { id: 'xpr-3', action: 'QUIZ_INCORRECT', xp_amount: 2, description: 'Consolation XP for attempting a quiz' },
  { id: 'xpr-4', action: 'OPINION_SUBMISSION', xp_amount: 5, description: 'Awarded for submitting an opinion' },
  { id: 'xpr-5', action: 'DAILY_LOGIN', xp_amount: 5, description: 'Daily login bonus' },
  { id: 'xpr-6', action: 'ARTICLE_BOOKMARK', xp_amount: 1, description: 'Awarded for bookmarking an article' },
];

export const mockLevels: AdminLevel[] = [
  { id: 'lvl-1', level_number: 1, name: 'Novice', xp_threshold: 0, image_url: null },
  { id: 'lvl-2', level_number: 2, name: 'Reader', xp_threshold: 100, image_url: null },
  { id: 'lvl-3', level_number: 3, name: 'Scholar', xp_threshold: 300, image_url: null },
  { id: 'lvl-4', level_number: 4, name: 'Expert', xp_threshold: 600, image_url: null },
  { id: 'lvl-5', level_number: 5, name: 'Master', xp_threshold: 1000, image_url: null },
  { id: 'lvl-6', level_number: 6, name: 'Sage', xp_threshold: 2000, image_url: null },
];

export const mockBadges: AdminBadge[] = [
  { id: 'bdg-1', name: 'First Steps', description: 'Complete your first article', image_url: null },
  { id: 'bdg-2', name: 'Quiz Master', description: 'Answer 10 quizzes correctly', image_url: null },
  { id: 'bdg-3', name: 'Opinion Leader', description: 'Submit 5 opinions', image_url: null },
  { id: 'bdg-4', name: 'Bookworm', description: 'Bookmark 10 articles', image_url: null },
  { id: 'bdg-5', name: 'Scholar', description: 'Reach level 3', image_url: null },
  { id: 'bdg-6', name: 'Completionist', description: 'Complete 20 articles', image_url: null },
];

export const mockPromotions: AdminPromotion[] = [
  { id: 'promo-1', title: 'Tech Summit 2026', description: 'Join the biggest tech conference of the year', image_url: 'https://example.com/tech.jpg', external_url: 'https://example.com', date_time: '2026-10-15T09:00:00Z', active: true, created_at: '2026-09-01T10:00:00Z' },
  { id: 'promo-2', title: 'Science Fair', description: 'Annual science exhibition', image_url: 'https://example.com/sci.jpg', external_url: 'https://example.com', date_time: '2026-11-01T10:00:00Z', active: true, created_at: '2026-09-02T10:00:00Z' },
  { id: 'promo-3', title: 'Winter Sale', description: 'Special winter promotion', image_url: 'https://example.com/winter.jpg', external_url: 'https://example.com', date_time: null, active: false, created_at: '2026-08-20T10:00:00Z' },
];

export const mockAdvertisements: Advertisement[] = [
  { id: 'ad-1', title: 'Tech Gadget Sale', image_url: 'https://example.com/ad1.jpg', target_url: 'https://example.com/sale', ad_slot_id: 'slot-1', status: 'ACTIVE', starts_at: '2026-09-01T00:00:00Z', ends_at: '2026-09-30T23:59:59Z', clicks: 342, impressions: 12500, created_at: '2026-08-28T10:00:00Z' },
  { id: 'ad-2', title: 'Book Launch', image_url: 'https://example.com/ad2.jpg', target_url: 'https://example.com/book', ad_slot_id: 'slot-2', status: 'ACTIVE', starts_at: '2026-09-05T00:00:00Z', ends_at: null, clicks: 128, impressions: 5400, created_at: '2026-09-01T10:00:00Z' },
  { id: 'ad-3', title: 'Old Campaign', image_url: 'https://example.com/ad3.jpg', target_url: 'https://example.com/old', ad_slot_id: 'slot-1', status: 'INACTIVE', starts_at: '2026-07-01T00:00:00Z', ends_at: '2026-08-01T00:00:00Z', clicks: 89, impressions: 3200, created_at: '2026-06-28T10:00:00Z' },
];

export const mockAdSlots: AdSlot[] = [
  { id: 'slot-1', name: 'Sidebar Banner', slug: 'sidebar-banner', description: 'Right sidebar on article pages', placement: 'sidebar', is_active: true, created_at: '2026-08-01T10:00:00Z' },
  { id: 'slot-2', name: 'In-Article Mid', slug: 'in-article-mid', description: 'Mid-article placement between blocks', placement: 'in-article', is_active: true, created_at: '2026-08-01T10:00:00Z' },
  { id: 'slot-3', name: 'Homepage Hero', slug: 'homepage-hero', description: 'Homepage hero banner', placement: 'homepage', is_active: false, created_at: '2026-08-01T10:00:00Z' },
];

export const mockMedia: MediaItem[] = [
  { id: 'med-1', filename: 'quantum-cover.jpg', file_path: '/uploads/quantum-cover.jpg', file_type: 'image/jpeg', file_size: 245678, uploaded_by: 'sarah@example.com', created_at: '2026-08-28T10:00:00Z' },
  { id: 'med-2', filename: 'mars-podcast.mp3', file_path: '/uploads/mars-podcast.mp3', file_type: 'audio/mpeg', file_size: 52428800, uploaded_by: 'james@example.com', created_at: '2026-09-03T09:00:00Z' },
  { id: 'med-3', filename: 'ai-diagram.png', file_path: '/uploads/ai-diagram.png', file_type: 'image/png', file_size: 89012, uploaded_by: 'maria@example.com', created_at: '2026-09-05T12:00:00Z' },
  { id: 'med-4', filename: 'digital-art.jpg', file_path: '/uploads/digital-art.jpg', file_type: 'image/jpeg', file_size: 178234, uploaded_by: 'tom@example.com', created_at: '2026-08-30T10:00:00Z' },
];

export const mockAnalytics: AnalyticsData = {
  totals: {
    articles: 8,
    published_articles: 2,
    draft_articles: 1,
    pending_review: 1,
    users: 6,
    active_users: 5,
    comments: 25,
    quiz_attempts: 48,
    opinion_submissions: 32,
    completions: 43,
    shares: 18,
    ad_clicks: 559,
    ad_impressions: 21100,
  },
  engagement: {
    avg_reading_time: 7.5,
    avg_completion_rate: 68,
    quiz_accuracy: 75,
    bookmark_rate: 22,
  },
  recent_activity: [
    { label: 'Articles Published', value: 2, change: '+2 this week' },
    { label: 'New Users', value: 3, change: '+1 this week' },
    { label: 'Comments', value: 25, change: '+8 this week' },
    { label: 'Quiz Attempts', value: 48, change: '+12 this week' },
    { label: 'Completions', value: 43, change: '+7 this week' },
    { label: 'Opinion Submissions', value: 32, change: '+5 this week' },
  ],
};

export const mockFeedback: FeedbackItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: `fb-${i + 1}`,
  content: `This is feedback item ${i + 1}. ${i % 2 === 0 ? 'I love the platform!' : 'I wish there were more articles about space.'}`,
  user_email: i % 3 === 0 ? `reader${i}@example.com` : null,
  status: i % 4 === 0 ? 'resolved' : 'new',
  created_at: new Date(Date.now() - i * 7200000).toISOString(),
}));

export const mockBusinessEnquiries: BusinessEnquiry[] = Array.from({ length: 12 }, (_, i) => ({
  id: `be-${i + 1}`,
  name: `Contact ${i + 1}`,
  company: i % 2 === 0 ? 'TechCorp Inc' : 'MediaGroup LLC',
  purpose: i % 3 === 0 ? 'Partnership' : i % 3 === 1 ? 'Advertising' : 'Sponsorship',
  phone: `+1-555-01${i}`,
  email: `contact${i}@company.com`,
  status: i % 5 === 0 ? 'resolved' : 'new',
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

export const mockAuditLogs: AuditLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `log-${i + 1}`,
  actor_id: `user-${(i % 4) + 1}`,
  actor_name: ['Dr. Sarah Chen', 'James Park', 'Maria Lopez', 'Tom Wright'][i % 4],
  action: ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH'][i % 5],
  entity_type: ['article', 'category', 'quiz', 'user', 'promotion'][i % 5],
  entity_id: `ent-${i + 1}`,
  details: { summary: `${['Created', 'Updated', 'Deleted', 'Published', 'Unpublished'][i % 5]} ${['article', 'category', 'quiz', 'user', 'promotion'][i % 5]} #${i + 1}` },
  created_at: new Date(Date.now() - i * 1800000).toISOString(),
}));
