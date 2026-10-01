import React, { useState } from 'react';
import { Trophy, CheckSquare, Square, Zap, Award } from 'lucide-react';

export default function ExperimentQuestTracker({ section }) {
  const [quests, setQuests] = useState(section.quests || [
    { id: 1, title: 'Build a Baking Soda Volcano', category: 'Chemistry', xp: 50, completed: true },
    { id: 2, title: 'Launch a Bottle Rocket', category: 'Physics', xp: 75, completed: false },
    { id: 3, title: 'Sprout a Bean in a Jar', category: 'Biology', xp: 40, completed: true },
    { id: 4, title: 'Map Constellations with a Flashlight', category: 'Space', xp: 60, completed: false },
  ]);

  const toggleQuest = (id) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: !q.completed } : q));
  };

  const completedCount = quests.filter(q => q.completed).length;
  const totalXp = quests.filter(q => q.completed).reduce((sum, q) => sum + (q.xp || 50), 0);
  const progressPct = Math.round((completedCount / quests.length) * 100);

  return (
    <section className="section-block quest-tracker-section p-6 rounded-3xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
            <Trophy className="w-6 h-6 text-yellow-400" /> {section.title || 'Science Quest & Progress Tracker'}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{section.purpose || 'Track your interactive science experiments and level up your XP!'}</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-2xl border border-slate-800 self-stretch md:self-auto justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">TOTAL XP</span>
              <span className="text-sm font-extrabold text-white">{totalXp} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">LEVEL</span>
              <span className="text-sm font-extrabold text-emerald-400">Junior Scientist</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs font-extrabold mb-1" style={{ color: 'var(--text-color)' }}>
          <span>Experiment Progress</span>
          <span>{completedCount} of {quests.length} Completed ({progressPct}%)</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {quests.map(quest => (
          <div
            key={quest.id}
            onClick={() => toggleQuest(quest.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${quest.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              {quest.completed ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
              <div>
                <h4 className={`text-xs font-extrabold ${quest.completed ? 'line-through text-slate-400' : 'text-white'}`}>{quest.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{quest.category}</span>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
              +{quest.xp} XP
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
