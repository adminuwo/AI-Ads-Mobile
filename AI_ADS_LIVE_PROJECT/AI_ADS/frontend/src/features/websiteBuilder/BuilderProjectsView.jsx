import React, { useState } from 'react';
import { API_BASE } from '../../config/api';
import {
  FolderKanban,
  Search,
  Plus,
  Clock,
  Globe,
  Trash2,
  ExternalLink,
  Loader2,
  Layers,
  ArrowRight,
  Download,
  X,
  AlertTriangle,
  Star
} from 'lucide-react';

export const BuilderProjectsView = ({
  projects = [],
  loadingProjects,
  onOpenProject,
  onNewProject,
  onDeleteProject,
  projectFilter = 'all',
  setProjectFilter,
  starredProjectIds = [],
  onToggleStar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const starredCount = projects.filter((p) => starredProjectIds.includes(p.projectId || p._id)).length;

  const filteredProjects = projects.filter((p) => {
    const pid = p.projectId || p._id;
    // 1. Tab / Category Filter
    if (projectFilter === 'starred' && !starredProjectIds.includes(pid)) {
      return false;
    }

    // 2. Search query filter
    const title = (p.title || '').toLowerCase();
    const type = (p.businessType || '').toLowerCase();
    const industry = (p.industry || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || type.includes(q) || industry.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 space-y-8 animate-in fade-in">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Workspace Repository</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {projectFilter === 'starred'
              ? 'Starred Projects'
              : projectFilter === 'owned'
              ? 'Owned by me'
              : projectFilter === 'shared'
              ? 'Shared with me'
              : 'My Generated Projects'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Access, edit, star, and export all web applications in your workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-medium shadow-sm"
            />
          </div>

          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white font-extrabold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      {setProjectFilter && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={() => setProjectFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              projectFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All projects</span>
            <span className="text-[10px] opacity-75 font-mono">({projects.length})</span>
          </button>

          <button
            onClick={() => setProjectFilter('starred')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              projectFilter === 'starred'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${projectFilter === 'starred' ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>Starred</span>
            {starredCount > 0 && (
              <span className="text-[10px] text-amber-500 font-mono">({starredCount})</span>
            )}
          </button>

          <button
            onClick={() => setProjectFilter('owned')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              projectFilter === 'owned'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Owned by me
          </button>

          <button
            onClick={() => setProjectFilter('shared')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              projectFilter === 'shared'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Shared with me
          </button>
        </div>
      )}

      {/* ── PROJECTS CONTENT ── */}
      {loadingProjects ? (
        <div className="py-20 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-600 dark:text-brand-400" />
          <span>Loading project repository...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            {projectFilter === 'starred' ? <Star className="w-7 h-7 text-amber-400" /> : <FolderKanban className="w-7 h-7" />}
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {projectFilter === 'starred' ? 'No starred projects yet' : 'No projects found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {searchQuery
              ? `No projects matching "${searchQuery}". Try another keyword.`
              : projectFilter === 'starred'
              ? 'Click the star icon on any project card to pin your favorite applications here.'
              : 'You have not created any web applications in this workspace yet.'}
          </p>
          <button
            onClick={onNewProject}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Build Your First Application</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const pid = proj.projectId || proj._id;
            const isStarred = starredProjectIds.includes(pid);

            return (
              <div
                key={pid}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-brand-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30">
                      {proj.businessType || 'Web App'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Star Button */}
                      {onToggleStar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(pid);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isStarred
                              ? 'text-amber-400 hover:text-amber-500 bg-amber-400/10'
                              : 'text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={isStarred ? 'Unstar Project' : 'Star Project'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
                        </button>
                      )}

                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        {proj.status || 'Saved'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      {proj.title || 'Untitled Project'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {proj.industry ? `${proj.industry} • ` : ''}
                      Version {proj.activeVersion || 'v1'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Active'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const downloadUrl = `${API_BASE}/website-builder/projects/${proj.projectId}/export-zip`;
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.setAttribute('download', `${(proj.title || 'website').toLowerCase().replace(/[^a-z0-9]/g, '-')}-source-code.zip`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/20 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      title="Download Project ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {onDeleteProject && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(proj);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onOpenProject(proj)}
                      className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CUSTOM DESIGNED DELETE CONFIRMATION MODAL ── */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header & Icon */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Delete Project?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white font-bold">"{projectToDelete.title}"</strong>? This will permanently remove all generated React files, pages, and version history.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDeleteProject(projectToDelete.projectId || projectToDelete._id);
                    setProjectToDelete(null);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
