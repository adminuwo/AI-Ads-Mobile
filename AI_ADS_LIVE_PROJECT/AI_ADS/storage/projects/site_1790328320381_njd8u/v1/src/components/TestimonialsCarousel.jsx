import React from 'react';

export default function TestimonialsCarousel({ section }) {
  const testimonials = section.testimonials || [];

  return (
    <section className="section-block testimonials-section">
      <div className="section-header">
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid-cards">
        {testimonials.map((item, idx) => (
          <div key={idx} className="card testimonial-card">
            <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"{item.quote}"</p>
            <p className="card-title" style={{ fontSize: '1rem' }}>{item.author}</p>
            <p className="card-desc">{item.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
