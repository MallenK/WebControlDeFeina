import React from 'react';
import { Task, TaskStatus } from '../types';
import { Calendar, AlertCircle, Trash2, GripVertical } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  viewMode: 'list' | 'kanban';
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${styles[priority as keyof typeof styles]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const TaskCard: React.FC<{ 
  task: Task; 
  onDelete: (id: string) => void;
  compact?: boolean; 
}> = ({ task, onDelete, compact }) => {
  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'done';
  const dateStr = new Date(task.due_date).toLocaleDateString();

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
      }}
      className={`bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-sm hover:border-slate-500 transition-colors cursor-move group relative ${compact ? 'flex items-center gap-4' : 'flex flex-col gap-2'}`}
    >
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium text-slate-200 truncate ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
          {task.title}
        </h3>
        {!compact && <div className="mt-2 flex items-center justify-between">
          <PriorityBadge priority={task.priority} />
          <div className={`flex items-center text-xs gap-1 ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
            {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {dateStr}
          </div>
        </div>}
      </div>

      {compact && (
         <>
          <PriorityBadge priority={task.priority} />
          <div className={`flex items-center text-xs gap-1 w-24 justify-end ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
            {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {dateStr}
          </div>
         </>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-all absolute top-2 right-2 md:relative md:top-auto md:right-auto"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, viewMode, onUpdateStatus, onDeleteTask }) => {
  
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onUpdateStatus(taskId, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'border-slate-600' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-500' },
    { id: 'done', title: 'Completed', color: 'border-green-500' },
  ];

  if (viewMode === 'list') {
    return (
      <div className="space-y-2 max-w-4xl mx-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No tasks found. Add one to get started!</div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="group flex items-center gap-2">
               {/* Quick status switcher for list view */}
               <select 
                 value={task.status}
                 onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                 className="bg-transparent text-xs text-slate-500 border border-slate-700 rounded px-1 py-1 focus:bg-slate-800"
               >
                 <option value="todo">Todo</option>
                 <option value="in_progress">Doing</option>
                 <option value="done">Done</option>
               </select>
               <div className="flex-1">
                 <TaskCard task={task} onDelete={onDeleteTask} compact />
               </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div 
            key={col.id} 
            className="flex flex-col h-full min-h-[500px] bg-slate-900/50 rounded-xl border border-slate-800"
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <div className={`p-3 border-t-4 ${col.color} bg-slate-800 rounded-t-xl flex justify-between items-center`}>
              <h3 className="font-semibold text-slate-200">{col.title}</h3>
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{colTasks.length}</span>
            </div>
            
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {colTasks.map(task => (
                <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
              ))}
              {colTasks.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-700/50 rounded-lg flex items-center justify-center text-slate-600 text-sm">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};