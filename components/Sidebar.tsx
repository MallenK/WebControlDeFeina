import React, { useState } from 'react';
import { Plus, Trash2, Folder, Layout } from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAddProject(newProjectName);
      setNewProjectName('');
      setIsAdding(false);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Layout className="w-6 h-6 text-blue-500" />
        <h1 className="text-xl font-bold text-white tracking-tight">TaskFlow</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4 text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
          <button 
            onClick={() => setIsAdding(true)}
            className="hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-4">
            <input
              autoFocus
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onBlur={() => !newProjectName && setIsAdding(false)}
              placeholder="Project name..."
              className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded border border-blue-500 focus:outline-none"
            />
          </form>
        )}

        <ul className="space-y-1">
          {projects.map((project) => (
            <li key={project.id} className="group flex items-center justify-between">
              <button
                onClick={() => onSelectProject(project.id)}
                className={`flex-1 text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  activeProjectId === project.id
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Folder className={`w-4 h-4 ${activeProjectId === project.id ? 'fill-current' : ''}`} />
                <span className="truncate">{project.name}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm('Are you sure you want to delete this project?')) {
                    onDeleteProject(project.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </li>
          ))}
          {projects.length === 0 && !isAdding && (
            <li className="text-xs text-slate-600 italic px-3">No projects yet.</li>
          )}
        </ul>
      </div>
    </aside>
  );
};