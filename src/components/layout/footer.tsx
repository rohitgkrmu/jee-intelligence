import Link from "next/link";

const footerLinks = {
  product: [
    { href: "/jee-intelligence", label: "JEE Pulse" },
    { href: "/diagnostic", label: "Take Diagnostic" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  social: [
    { href: "https://www.instagram.com/zenith.school.ai", label: "Instagram" },
    { href: "https://www.youtube.com/@ZenithSchoolAI", label: "YouTube" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-dark)] bg-[var(--background-darker)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--zenith-primary)] to-[var(--zenith-cyan)]">
                <span className="text-lg font-bold text-white">JP</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                JEE<span className="text-[var(--zenith-cyan)]">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4 max-w-xs">
              AI-powered JEE preparation with personalized learning paths and real-time analytics.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--zenith-cyan)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--zenith-cyan)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">Connect</h4>
            <ul className="space-y-2">
              {footerLinks.social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--zenith-cyan)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border-dark)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} ZenithSchool.ai. All rights reserved.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Made with love for JEE aspirants across India
          </p>
        </div>
      </div>
    </footer>
  );
}
