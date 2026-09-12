/*
 * Admin API layer for the Superadmin CMS.
 *
 * BACKEND INTEGRATION GUIDE:
 * Every function here currently returns mock data with a simulated delay.
 * To integrate with your backend, replace the mock data retrieval with
 * real fetch/supabase calls. The function signatures and return types
 * should stay the same so the UI doesn't need to change.
 *
 * Example integration:
 *
 * export async function fetchArticles(filters?: ArticleFilters): Promise<AdminArticle[]> {
 *   const res = await fetch('/api/v1/superadmin/articles');
 *   if (!res.ok) throw new Error('Failed to fetch articles');
 *   return res.json();
 * }
 */

import type {
  AdminArticle, AdminCategory, AdminQuiz, AdminOpinion, AdminComment,
  AdminUser, XPRule, AdminLevel, AdminBadge, AdminPromotion,
  Advertisement, AdSlot, MediaItem, AnalyticsData, FeedbackItem,
  BusinessEnquiry, AuditLog, ArticleStatus,
} from './adminTypes';
import {
  mockArticles, mockCategories, mockQuizzes, mockOpinions, mockComments,
  mockUsers, mockXPRules, mockLevels, mockBadges, mockPromotions,
  mockAdvertisements, mockAdSlots, mockMedia, mockAnalytics, mockFeedback,
  mockBusinessEnquiries, mockAuditLogs,
} from './mockData';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/* ===== Articles ===== */

export interface ArticleFilters {
  status?: ArticleStatus | 'ALL';
  search?: string;
  category?: string;
}

export async function fetchArticles(filters?: ArticleFilters): Promise<AdminArticle[]> {
  await delay();
  let result = [...mockArticles];
  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((a) => a.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q) || a.author_name?.toLowerCase().includes(q),
    );
  }
  if (filters?.category && filters.category !== 'all') {
    result = result.filter((a) => a.category_id === filters.category);
  }
  return result;
}

export async function fetchArticleById(id: string): Promise<AdminArticle | null> {
  await delay();
  return mockArticles.find((a) => a.id === id) ?? null;
}

export async function createArticle(data: Partial<AdminArticle>): Promise<AdminArticle> {
  await delay();
  return {
    id: `art-${Date.now()}`,
    title: data.title || 'Untitled',
    subtitle: data.subtitle || '',
    summary: data.summary || null,
    category_id: data.category_id || null,
    category_name: data.category_name,
    article_type: data.article_type || 'ARTICLE',
    status: data.status || 'DRAFT',
    cover_image_url: data.cover_image_url || null,
    author_name: data.author_name || null,
    is_featured: data.is_featured || false,
    is_authors_pick: data.is_authors_pick || false,
    reading_time_minutes: data.reading_time_minutes || null,
    published_at: data.published_at || null,
    scheduled_at: data.scheduled_at || null,
    created_at: new Date().toISOString(),
  };
}

export async function updateArticle(id: string, updates: Partial<AdminArticle>): Promise<void> {
  await delay();
  const idx = mockArticles.findIndex((a) => a.id === id);
  if (idx >= 0) Object.assign(mockArticles[idx], updates);
}

export async function deleteArticle(id: string): Promise<void> {
  await delay();
  const idx = mockArticles.findIndex((a) => a.id === id);
  if (idx >= 0) mockArticles.splice(idx, 1);
}

export async function searchArticles(query: string): Promise<AdminArticle[]> {
  await delay(150);
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return mockArticles
    .filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q))
    .slice(0, 8);
}

/* ===== Categories ===== */

export async function fetchCategories(): Promise<AdminCategory[]> {
  await delay();
  return [...mockCategories];
}

export async function createCategory(data: Partial<AdminCategory>): Promise<AdminCategory> {
  await delay();
  return {
    id: `cat-${Date.now()}`,
    name: data.name || 'New Category',
    slug: data.slug || 'new-category',
    description: data.description || null,
    image_url: data.image_url || null,
    article_count: 0,
    created_at: new Date().toISOString(),
  };
}

