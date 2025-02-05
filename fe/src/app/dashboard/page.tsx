'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import FileUpload from '@/components/files/FileUpload';
import FileList from '@/components/files/FileList';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Upload files to analyze their contents.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
          <FileUpload />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Your Files</h2>
          <FileList />
        </div>
      </div>
    </div>
  );
}
