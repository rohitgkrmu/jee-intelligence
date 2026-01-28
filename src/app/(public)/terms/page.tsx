import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for JEE Intelligence by ZenithSchool.ai",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-[var(--text-secondary)] mb-6">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-[var(--text-secondary)]">
              By accessing and using the JEE Intelligence platform operated by
              ZenithSchool.ai, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Description of Services</h2>
            <p className="text-[var(--text-secondary)]">
              JEE Intelligence provides educational tools including:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 mt-4">
              <li>JEE exam trend analysis and insights</li>
              <li>Diagnostic testing and assessment</li>
              <li>Personalized study recommendations</li>
              <li>Educational content and resources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              When using our services, you agree to:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Not share your access with others</li>
              <li>Notify us of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="text-[var(--text-secondary)]">
              All content on this platform, including questions, analysis, and
              recommendations, is the property of ZenithSchool.ai. You may not
              reproduce, distribute, or create derivative works without our
              written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>Use the platform for any illegal purpose</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Interfere with the platform&apos;s operation</li>
              <li>Share or resell our content without permission</li>
              <li>Submit false or misleading information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
            <p className="text-[var(--text-secondary)]">
              Our services are provided &quot;as is&quot; without warranties of any kind.
              We do not guarantee specific exam results or outcomes. The diagnostic
              and recommendations are for guidance only and should be used alongside
              comprehensive preparation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-[var(--text-secondary)]">
              ZenithSchool.ai shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of our
              services. Our total liability shall not exceed the amount paid by
              you, if any, for using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Data and Content</h2>
            <p className="text-[var(--text-secondary)]">
              Our JEE analysis is based on historical exam data and AI-powered
              insights. While we strive for accuracy, we cannot guarantee the
              completeness or accuracy of all information. Exam patterns may
              change, and our predictions should not be relied upon exclusively.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Modifications</h2>
            <p className="text-[var(--text-secondary)]">
              We reserve the right to modify these terms at any time. Changes will
              be effective upon posting. Your continued use of the platform
              constitutes acceptance of modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
            <p className="text-[var(--text-secondary)]">
              We may terminate or suspend your access to our services at any time,
              with or without cause, with or without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-[var(--text-secondary)]">
              These terms shall be governed by and construed in accordance with
              the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts in Delhi, India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Contact</h2>
            <p className="text-[var(--text-secondary)]">
              For questions about these Terms of Service, please contact us at:
              <br />
              <a
                href="mailto:legal@zenithschool.ai"
                className="text-[var(--zenith-cyan)] hover:underline"
              >
                legal@zenithschool.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