export async function updateCategory(id: string, updates: Partial<AdminCategory>): Promise<void> {
  await delay();
  const idx = mockCategories.findIndex((c) => c.id === id);
  if (idx >= 0) Object.assign(mockCategories[idx], updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await delay();
  const idx = mockCategories.findIndex((c) => c.id === id);
  if (idx >= 0) mockCategories.splice(idx, 1);
}

/* ===== Quizzes ===== */

export async function fetchQuizzes(): Promise<AdminQuiz[]> {
  await delay();
  return [...mockQuizzes];
}

export async function createQuiz(data: Partial<AdminQuiz>): Promise<AdminQuiz> {
  await delay();
  return {
    id: `quiz-${Date.now()}`,
    article_id: data.article_id || '',
    title: data.title || 'New Quiz',
    question: data.question || '',
    xp_reward: data.xp_reward || 10,
    options: data.options || [],
  };
}

export async function updateQuiz(id: string, updates: Partial<AdminQuiz>): Promise<void> {
  await delay();
  const idx = mockQuizzes.findIndex((q) => q.id === id);
  if (idx >= 0) Object.assign(mockQuizzes[idx], updates);
}

export async function deleteQuiz(id: string): Promise<void> {
  await delay();
  const idx = mockQuizzes.findIndex((q) => q.id === id);
  if (idx >= 0) mockQuizzes.splice(idx, 1);
}

/* ===== Opinions ===== */

export async function fetchOpinions(): Promise<AdminOpinion[]> {
  await delay();
  return [...mockOpinions];
}

export async function createOpinion(data: Partial<AdminOpinion>): Promise<AdminOpinion> {
  await delay();
  return {
    id: `op-${Date.now()}`,
    article_id: data.article_id || '',
    question: data.question || 'New Opinion',
    options: data.options || [],
    xp_reward: data.xp_reward || 5,
  };
}

export async function updateOpinion(id: string, updates: Partial<AdminOpinion>): Promise<void> {
  await delay();
  const idx = mockOpinions.findIndex((o) => o.id === id);
  if (idx >= 0) Object.assign(mockOpinions[idx], updates);
}

export async function deleteOpinion(id: string): Promise<void> {
  await delay();
  const idx = mockOpinions.findIndex((o) => o.id === id);
  if (idx >= 0) mockOpinions.splice(idx, 1);
}

/* ===== Comments ===== */

export async function fetchComments(page = 1, pageSize = 10): Promise<{ items: AdminComment[]; total: number }> {
  await delay();
  const start = (page - 1) * pageSize;
  return {
    items: mockComments.slice(start, start + pageSize),
    total: mockComments.length,
  };
}

export async function updateCommentStatus(id: string, status: AdminComment['status']): Promise<void> {
  await delay();
  const idx = mockComments.findIndex((c) => c.id === id);
  if (idx >= 0) mockComments[idx].status = status;
}

export async function deleteComment(id: string): Promise<void> {
  await delay();
  const idx = mockComments.findIndex((c) => c.id === id);
  if (idx >= 0) mockComments.splice(idx, 1);
}

/* ===== Users ===== */

export async function fetchUsers(page = 1, pageSize = 10, search?: string): Promise<{ items: AdminUser[]; total: number }> {
  await delay();
  let result = [...mockUsers];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((u) => u.display_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  const start = (page - 1) * pageSize;
  return {
    items: result.slice(start, start + pageSize),
    total: result.length,
  };
}

export async function updateUserStatus(id: string, status: AdminUser['status']): Promise<void> {
  await delay();
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx >= 0) mockUsers[idx].status = status;
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  await delay();
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx >= 0) mockUsers[idx].role = role;
}

/* ===== XP Rules ===== */

export async function fetchXPRules(): Promise<XPRule[]> {
  await delay();
  return [...mockXPRules];
}

