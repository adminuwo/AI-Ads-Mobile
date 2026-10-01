import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingPlansGrid({ section }) {
  const plans = section.plans || [];
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [signedUp, setSignedUp] = useState(false);

  return (
    <section className="section-block pricing-section">
      <div className="section-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
        <h2 className="section-title">{section.title}</h2>
        {section.purpose && <p className="section-purpose">{section.purpose}</p>}

        {/* Monthly vs Annual Toggle with 20% Discount */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', border: '1px solid var(--card-border)' }}>
          <button
            onClick={() => setIsAnnual(false)}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none', background: !isAnnual ? 'var(--primary-color)' : 'transparent', color: !isAnnual ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none', background: isAnnual ? 'var(--primary-color)' : 'transparent', color: isAnnual ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <span>Annual</span>
            <span style={{ fontSize: '0.65rem', background: '#10B981', color: '#fff', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>SAVE 20%</span>
          </button>
        </div>
      </div>

      <div className="grid-cards">
        {plans.map((plan, idx) => {
          const rawNum = parseFloat((plan.price || '').replace(/[^0-9.]/g, ''));
          const displayPrice = isNaN(rawNum)
            ? plan.price
            : isAnnual
            ? `$${(rawNum * 0.8 * 12).toFixed(0)} / yr`
            : plan.price;

          const isFeatured = idx === 1 || plan.badge === 'Popular';

          return (
            <div key={idx} className="card pricing-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', border: isFeatured ? '2px solid var(--primary-color)' : '1px solid var(--card-border)' }}>
              {isFeatured && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.6rem', borderRadius: '999px' }}>
                  MOST POPULAR
                </div>
              )}

              <div>
                <h3 className="card-title" style={{ fontSize: '1.2rem', marginTop: isFeatured ? '0.5rem' : 0 }}>{plan.name}</h3>
                <div className="card-price" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.75rem 0' }}>{displayPrice}</div>
                <p className="card-desc" style={{ fontSize: '0.85rem' }}>{plan.description}</p>

                {Array.isArray(plan.features) && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Check size={14} color="var(--primary-color)" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button onClick={() => setSelectedPlan(plan)} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <span>Get Started with {plan.name}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Plan Signup Modal */}
      {selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--card-bg, #0F172A)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md, 16px)', padding: '1.5rem', color: 'var(--text-color)' }}>
            {signedUp ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '999px', background: 'rgba(16,185,129,0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Check size={28} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Welcome to {selectedPlan.name}!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Your subscription workspace has been initialized.</p>
                <button onClick={() => { setSignedUp(false); setSelectedPlan(null); }} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Access Dashboard</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSignedUp(true); }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>Activate {selectedPlan.name} Plan</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Start your 14-day risk-free trial.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input placeholder="Work Email" type="email" required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff' }} />
                  <input placeholder="Company / Workspace Name" required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setSelectedPlan(null)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Start Free Trial</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
