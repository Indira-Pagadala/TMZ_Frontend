import { useEffect, useState } from 'react';
import type { TeamMember } from '@/types';
import { fetchTeamMembers } from '@/lib/api';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ContactSection } from '@/components/common/ContactSection';

export function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchTeamMembers()
      .then(setTeam)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

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
      <ContactSection />
    </div>
  );
}
