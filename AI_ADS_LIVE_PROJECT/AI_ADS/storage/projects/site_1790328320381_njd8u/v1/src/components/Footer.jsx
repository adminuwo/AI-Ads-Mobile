import React from 'react';

export default function Footer({ siteData, setActivePage }) {
  const brandName = siteData?.websiteIdentity?.title || 'Brand';
  const businessType = siteData?.websiteIdentity?.businessType || '';
  const footerLinks = siteData?.navigationSpec?.footerLinks || [];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand-col">
          <h3 className="footer-brand">{brandName}</h3>
          <p className="footer-sub">{businessType}</p>
          <p className="footer-copy">© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-nav">
            {footerLinks.map((link) => (
              <li key={link.pageName}>
                <button onClick={() => setActivePage(link.pageName)} className="footer-link-btn">
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
