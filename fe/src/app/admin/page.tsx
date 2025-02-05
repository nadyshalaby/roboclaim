import { Suspense } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Loading from '@/components/Loading';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <Suspense fallback={<Loading />}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
