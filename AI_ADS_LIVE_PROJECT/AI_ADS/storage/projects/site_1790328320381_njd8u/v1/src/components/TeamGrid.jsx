import React from 'react';
import { Award, GraduationCap, Sparkles } from 'lucide-react';

export default function TeamGrid({ section, setActivePage }) {
  const members = section.members || section.team || section.faculty || [
    { name: 'Dr. Arvind Sharma', role: 'Head of Physics & Olympiads', credentials: 'Ph.D. Physics (Ex-IIT Faculty)', experience: '14+ Yrs Exp', bio: 'Specialist in Mechanics & Electromagnetism with 50+ Top 100 AIR rankers mentored.' },
    { name: 'Prof. Meera Deshmukh', role: 'Senior Mathematics Mentor', credentials: 'M.Sc. Applied Mathematics', experience: '12+ Yrs Exp', bio: 'Known for visual geometry techniques and high-speed calculus shortcut mastery.' },
    { name: 'Dr. Rajesh Nair', role: 'Chief Chemistry Faculty', credentials: 'M.Sc. Organic Chemistry', experience: '10+ Yrs Exp', bio: 'Simplifies complex organic reaction mechanisms with structured memory retention frameworks.' }
  ];

  return (
    <section className="section-block team-section">
      <div className="section-header" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
        <h2 className="section-title">{section.title || 'Meet Our Expert Faculty'}</h2>
        {section.purpose && <p className="section-purpose">{section.purpose}</p>}
      </div>

      <div className="grid-cards">
        {members.map((member, idx) => (
          <div key={idx} className="card faculty-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
            <div>
              <div style={{ width: '64px', height: '64px', borderRadius: '999px', background: 'rgba(30, 64, 175, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <GraduationCap size={32} />
              </div>
              <h3 className="card-title" style={{ fontSize: '1.15rem', margin: '0 0 0.25rem' }}>{member.name}</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{member.role}</div>
              {member.credentials && (
                <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', marginBottom: '0.75rem' }}>
                  {member.credentials} • {member.experience}
                </div>
              )}
              <p className="card-desc" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{member.bio || member.description}</p>
            </div>

            {setActivePage && (
              <button
                onClick={() => setActivePage('Admissions') || setActivePage('Book Demo') || setActivePage('Contact')}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', fontSize: '0.8rem' }}
              >
                Schedule Consultation
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
