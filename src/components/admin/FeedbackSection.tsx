import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, CheckCircle2, RotateCcw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FeedbackItem } from '@/lib/admin/adminTypes';
import { fetchFeedback, updateFeedbackStatus } from '@/lib/admin/api';
import { useToast } from '@/lib/toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  new: { bg: 'rgba(0, 119, 182, 0.12)', color: 'var(--brand-primary)', label: 'New' },
  resolved: { bg: 'rgba(0, 189, 72, 0.12)', color: 'var(--brand-secondary)', label: 'Resolved' },
  pending: { bg: 'rgba(144, 224, 239, 0.15)', color: 'var(--brand-accent)', label: 'Pending' },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] ?? { bg: 'var(--border-default)', color: 'var(--text-secondary)', label: status };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function FeedbackSection(): JSX.Element {
  const { showToast } = useToast();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetchFeedback(p, PAGE_SIZE);
      setItems(res.items);
      setTotal(res.total);
    } catch {
      showToast('Failed to load feedback', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(page); }, [page, load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await updateFeedbackStatus(id, status);
      setItems((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
      showToast(`Marked as ${status === 'resolved' ? 'resolved' : 'new'}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
        <h2 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--text-primary)' }}>Feedback</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
          <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Loading feedback...</p>
        </div>
      ) : items.length === 0 ? (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>No feedback found.</p>
        </GlassCard>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => {
              const style = getStatusStyle(item.status);
              return (
                <GlassCard key={item.id} hover={false} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="text-sm font-body leading-relaxed flex-1" style={{ color: 'var(--text-primary)' }}>
                      {item.content}
                    </p>
                    <span
                      className="text-xs font-body px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                      <span>{item.user_email ?? 'Anonymous'}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      {item.status !== 'resolved' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={updating === item.id}
                          onClick={() => handleStatusChange(item.id, 'resolved')}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Resolved
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={updating === item.id}
                          onClick={() => handleStatusChange(item.id, 'new')}
                        >
                          <RotateCcw className="w-4 h-4" />
                          Mark New
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
