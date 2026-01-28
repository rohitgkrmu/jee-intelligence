import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for JEE Intelligence by ZenithSchool.ai",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-[var(--text-secondary)] mb-6">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              ZenithSchool.ai (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the JEE Intelligence
              platform. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Academic information (class, target year, school)</li>
              <li>Diagnostic test responses and scores</li>
              <li>Usage data and preferences</li>
            </ul>
            <p className="text-[var(--text-secondary)] mb-4">
              We automatically collect:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>Provide and improve our diagnostic services</li>
              <li>Generate personalized study recommendations</li>
              <li>Send relevant educational content and updates</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Communicate about our services and offerings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              We do not sell your personal information. We may share your information:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>With your consent</li>
              <li>With service providers who assist our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-[var(--text-secondary)]">
              We implement appropriate security measures to protect your information.
              However, no method of transmission over the Internet is 100% secure.
              We strive to use commercially acceptable means to protect your personal
              information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-[var(--text-secondary)]">
              We use cookies and similar technologies to improve your experience.
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-[var(--text-secondary)]">
              Our services are intended for students preparing for JEE exams.
              If you are under 18, please ensure you have parental consent before
              using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-[var(--text-secondary)]">
              We may update this Privacy Policy from time to time. We will notify
              you of any changes by posting the new policy on this page and updating
              the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-[var(--text-secondary)]">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              <a
                href="mailto:privacy@zenithschool.ai"
                className="text-[var(--zenith-cyan)] hover:underline"
              >
                privacy@zenithschool.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
