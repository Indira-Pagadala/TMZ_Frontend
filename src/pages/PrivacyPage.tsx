import { useEffect } from 'react';

export function PrivacyPage() {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display text-3xl md:text-4xl text-primary mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: September 11, 2026</p>

      <div className="article-surface p-6 md:p-10 space-y-6 reading-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, read articles, submit quizzes or opinions, post comments, or contact us. This includes your display name, email address, and any content you submit. We also automatically collect certain information about your device and usage, including IP address, browser type, pages visited, and reading progress.</p>
        </section>
        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, personalize your reading experience, track your reading progress and gamification achievements, send service-related communications, and analyze trends to improve content. We do not sell your personal information to third parties.</p>
        </section>
        <section>
          <h2>3. Data Storage and Security</h2>
          <p>Your data is stored using Supabase infrastructure with row-level security policies that ensure users can only access their own data. Authentication tokens are managed securely. We use industry-standard encryption for data in transit and at rest.</p>
        </section>
        <section>
          <h2>4. Cookies and Local Storage</h2>
          <p>We use local storage and cookies to maintain your session, remember your theme preference, and store reading progress. You can disable cookies in your browser settings, but some features may not function properly.</p>
        </section>
        <section>
          <h2>5. Third-Party Services</h2>
          <p>We use third-party services including Supabase for authentication and data storage, and Pexels for stock imagery. These services have their own privacy policies governing how they handle your data.</p>
        </section>
        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You can update your display name and avatar in Settings, or contact us to request data deletion. You may also deactivate your account at any time.</p>
        </section>
        <section>
          <h2>7. Children's Privacy</h2>
          <p>Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.</p>
        </section>
        <section>
          <h2>8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
        </section>
        <section>
          <h2>9. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please reach out through the Contact section on our About page.</p>
        </section>
      </div>
    </div>
  );
}
