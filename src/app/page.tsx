import { supabase } from '../lib/supabase';
import { FolderGit2, Plus, Server, Terminal } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  
  // 1. Fetch data from Supabase
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Keeper</h1>
          <p className="text-slate-500">Your 5-year roadmap.</p>
        </div>
        
        <Link 
          href="/projects/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>

      {/* PROJECT GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Error State */}
        {error && (
          <div className="col-span-full p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            Error: {error.message}
          </div>
        )}

        {/* Empty State */}
        {projects && projects.length === 0 && (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-300 rounded-xl bg-white">
            <FolderGit2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
            <p className="text-slate-500">Start your journey by adding your first project.</p>
          </div>
        )}

        {/* Project List */}
        {projects?.map((project) => (
          <Link 
            key={project.id} 
            href={`/projects/${project.id}`}
            className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Terminal size={24} />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                {project.status.toUpperCase()}
              </span>
            </div>
            
            <h3 className="font-semibold text-slate-900 mb-1">{project.name}</h3>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Server size={14} />
                <span>Local</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}