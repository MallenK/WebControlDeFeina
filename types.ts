export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Project {
  id: string;
  name: string;
  created_at?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  due_date: string; // ISO date string
  created_at?: string;
}

export interface ViewMode {
  mode: 'list' | 'kanban';
}