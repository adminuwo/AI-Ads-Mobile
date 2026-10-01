import React from 'react';

export default function HowItWorksGrid({ section }) {
  const steps = section.steps || [];

  return (
    <section className="section-block process-section">
      <div className="section-header">
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid-cards">
        {steps.map((st, idx) => (
          <div key={idx} className="card step-card">
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>{st.step || idx + 1}</span>
            <h3 className="card-title" style={{ marginTop: '0.5rem' }}>{st.title}</h3>
            <p className="card-desc">{st.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
