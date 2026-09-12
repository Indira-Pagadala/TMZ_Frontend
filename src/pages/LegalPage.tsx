import { useEffect } from 'react';

export function LegalPage() {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display text-3xl md:text-4xl text-primary mb-2">Terms &amp; Legal</h1>
      <p className="text-sm text-muted mb-8">Last updated: September 11, 2026</p>

      <div className="article-surface p-6 md:p-10 space-y-6 reading-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using The Modern Stories, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the service. These terms apply to all visitors, registered users, and contributors.</p>
        </section>
        <section>
          <h2>2. Intellectual Property</h2>
          <p>All content published on The Modern Stories, including articles, quizzes, opinions, podcasts, graphics, and logos, is the property of The Modern Stories or its contributors. You may not reproduce, distribute, or create derivative works without explicit written permission.</p>
        </section>
        <section>
          <h2>3. User Conduct</h2>
          <p>You agree not to use the service for any unlawful purpose, to post abusive or defamatory comments, to attempt to gain unauthorized access to our systems, or to interfere with other users' experience. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>
        <section>
          <h2>4. User-Generated Content</h2>
          <p>By submitting comments, quiz answers, or opinion responses, you grant The Modern Stories a non-exclusive license to display and use that content on the platform. You retain ownership of your submissions. You are responsible for ensuring your content does not violate any third-party rights.</p>
        </section>
        <section>
          <h2>5. Gamification and Rewards</h2>
          <p>XP, levels, badges, and completion cards have no monetary value and cannot be exchanged for real-world currency. We reserve the right to adjust, reset, or modify the gamification system at any time without prior notice.</p>
        </section>
        <section>
          <h2>6. Advertisements and Promotions</h2>
          <p>The Modern Stories may display advertisements and promotional content. We are not responsible for the content of third-party advertisements or the products and services they promote. Interactions with advertisements are governed by the respective advertiser's terms.</p>
        </section>
        <section>
          <h2>7. Disclaimer of Warranties</h2>
          <p>The service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or secure. Article content is for informational purposes and should not be considered professional advice.</p>
        </section>
        <section>
          <h2>8. Limitation of Liability</h2>
          <p>The Modern Stories shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to loss of data, reading progress, or gamification achievements.</p>
        </section>
        <section>
          <h2>9. Account Termination</h2>
          <p>You may deactivate your account at any time from Settings. We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination, your right to use the service ceases immediately.</p>
        </section>
        <section>
          <h2>10. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through the appropriate legal channels.</p>
        </section>
        <section>
          <h2>11. Contact</h2>
          <p>For legal inquiries, please contact us through the Contact section on our About page.</p>
        </section>
      </div>
    </div>
  );
}
