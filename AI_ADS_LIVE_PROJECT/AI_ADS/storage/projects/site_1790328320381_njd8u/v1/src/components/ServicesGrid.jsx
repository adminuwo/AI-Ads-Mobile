import React from 'react';

export default function ServicesGrid({ section }) {
  const services = section.services || [];

  return (
    <section className="section-block services-section">
      <div className="section-header">
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid-cards">
        {services.map((srv, idx) => (
          <div key={idx} className="card service-card">
            {srv.imageUrl && <img src={srv.imageUrl} alt={srv.title} className="hero-image" style={{ height: '160px', marginBottom: '1rem' }} />}
            <h3 className="card-title">{srv.title}</h3>
            <p className="card-desc">{srv.description}</p>
            <div className="card-price">{srv.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
