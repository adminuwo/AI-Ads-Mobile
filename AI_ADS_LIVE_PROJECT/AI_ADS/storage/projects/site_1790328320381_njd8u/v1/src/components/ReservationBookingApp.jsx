import React, { useState } from 'react';
import { Calendar, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function ReservationBookingApp({ section }) {
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState('2026-08-15');
  const [time, setTime] = useState('19:00');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <section className="section-block booking-app-section p-6 rounded-3xl max-w-xl mx-auto" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <h2 className="text-xl font-extrabold text-center mb-2 flex items-center justify-center gap-2" style={{ color: 'var(--text-color)' }}>
        <Calendar className="w-5 h-5 text-brand-400" /> {section.title || 'Table Reservation'}
      </h2>
      <p className="text-xs text-center text-slate-400 mb-6">{section.purpose || 'Reserve your table in advance'}</p>

      {!confirmed ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Party Size (Guests)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 4, 6, 8].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPartySize(size)}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${partySize === size ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-900 text-slate-300 border-slate-800'}`}
                >
                  {size} {size === 1 ? 'Guest' : 'Guests'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs bg-slate-900 text-white border-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs bg-slate-900 text-white border-slate-800 focus:outline-none"
              >
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="21:00">9:00 PM</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg">
            Confirm Reservation Request
          </button>
        </form>
      ) : (
        <div className="text-center py-6 space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-extrabold text-white">Reservation Confirmed!</h3>
          <p className="text-xs text-slate-300">Table for <strong>{partySize} guests</strong> on <strong>{date}</strong> at <strong>{time}</strong>.</p>
          <button onClick={() => setConfirmed(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs">
            Make Another Reservation
          </button>
        </div>
      )}
    </section>
  );
}
