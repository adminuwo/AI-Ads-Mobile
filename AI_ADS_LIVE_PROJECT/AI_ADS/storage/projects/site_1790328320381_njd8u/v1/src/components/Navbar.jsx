import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ siteData, activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const brandName = siteData?.websiteIdentity?.title || 'Brand';
  const navLinks = siteData?.navigationSpec?.headerLinks || [];
  const primaryCTA = siteData?.ctaRequirements?.primaryCTA || 'Get Started';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setActivePage(navLinks[0]?.pageName || 'Home')}>
          <span className="brand-title">{brandName}</span>
        </div>

        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <button
              key={link.pageName}
              className={`nav-link ${activePage === link.pageName ? 'active' : ''}`}
              onClick={() => setActivePage(link.pageName)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              const contactLink = navLinks.find(l => l.pageName.toLowerCase().includes('contact') || l.pageName.toLowerCase().includes('book'));
              if (contactLink) setActivePage(contactLink.pageName);
              else alert(`Action: ${primaryCTA}`);
            }}
          >
            {primaryCTA}
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <button
              key={link.pageName}
              className={`mobile-nav-link ${activePage === link.pageName ? 'active' : ''}`}
              onClick={() => {
                setActivePage(link.pageName);
                setMobileMenuOpen(false);
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
