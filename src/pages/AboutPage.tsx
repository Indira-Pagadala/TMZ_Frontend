import { useEffect, useState } from 'react';
import { Mail, Phone, Building2, MessageSquare, Send } from 'lucide-react';
import type { TeamMember } from '@/types';
import { fetchTeamMembers, submitBusinessEnquiry, submitFeedback } from '@/lib/api';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';
import { LoadingState, ErrorState } from '@/components/ui/States';

export function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

  // Business form
  const [bizForm, setBizForm] = useState({ name: '', company: '', purpose: '', phone: '', email: '' });
  const [bizErrors, setBizErrors] = useState<Record<string, string>>({});
  const [bizSubmitting, setBizSubmitting] = useState(false);

  // Feedback form
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamMembers()
      .then(setTeam)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[\d\s+()-]{7,20}$/.test(phone);

  const handleBizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const name = bizForm.name.trim();
    const company = bizForm.company.trim();
    const purpose = bizForm.purpose.trim();
    const phone = bizForm.phone.trim();
    const email = bizForm.email.trim();

    if (!name) errors.name = 'Name is required';
    if (name.length > 100) errors.name = 'Name is too long';
    if (!company) errors.company = 'Company is required';
    if (!purpose) errors.purpose = 'Purpose is required';
    if (purpose.length > 500) errors.purpose = 'Purpose is too long';
    if (!email) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Invalid email format';
    if (!phone) errors.phone = 'Phone is required';
    else if (!validatePhone(phone)) errors.phone = 'Invalid phone format';

    setBizErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBizSubmitting(true);
    try {
      await submitBusinessEnquiry({ name, company, purpose, phone, email });
      showToast('Business enquiry sent successfully', 'success');
      setBizForm({ name: '', company: '', purpose: '', phone: '', email: '' });
    } catch {
      showToast('Could not send enquiry. Please try again.', 'error');
    } finally {
      setBizSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = feedback.trim();
    if (!content) {
      setFeedbackError('Please write your feedback');
      return;
    }
    if (content.length > 2000) {
      setFeedbackError('Feedback is too long (max 2000 characters)');
      return;
    }
    setFeedbackError('');
    setFeedbackSubmitting(true);
    try {
      await submitFeedback({ content });
      showToast('Thank you for your feedback!', 'success');
      setFeedback('');
    } catch {
      showToast('Could not submit feedback. Please try again.', 'error');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-24">
      {/* About The Modern Stories */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl text-primary mb-6">About The Modern Stories</h1>
        <p className="text-lg text-secondary leading-relaxed">
          The Modern Stories is a premium editorial platform designed for curious minds. We blend
          interactive learning, gamified reading experiences, and thoughtful journalism into a single
          immersive destination. Our mission is to make knowledge engaging, accessible, and rewarding.
        </p>
      </section>

      {/* About the Company */}
      <section>
        <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-primary mb-6">Our Company</h2>
          <div className="space-y-4 text-secondary leading-relaxed">
            <p>
              We believe reading should be an experience, not a chore. Our team of editors, engineers,
              and designers have built a platform that transforms articles into interactive journeys —
              with quizzes, opinions, podcasts, and progressive reading unlocks that reward curiosity.
            </p>
            <p>
              Every article on The Modern Stories is crafted to inform, challenge, and inspire. We combine
              editorial rigor with modern technology to create a reading experience that feels alive.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section>
        <h2 className="font-display text-3xl text-primary text-center mb-10">Meet the Team</h2>
        {loading ? (
          <LoadingState message="Loading team..." />
        ) : error ? (
          <ErrorState message="Could not load team members." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.id} className="glass-card overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  {member.image_url && (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-primary">{member.name}</h3>
                  <p className="text-sm text-brand-primary mb-2">{member.role}</p>
                  <p className="text-xs text-muted leading-relaxed line-clamp-3">{member.bio}</p>
                  {member.social_links?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {member.social_links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted hover:text-brand-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20">
        <h2 className="font-display text-3xl text-primary text-center mb-10">Contact Us</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Enquiry */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-brand-primary" />
              <h3 className="font-display text-xl text-primary">Business Enquiry</h3>
            </div>
            <form onSubmit={handleBizSubmit} className="space-y-4">
              <Input
                label="Name"
                value={bizForm.name}
                onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                error={bizErrors.name}
                maxLength={100}
                placeholder="Your full name"
              />
              <Input
                label="Company"
                value={bizForm.company}
                onChange={(e) => setBizForm({ ...bizForm, company: e.target.value })}
                error={bizErrors.company}
                maxLength={100}
                placeholder="Company name"
              />
              <Input
                label="Purpose"
                value={bizForm.purpose}
                onChange={(e) => setBizForm({ ...bizForm, purpose: e.target.value })}
                error={bizErrors.purpose}
                maxLength={500}
                placeholder="What is this about?"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={bizForm.phone}
                  onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                  error={bizErrors.phone}
                  placeholder="+1 234 567 890"
                />
                <Input
                  label="Email"
                  type="email"
                  value={bizForm.email}
                  onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                  error={bizErrors.email}
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" disabled={bizSubmitting} fullWidth>
                {bizSubmitting ? 'Sending...' : 'Submit Enquiry'}
              </Button>
            </form>
          </div>

          {/* Feedback */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
              <h3 className="font-display text-xl text-primary">Feedback</h3>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <Textarea
                label="Your Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                error={feedbackError}
                rows={8}
                maxLength={2000}
                placeholder="Share your thoughts, suggestions, or ideas..."
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">{feedback.length}/2000</span>
                <Button type="submit" disabled={feedbackSubmitting}>
                  {feedbackSubmitting ? 'Sending...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
