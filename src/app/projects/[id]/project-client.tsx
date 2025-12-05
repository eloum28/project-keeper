'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProjectClient({ initialProject }: { initialProject: any }) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    repository_link: project.repository_link || '',
    local_path: project.local_path || '',
    status: project.status || 'Active',
    personal_notes: project.personal_notes || '',
    attachment_url: project.attachment_url || '' // <--- New Field
  });

  const handleCopyPath = () => {
    if (project.local_path) {
      navigator.clipboard.writeText(project.local_path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- NEW: Handle File Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${project.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('project-files') // Make sure this matches your bucket name
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading file: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // 2. Get the Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    // 3. Update State (so it saves to DB when you click "Save Changes")
    setFormData((prev) => ({ ...prev, attachment_url: publicUrl }));
    setUploading(false);
  };
  // -------------------------------

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoading(true);
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .update(formData)
      .eq('id', project.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      setProject(data);
      setIsEditing(false);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 mr-4">
          {isEditing ? (
            <input
              type="text"
              className="text-4xl font-bold mb-3 text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          ) : (
            <h1 className="text-4xl font-bold mb-3 text-gray-900">{project.name}</h1>
          )}

          {isEditing ? (
            <select
              className="px-3 py-1 rounded-md text-sm font-medium border bg-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Active (In Progress)">Active (In Progress)</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          ) : (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {project.status || 'No Status'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
           {!isEditing ? (
             <>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                  Edit
                </button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100" disabled={loading}>
                  Delete
                </button>
                <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Close
                </Link>
             </>
           ) : (
             <>
               <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
             </>
           )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* SECTION 1: LINKS (Top) */}
        <div className="p-8 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Repository</span>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full border rounded-md p-2 bg-white"
                  value={formData.repository_link}
                  onChange={(e) => setFormData({ ...formData, repository_link: e.target.value })}
                />
              ) : (
                project.repository_link ? (
                  <a href={project.repository_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all font-medium">
                    {project.repository_link}
                  </a>
                ) : <span className="text-gray-400">N/A</span>
              )}
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Local Path</span>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full border rounded-md p-2 bg-white"
                  value={formData.local_path}
                  onChange={(e) => setFormData({ ...formData, local_path: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 bg-white border rounded px-2 py-1 w-fit max-w-full shadow-sm">
                  <code className="text-gray-700 text-sm break-all font-mono">
                    {project.local_path || 'N/A'}
                  </code>
                  {project.local_path && (
                    <button onClick={handleCopyPath} title="Copy Path" className="ml-2 text-gray-400 hover:text-gray-700 transition-colors">
                      {copied ? <span className="text-green-600 font-bold text-xs">Copied!</span> : <span>📋</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: PERSONAL NOTES */}
        <div className="p-8 border-b bg-yellow-50">
           <h2 className="text-sm font-semibold text-yellow-800 uppercase tracking-wide mb-3">
             📒 Personal Notes
           </h2>
           {isEditing ? (
             <textarea
               className="w-full border border-yellow-300 bg-yellow-100 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-yellow-500 outline-none"
               rows={6}
               placeholder="Write your ideas, tasks, or bugs here..."
               value={formData.personal_notes}
               onChange={(e) => setFormData({ ...formData, personal_notes: e.target.value })}
             />
           ) : (
             <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
               {project.personal_notes ? project.personal_notes : <span className="text-gray-400 italic">No notes yet...</span>}
             </div>
           )}
        </div>

        {/* SECTION 3: ATTACHMENTS (NEW) */}
        <div className="p-8 border-b">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">📎 Attachments</h2>
          
          {isEditing ? (
            <div className="border border-dashed border-gray-300 rounded-md p-6 text-center bg-gray-50">
              {formData.attachment_url && (
                <div className="mb-4 text-green-600 text-sm">
                  ✓ File attached. Uploading a new one will replace it.
                </div>
              )}
              <input 
                type="file" 
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {uploading && <p className="text-blue-500 mt-2 text-sm">Uploading...</p>}
            </div>
          ) : (
            <div>
              {project.attachment_url ? (
                <a 
                  href={project.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  📄 View Attached File
                </a>
              ) : (
                <span className="text-gray-400 italic">No files attached.</span>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: DESCRIPTION (Bottom) */}
        <div className="p-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</h2>
          {isEditing ? (
            <textarea
              className="w-full border rounded-md p-3 text-gray-800 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          ) : (
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {project.description || "No description provided."}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}