import React, { useState } from 'react';
import { Search, Sparkles, X, BookOpen, ExternalLink } from 'lucide-react';

export default function InteractiveExplorer({ section }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = section.topics || section.items || [
    { title: 'Space Exploration & Rockets', category: 'Space', desc: 'Discover how rockets escape Earth gravity and explore distant planets.', difficulty: 'Easy', steps: ['Build a paper rocket', 'Learn about thrust', 'Track satellite orbits'] },
    { title: 'Volcanoes & Chemical Reactions', category: 'Chemistry', desc: 'Create fizzing chemical reactions with baking soda and vinegar.', difficulty: 'Fun', steps: ['Mix acid and base', 'Observe CO2 gas release', 'Color the lava eruption'] },
    { title: 'Magnetism & Invisible Forces', category: 'Physics', desc: 'Test how magnetic fields attract and repel metal objects.', difficulty: 'Medium', steps: ['Find magnetic objects', 'Map field lines', 'Build a simple compass'] },
    { title: 'Plant Photosynthesis & Sunlight', category: 'Biology', desc: 'See how plants turn sunlight and water into energy and oxygen.', difficulty: 'Easy', steps: ['Sprout a bean seed', 'Test light vs dark growth', 'Observe leaf veins'] },
  ];

  const categories = ['All', ...new Set(topics.map(t => t.category || 'General'))];

  const filtered = topics.filter(t => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || (t.desc || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="section-block explorer-section p-6 rounded-3xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="section-title text-2xl font-extrabold flex items-center justify-center gap-2" style={{ color: 'var(--text-color)' }}>
          <Sparkles className="w-6 h-6 text-yellow-400" /> {section.title || 'Interactive Science Explorer'}
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{section.purpose || 'Search and filter science topics to start an experiment!'}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics, experiments, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            style={{ borderColor: 'var(--card-border)' }}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((topic, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedTopic(topic)}
            className="p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'var(--card-border)' }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {topic.category || 'Science'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{topic.difficulty || 'Easy'}</span>
              </div>
              <h3 className="font-extrabold text-base mb-1" style={{ color: 'var(--text-color)' }}>{topic.title}</h3>
              <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{topic.desc}</p>
            </div>
            <button className="mt-4 text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Start Experiment <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full relative space-y-4">
            <button onClick={() => setSelectedTopic(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
              {selectedTopic.category}
            </span>
            <h3 className="text-xl font-extrabold text-white">{selectedTopic.title}</h3>
            <p className="text-xs text-slate-300">{selectedTopic.desc}</p>
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-extrabold text-yellow-400 uppercase flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Experiment Steps:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(selectedTopic.steps || ['Prepare materials', 'Observe results', 'Record findings']).map((step, sIdx) => (
                  <li key={sIdx} className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-extrabold text-[10px] flex items-center justify-center">{sIdx + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => { alert(`Quest started: ${selectedTopic.title}!`); setSelectedTopic(null); }} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
              Complete Experiment Quest +50 XP 🚀
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