export async function createXPRule(data: Partial<XPRule>): Promise<XPRule> {
  await delay();
  return {
    id: `xpr-${Date.now()}`,
    action: data.action || 'NEW_ACTION',
    xp_amount: data.xp_amount || 0,
    description: data.description || null,
  };
}

export async function updateXPRule(id: string, updates: Partial<XPRule>): Promise<void> {
  await delay();
  const idx = mockXPRules.findIndex((r) => r.id === id);
  if (idx >= 0) Object.assign(mockXPRules[idx], updates);
}

export async function deleteXPRule(id: string): Promise<void> {
  await delay();
  const idx = mockXPRules.findIndex((r) => r.id === id);
  if (idx >= 0) mockXPRules.splice(idx, 1);
}

/* ===== Levels ===== */

export async function fetchLevels(): Promise<AdminLevel[]> {
  await delay();
  return [...mockLevels];
}

export async function createLevel(data: Partial<AdminLevel>): Promise<AdminLevel> {
  await delay();
  return {
    id: `lvl-${Date.now()}`,
    level_number: data.level_number || 1,
    name: data.name || 'New Level',
    xp_threshold: data.xp_threshold || 0,
    image_url: data.image_url || null,
  };
}

export async function updateLevel(id: string, updates: Partial<AdminLevel>): Promise<void> {
  await delay();
  const idx = mockLevels.findIndex((l) => l.id === id);
  if (idx >= 0) Object.assign(mockLevels[idx], updates);
}

export async function deleteLevel(id: string): Promise<void> {
  await delay();
  const idx = mockLevels.findIndex((l) => l.id === id);
  if (idx >= 0) mockLevels.splice(idx, 1);
}

/* ===== Badges ===== */

export async function fetchBadges(): Promise<AdminBadge[]> {
  await delay();
  return [...mockBadges];
}

export async function createBadge(data: Partial<AdminBadge>): Promise<AdminBadge> {
  await delay();
  return {
    id: `bdg-${Date.now()}`,
    name: data.name || 'New Badge',
    description: data.description || '',
    image_url: data.image_url || null,
  };
}

export async function updateBadge(id: string, updates: Partial<AdminBadge>): Promise<void> {
  await delay();
  const idx = mockBadges.findIndex((b) => b.id === id);
  if (idx >= 0) Object.assign(mockBadges[idx], updates);
}

export async function deleteBadge(id: string): Promise<void> {
  await delay();
  const idx = mockBadges.findIndex((b) => b.id === id);
  if (idx >= 0) mockBadges.splice(idx, 1);
}

/* ===== Promotions ===== */

export async function fetchPromotions(): Promise<AdminPromotion[]> {
  await delay();
  return [...mockPromotions];
}

export async function createPromotion(data: Partial<AdminPromotion>): Promise<AdminPromotion> {
  await delay();
  return {
    id: `promo-${Date.now()}`,
    title: data.title || 'New Promotion',
    description: data.description || '',
    image_url: data.image_url || '',
    external_url: data.external_url || '',
    date_time: data.date_time || null,
    active: data.active ?? true,
    created_at: new Date().toISOString(),
  };
}

export async function updatePromotion(id: string, updates: Partial<AdminPromotion>): Promise<void> {
  await delay();
  const idx = mockPromotions.findIndex((p) => p.id === id);
  if (idx >= 0) Object.assign(mockPromotions[idx], updates);
}

export async function deletePromotion(id: string): Promise<void> {
  await delay();
  const idx = mockPromotions.findIndex((p) => p.id === id);
  if (idx >= 0) mockPromotions.splice(idx, 1);
}

/* ===== Advertisements ===== */

export async function fetchAdvertisements(): Promise<Advertisement[]> {
  await delay();
  return [...mockAdvertisements];
}

export async function createAdvertisement(data: Partial<Advertisement>): Promise<Advertisement> {
  await delay();
  return {
    id: `ad-${Date.now()}`,
    title: data.title || 'New Ad',
    image_url: data.image_url || '',
    target_url: data.target_url || '',
    ad_slot_id: data.ad_slot_id || null,
    status: data.status || 'ACTIVE',
    starts_at: data.starts_at || null,
    ends_at: data.ends_at || null,
    clicks: 0,
    impressions: 0,
    created_at: new Date().toISOString(),
  };
}

