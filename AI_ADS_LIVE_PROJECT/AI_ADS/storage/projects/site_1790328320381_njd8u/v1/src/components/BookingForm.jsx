import React, { useState } from 'react';
import { Calendar, Clock, Check, User, Sparkles } from 'lucide-react';

export default function BookingForm({ section }) {
  const [selectedService, setSelectedService] = useState('Standard Consultation');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [selectedDate, setSelectedDate] = useState('2026-08-20');
  const [confirmed, setConfirmed] = useState(false);

  const services = section.services || [
    { name: 'Initial Assessment & Strategy', duration: '45 mins', price: '$85' },
    { name: 'Comprehensive Signature Session', duration: '60 mins', price: '$120' },
    { name: 'Express Follow-up Consult', duration: '30 mins', price: '$55' }
  ];

  const slots = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <section className="section-block booking-section">
      <div className="section-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem' }}>
        <h2 className="section-title">{section.title || 'Schedule an Appointment'}</h2>
        {section.purpose && <p className="section-purpose">{section.purpose}</p>}
      </div>

      <div className="card" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem' }}>
        {confirmed ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '999px', background: 'rgba(16,185,129,0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Appointment Confirmed!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Your session for <strong>{selectedService}</strong> has been reserved for <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
            </p>
            <button onClick={() => setConfirmed(false)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Book Another Session
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Select Service */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block', color: 'var(--text-color)' }}>
                1. Select Service
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {services.map((srv, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedService(srv.name)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: selectedService === srv.name ? 'var(--primary-color)' : 'var(--card-border)',
                      backgroundColor: selectedService === srv.name ? 'rgba(255,255,255,0.06)' : 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{srv.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration: {srv.duration}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{srv.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Date & Slot Picker */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block', color: 'var(--text-color)' }}>
                2. Choose Date &amp; Time Slot
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff', marginBottom: '0.75rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: selectedSlot === slot ? 'var(--primary-color)' : 'var(--card-border)',
                      backgroundColor: selectedSlot === slot ? 'var(--primary-color)' : 'transparent',
                      color: selectedSlot === slot ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Contact Info */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block', color: 'var(--text-color)' }}>
                3. Your Information
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <input placeholder="Full Name" required style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff' }} />
                <input type="email" placeholder="Email Address" required style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: '#fff' }} />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" style={{ padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800 }}>
              {section.submitLabel || 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
