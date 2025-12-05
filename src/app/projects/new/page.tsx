'use client'; 

// We go up 3 levels (new -> projects -> app) to find the lib folder
import { supabase } from '../../../lib/supabase';
import { Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Gather data from the form
    const newProject = {
      name: formData.get('name'),
      description: formData.get('description'),
      status: formData.get('status'),
      repo_link: formData.get('repo_link'),
      local_path: formData.get('local_path'),
    };

    // Send to Supabase
    const { error } = await supabase.from('projects').insert([newProject]);

    if (error) {
      alert('Error creating project: ' + error.message);
      setLoading(false);
    } else {
      // Success! Go back to the Dashboard (Home)
      router.push('/');
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Add New Project</h1>
          <Link href="/" className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
            <input 
              name="name" 
              required 
              placeholder="e.g., Project Keeper"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Status & Local Path */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                <option value="active">Active (In Progress)</option>
                <option value="maintenance">Maintenance (Finished)</option>
                <option value="archived">Archived (Dead)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Local Path (PC)</label>
              <input 
                name="local_path" 
                placeholder="C:/Users/You/..."
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Repo Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Repository Link</label>
            <input 
              name="repo_link" 
              type="url"
              placeholder="https://github.com/..."
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              name="description" 
              rows={4}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : <><Save size={20} /> Create Project</>}
          </button>

        </form>
      </div>
    </main>
  );
}