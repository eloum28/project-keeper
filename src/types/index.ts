export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | 'maintenance';
  repo_link: string | null;
  local_path: string | null;
  created_at: string;
}