import React, { useState } from 'react';
import { TrendingUp, Activity, Users, ShieldCheck } from 'lucide-react';

export default function StatsCounter({ section }) {
  const [timeRange, setTimeRange] = useState('30D');

  const stats = section.stats || [
    { value: '99.9%', label: 'Uptime & Reliability', change: '+0.4%' },
    { value: '14.2k+', label: 'Active Users', change: '+18.2%' },
    { value: '< 250ms', label: 'Global Latency', change: '-12ms' },
    { value: '4.9/5', label: 'Satisfaction Score', change: '+0.2' }
  ];

  return (
    <section className="section-block stats-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '1.25rem', margin: 0 }}>{section.title || 'Live Performance Metrics'}</h2>
          {section.purpose && <p className="section-purpose" style={{ margin: 0 }}>{section.purpose}</p>}
        </div>
        <div style={{ display: 'inline-flex', padding: '0.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', border: '1px solid var(--card-border)' }}>
          {['7D', '30D', '90D'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                border: 'none',
                background: timeRange === range ? 'var(--primary-color)' : 'transparent',
                color: timeRange === range ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-cards">
        {stats.map((st, idx) => (
          <div key={idx} className="card text-center" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>{st.value}</div>
            <div className="card-desc" style={{ marginTop: '0.25rem', fontWeight: 600 }}>{st.label}</div>
            {st.change && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                <TrendingUp size={12} />
                <span>{st.change} vs prev {timeRange}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
