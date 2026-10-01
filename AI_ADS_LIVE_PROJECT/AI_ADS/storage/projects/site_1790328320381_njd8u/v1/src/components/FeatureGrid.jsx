import React from 'react';

export default function FeatureGrid({ section }) {
  const features = section.features || [];

  return (
    <section className="section-block feature-grid-section">
      <div className="section-header">
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid-cards">
        {features.map((feat, idx) => (
          <div key={idx} className="card feature-card">
            <h3 className="card-title">{feat.title}</h3>
            <p className="card-desc">{feat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