export async function updateAdvertisement(id: string, updates: Partial<Advertisement>): Promise<void> {
  await delay();
  const idx = mockAdvertisements.findIndex((a) => a.id === id);
  if (idx >= 0) Object.assign(mockAdvertisements[idx], updates);
}

export async function deleteAdvertisement(id: string): Promise<void> {
  await delay();
  const idx = mockAdvertisements.findIndex((a) => a.id === id);
  if (idx >= 0) mockAdvertisements.splice(idx, 1);
}

/* ===== Ad Slots ===== */

export async function fetchAdSlots(): Promise<AdSlot[]> {
  await delay();
  return [...mockAdSlots];
}

export async function createAdSlot(data: Partial<AdSlot>): Promise<AdSlot> {
  await delay();
  return {
    id: `slot-${Date.now()}`,
    name: data.name || 'New Slot',
    slug: data.slug || 'new-slot',
    description: data.description || null,
    placement: data.placement || 'sidebar',
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
  };
}

export async function updateAdSlot(id: string, updates: Partial<AdSlot>): Promise<void> {
  await delay();
  const idx = mockAdSlots.findIndex((s) => s.id === id);
  if (idx >= 0) Object.assign(mockAdSlots[idx], updates);
}

export async function deleteAdSlot(id: string): Promise<void> {
  await delay();
  const idx = mockAdSlots.findIndex((s) => s.id === id);
  if (idx >= 0) mockAdSlots.splice(idx, 1);
}

/* ===== Media ===== */

export async function fetchMedia(): Promise<MediaItem[]> {
  await delay();
  return [...mockMedia];
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  await delay(500);
  return {
    id: `med-${Date.now()}`,
    filename: file.name,
    file_path: `/uploads/${file.name}`,
    file_type: file.type || 'unknown',
    file_size: file.size,
    uploaded_by: null,
    created_at: new Date().toISOString(),
  };
}

export async function deleteMedia(id: string): Promise<void> {
  await delay();
  const idx = mockMedia.findIndex((m) => m.id === id);
  if (idx >= 0) mockMedia.splice(idx, 1);
}

/* ===== Analytics ===== */

export async function fetchAnalytics(): Promise<AnalyticsData> {
  await delay();
  return { ...mockAnalytics };
}

/* ===== Feedback ===== */

export async function fetchFeedback(page = 1, pageSize = 10): Promise<{ items: FeedbackItem[]; total: number }> {
  await delay();
  const start = (page - 1) * pageSize;
  return {
    items: mockFeedback.slice(start, start + pageSize),
    total: mockFeedback.length,
  };
}

export async function updateFeedbackStatus(id: string, status: string): Promise<void> {
  await delay();
  const idx = mockFeedback.findIndex((f) => f.id === id);
  if (idx >= 0) mockFeedback[idx].status = status;
}

/* ===== Business Enquiries ===== */

export async function fetchBusinessEnquiries(page = 1, pageSize = 10): Promise<{ items: BusinessEnquiry[]; total: number }> {
  await delay();
  const start = (page - 1) * pageSize;
  return {
    items: mockBusinessEnquiries.slice(start, start + pageSize),
    total: mockBusinessEnquiries.length,
  };
}

export async function updateEnquiryStatus(id: string, status: string): Promise<void> {
  await delay();
  const idx = mockBusinessEnquiries.findIndex((e) => e.id === id);
  if (idx >= 0) mockBusinessEnquiries[idx].status = status;
}

/* ===== Audit Logs ===== */

export async function fetchAuditLogs(page = 1, pageSize = 10): Promise<{ items: AuditLog[]; total: number }> {
  await delay();
  const start = (page - 1) * pageSize;
  return {
    items: mockAuditLogs.slice(start, start + pageSize),
    total: mockAuditLogs.length,
  };
}
