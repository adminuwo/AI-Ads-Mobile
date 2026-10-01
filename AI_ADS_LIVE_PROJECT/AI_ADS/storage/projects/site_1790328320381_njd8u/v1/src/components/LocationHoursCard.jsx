import React from 'react';

export default function LocationHoursCard({ section }) {
  return (
    <section className="section-block location-section">
      <div className="card">
        <h2 className="section-title">{section.title}</h2>
        <p className="card-desc" style={{ marginTop: '0.5rem' }}><strong>Address:</strong> {section.address || 'Location provided upon booking'}</p>
        <p className="card-desc" style={{ marginTop: '0.25rem' }}><strong>Hours:</strong> {section.operatingHours || 'Mon-Fri 9AM-6PM'}</p>
      </div>
    </section>
  );
}
