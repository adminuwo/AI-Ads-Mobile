import React, { useState } from 'react';
import { Sparkles, Eye, X } from 'lucide-react';

export default function PortfolioGallery({ section }) {
  const items = section.items || [];
  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <section className="section-block portfolio-section">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">{section.title}</h2>
        {section.purpose && <p className="section-purpose">{section.purpose}</p>}
      </div>

      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--primary-color)' : 'var(--card-border)',
                backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'transparent',
                color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid-cards">
        {filtered.map((item, idx) => (
          <div key={idx} className="card portfolio-card" onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
            {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="hero-image" style={{ height: '220px', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }} />}
            <h3 className="card-title">{item.title}</h3>
            <p className="card-desc">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Lightbox / Detail Modal */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--card-bg, #0F172A)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md, 16px)', padding: '1.5rem', color: 'var(--text-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{selectedItem.title}</h3>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {selectedItem.imageUrl && <img src={selectedItem.imageUrl} alt={selectedItem.title} style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }} />}
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedItem.description}</p>
            <button onClick={() => setSelectedItem(null)} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
