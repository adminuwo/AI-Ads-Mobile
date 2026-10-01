import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function GuideAccordion({ section }) {
  const items = section.items || [
    { question: 'What is the batch size and student-teacher ratio?', answer: 'We maintain small focused batches of 15-20 students to ensure individual doubt-clearing and personalized mentoring.' },
    { question: 'Do you offer free trial demo sessions?', answer: 'Yes! Students can attend 2 complimentary demo lectures before completing formal enrollment.' },
    { question: 'Are regular assessment tests and parent updates provided?', answer: 'Weekly unit tests and monthly comprehensive mocks are conducted with performance analytics shared directly with parents.' }
  ];

  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section className="section-block guide-section">
      <div className="section-header" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2rem' }}>
        <h2 className="section-title">{section.title || 'Frequently Asked Questions'}</h2>
        {section.purpose && <p className="section-purpose">{section.purpose}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '750px', margin: '0 auto' }}>
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="card faq-card"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: isOpen ? '1px solid var(--primary-color)' : '1px solid var(--card-border)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => toggle(idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>{item.question}</h3>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: isOpen ? 'var(--primary-color)' : 'var(--text-muted)'
                  }}
                />
              </div>
              {isOpen && (
                <p className="card-desc" style={{ marginTop: '0.75rem', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
