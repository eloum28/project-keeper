import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import ProjectClient from './project-client'; // Import the new component

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  // Fetch Data on Server
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Project Not Found</h1>
        <Link href="/" className="text-blue-500 mt-4 block">&larr; Back to Dashboard</Link>
      </div>
    );
  }

  // Hand off to the Client Component
  return <ProjectClient initialProject={project} />;
}