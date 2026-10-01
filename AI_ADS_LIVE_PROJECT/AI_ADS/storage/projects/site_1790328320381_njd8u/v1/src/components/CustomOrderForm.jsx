import React, { useState } from 'react';
import { submitCustomOrder } from '../services/apiService';

export default function CustomOrderForm({ section }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitCustomOrder({});
    setSubmitted(true);
  };

  return (
    <section className="section-block custom-order-section">
      <div className="section-header">
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {submitted ? (
          <div>Enquiry Submitted! We will be in touch shortly.</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input placeholder="Name" required style={{ padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)' }} />
            <textarea placeholder="Custom Requirements..." rows={4} required style={{ padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)' }} />
            <button className="btn btn-primary" type="submit">{section.submitLabel || 'Submit Custom Brief'}</button>
          </form>
        )}
      </div>
    </section>
  );
}
