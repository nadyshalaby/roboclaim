import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">Register</h1>
      <div className="bg-white p-8 rounded-lg shadow">
        <RegisterForm />
      </div>
    </div>
  );
}
