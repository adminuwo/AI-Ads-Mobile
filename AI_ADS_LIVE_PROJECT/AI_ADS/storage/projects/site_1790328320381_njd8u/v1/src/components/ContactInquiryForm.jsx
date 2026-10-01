import React, { useState } from 'react';
import { submitContactForm } from '../services/apiService';

export default function ContactInquiryForm({ section, hasWhatsApp }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitContactForm({});
    setSubmitted(true);
  };

  return (
    <section className="section-block contact-section">
      <div className="section-header">
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input className="input" placeholder="Your Name" required style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }} />
            <input className="input" type="email" placeholder="Your Email" required style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }} />
            <textarea className="input" placeholder="Message" rows={4} required style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }} />
            <button className="btn btn-primary" type="submit">{section.submitLabel || 'Send Message'}</button>
          </form>
        )}
      </div>
    </section>
  );
}
