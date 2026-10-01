import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Calendar as CalendarIcon, Plus, Filter, CheckCircle2, Clock, Layers, Send } from 'lucide-react';

export const CalendarModule = () => {
  const { calendarEvents, addCalendarEvent, setActiveModule } = useWorkspace();
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-07-30');
  const [platform, setPlatform] = useState('LinkedIn');
  const [pillar, setPillar] = useState('Enterprise AI');

  const filteredEvents = calendarEvents.filter(e => 
    filterPlatform === 'ALL' || e.platform.toUpperCase() === filterPlatform.toUpperCase()
  );

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!title) return;
    addCalendarEvent({ title, date, platform, pillar, status: 'SCHEDULED', owner: 'Content Strategist' });
    setShowAddModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-extrabold text-white">Content Calendar Operations</h1>
          </div>
          <p className="text-xs text-slate-400">
            Unified multi-channel publishing schedule & campaign execution calendar.
          </p>
        </div>

        <div className="flex gap-2">
          <select 
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="glass-input text-xs py-2"
          >
            <option value="ALL">All Channels</option>
            <option value="BLOG">Blog & SEO</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="INSTAGRAM">Instagram / Reels</option>
          </select>

          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            Schedule Calendar Entry
          </button>
        </div>
      </div>

      {/* Calendar Grid Representation */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">July 2026 Scheduled Operations</span>
          <span className="text-xs text-brand-400 font-semibold">{filteredEvents.length} Active Events</span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-800/60">
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>

        {/* Calendar Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-brand-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {evt.date}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  evt.status === 'SCHEDULED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  evt.status === 'APPROVED' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {evt.status}
                </span>
              </div>

              <h3 className="font-bold text-white text-xs leading-snug">{evt.title}</h3>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                <span>{evt.platform} • {evt.pillar}</span>
                <button 
                  onClick={() => setActiveModule('studio')}
                  className="text-brand-400 hover:underline font-semibold"
                >
                  Open Studio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm">Schedule Calendar Entry</h3>
            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Topic / Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. SEO Article Launch: Brand DNA"
                  className="w-full glass-input text-xs" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Publishing Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full glass-input text-xs" 
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Channel Platform</label>
                <select 
                  value={platform} 
                  onChange={(e) => setPlatform(e.target.value)} 
                  className="w-full glass-input text-xs"
                >
                  <option value="Blog">Blog / Editorial</option>
                  <option value="LinkedIn">LinkedIn Post / Article</option>
                  <option value="Instagram">Instagram / Reel Script</option>
                  <option value="Email">Email Newsletter</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-full btn-secondary text-xs">Cancel</button>
                <button type="submit" className="w-full btn-primary text-xs">Schedule Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
