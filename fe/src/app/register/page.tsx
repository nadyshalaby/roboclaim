import RegisterForm from '@/components/auth/RegisterForm';
import Loading from '@/components/Loading';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center text-white justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Register
          </h2>
        </div>
        <Suspense fallback={<Loading />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
