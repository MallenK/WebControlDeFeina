import React, { useEffect, useState } from 'react';
import { Project, Task, TaskStatus } from './types';
import { 
  getProjects, 
  createProject, 
  deleteProject, 
  getTasks, 
  createTask, 
  updateTaskStatus, 
  deleteTask,
  isConfigured 
} from './services/supabase';
import { Sidebar } from './components/Sidebar';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { LayoutList, Kanban, Plus, Menu, Database } from 'lucide-react';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    if (isConfigured) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, []);

  // Load Tasks when project changes
  useEffect(() => {
    if (activeProjectId && isConfigured) {
      loadTasks(activeProjectId);
    } else {
      setTasks([]);
    }
  }, [activeProjectId]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
    if (data.length > 0 && !activeProjectId) {
      setActiveProjectId(data[0].id);
    }
    setLoading(false);
  };

  const loadTasks = async (projectId: string) => {
    const data = await getTasks(projectId);
    setTasks(data);
  };

  // Handlers
  const handleAddProject = async (name: string) => {
    const newProject = await createProject(name);
    if (newProject) {
      setProjects([...projects, newProject]);
      setActiveProjectId(newProject.id);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const success = await deleteProject(id);
    if (success) {
      const remaining = projects.filter(p => p.id !== id);
      setProjects(remaining);
      if (activeProjectId === id) {
        setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'project_id' | 'status'>) => {
    if (!activeProjectId) return;
    
    const newTask = await createTask({
      ...taskData,
      project_id: activeProjectId,
      status: 'todo'
    });

    if (newTask) {
      setTasks([...tasks, newTask]);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    
    const success = await updateTaskStatus(taskId, status);
    if (!success) {
      // Revert if failed
      loadTasks(activeProjectId!);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if(!confirm("Delete this task?")) return;
    
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    const success = await deleteTask(taskId);
    if (!success) {
      loadTasks(activeProjectId!);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Database className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Setup Required</h1>
          </div>
          
          <div className="space-y-4 text-slate-300 mb-8">
            <p>
              Welcome to <strong>TaskFlow</strong>. To start managing your projects, you need to connect your Supabase database.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm">
              <p className="text-slate-500 mb-2">// 1. Open services/supabase.ts</p>
              <p className="text-slate-500 mb-2">// 2. Update these constants:</p>
              <p className="text-blue-400">SUPABASE_URL</p>
              <p className="text-blue-400">SUPABASE_ANON_KEY</p>
            </div>
            <p className="text-sm text-slate-400">
              Ensure you have created the tables <code>proyectos</code> and <code>tareas</code> in your Supabase SQL Editor.
            </p>
          </div>

          <div className="flex justify-end">
             <a 
               href="https://supabase.com/dashboard" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
             >
               Go to Supabase Dashboard &rarr;
             </a>
          </div>
        </div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Sidebar Wrapper for Mobile */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 transform transition-transform duration-200 lg:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            setActiveProjectId(id);
            setMobileMenuOpen(false);
          }}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-slate-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white truncate">
              {activeProject ? activeProject.name : 'Select a Project'}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
              title="Kanban View"
            >
              <Kanban className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
              Loading...
            </div>
          ) : !activeProjectId ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <p>Select or create a project to get started.</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-slate-400">
                  {tasks.length} tasks in total
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Task</span>
                </button>
              </div>

              <TaskBoard 
                tasks={tasks}
                viewMode={viewMode}
                onUpdateStatus={handleUpdateStatus}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
};

export default App;