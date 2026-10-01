import React, { useState } from 'react';
import { UtensilsCrossed, Sparkles, Check, Calendar } from 'lucide-react';

export default function RestaurantMenuCard({ section }) {
  const items = section.items || [];
  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];

  const [activeCategory, setActiveCategory] = useState('All');
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [reserved, setReserved] = useState(false);

  const filteredItems = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <section className="section-block restaurant-menu-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 className="section-title">{section.title}</h2>
          {section.purpose && <p className="section-purpose">{section.purpose}</p>}
        </div>
        <button onClick={() => setIsReserveOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} /> Reserve a Table
        </button>
      </div>

      {/* Category Tabs */}
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
        {filteredItems.map((item, idx) => (
          <div key={idx} className="card menu-item-card" style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
            <div>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="hero-image" style={{ height: '160px', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.05rem', margin: 0 }}>{item.name}</h3>
                <div className="card-price" style={{ color: 'var(--primary-color)', fontWeight: 800 }}>{item.price}</div>
              </div>
              <p className="card-desc" style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>{item.description}</p>
            </div>
            {item.badge && (
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--primary-color)' }}>
                  {item.badge}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reservation Modal */}
      {isReserveOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--card-bg, #0F172A)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md, 16px)', padding: '1.5rem', color: 'var(--text-color)' }}>
            {reserved ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '999px', background: 'rgba(16,185,129,0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Check size={28} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Table Reserved!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>We look forward to hosting you. A confirmation SMS has been dispatched.</p>
                <button onClick={() => { setReserved(false); setIsReserveOpen(false); }} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Close</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setReserved(true); }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Reserve a Table</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input placeholder="Full Name" required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff' }} />
                  <input placeholder="Party Size (e.g. 2 Guests)" required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff' }} />
                  <input type="datetime-local" required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setIsReserveOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
