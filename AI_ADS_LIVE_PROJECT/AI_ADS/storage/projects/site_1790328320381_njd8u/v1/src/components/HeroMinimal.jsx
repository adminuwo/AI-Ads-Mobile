import React from 'react';

export default function HeroMinimal({ section }) {
  return (
    <section className="section-block hero-minimal-section">
      <h1 className="hero-headline">{section.headline || section.title}</h1>
      <p className="hero-subheadline">{section.subheadline || section.purpose}</p>
    </section>
  );
}
