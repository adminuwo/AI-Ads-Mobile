import React from 'react';

export default function ContentSectionCard({ section }) {
  return (
    <section className="section-block content-card-section">
      <div className="card">
        <h2 className="section-title">{section.title}</h2>
        <p className="card-desc" style={{ fontSize: '1.05rem', marginTop: '0.5rem' }}>{section.purpose}</p>
      </div>
    </section>
  );
}
