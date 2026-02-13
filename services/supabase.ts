import { createClient } from '@supabase/supabase-js';
import { Project, Task, TaskStatus } from '../types';

// --------------------------------------------------------------------------
// CONFIGURATION
// Please fill in your Supabase details below.
// In a real production app, use environment variables (process.env).
// --------------------------------------------------------------------------
const ENV_URL = process.env.REACT_APP_SUPABASE_URL;
const ENV_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Provided credentials
const FALLBACK_URL = 'https://ghxntlwocdqacybrspsd.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoeG50bHdvY2RxYWN5YnJzcHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjM5NTYsImV4cCI6MjA3NzEzOTk1Nn0.IlCuajufM4VJ2-BkVwdJvxRqJDBHkaST_EmSWoC4Da8';

// Determine if we have valid configuration
const url = ENV_URL || FALLBACK_URL;
const key = ENV_KEY || FALLBACK_KEY;

const isUrlValid = url.startsWith('http://') || url.startsWith('https://');

// Since we have hardcoded keys, this should generally be true unless the keys are removed.
export const isConfigured = isUrlValid && key.length > 0;

// Use a fallback valid URL structure if configuration is missing to prevent "Invalid URL" crash
// The app will check `isConfigured` and prompt the user if needed.
const safeUrl = isConfigured ? url : 'https://placeholder.supabase.co';
const safeKey = isConfigured ? key : 'placeholder';

export const supabase = createClient(safeUrl, safeKey);

// --- Projects API ---

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('proyectos') // Using Spanish table name as requested
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data || [];
};

export const createProject = async (name: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return null;
  }
  return data;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('proyectos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }
  return true;
};

// --- Tasks API ---

export const getTasks = async (projectId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tareas') // Using Spanish table name as requested
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tareas')
    .insert([task])
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  return data;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<boolean> => {
  const { error } = await supabase
    .from('tareas')
    .update({ status })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task status:', error);
    return false;
  }
  return true;
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tareas')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  return true;
};