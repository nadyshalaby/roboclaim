import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { users } from '@/lib/api';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    company?: string;
    jobTitle?: string;
    bio?: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      company: initialData?.company || '',
      jobTitle: initialData?.jobTitle || '',
      bio: initialData?.bio || '',
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: users.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
      setIsChangingPassword(false);
      passwordReset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: users.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: passwordReset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: ProfileFormData) => {
    const { email, ...updateData } = data;
    updateProfileMutation.mutate(updateData);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="w-full space-y-6" data-testid="profile-form">
      <div className="flex justify-between items-center">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            data-testid="edit-profile-button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white">
              First Name
            </label>
            <input
              type="text"
              data-testid="first-name-input"
              {...register('firstName')}
              disabled={!isEditing}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600" data-testid="first-name-error">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Last Name
            </label>
            <input
              type="text"
              data-testid="last-name-input"
              {...register('lastName')}
              disabled={!isEditing}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              data-testid="email-input"
              {...register('email')}
              disabled={!isEditing}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" data-testid="email-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Phone Number
            </label>
            <input
              type="tel"
              data-testid="phone-input"
              {...register('phoneNumber')}
              disabled={!isEditing}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600" data-testid="phone-error">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Company
            </label>
            <input
              type="text"
              data-testid="company-input"
              {...register('company')}
              disabled={!isEditing}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-600" data-testid="company-error">{errors.company.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Job Title
            </label>
            <input
              type="text"
              data-testid="job-title-input"
              {...register('jobTitle')}
              disabled={!isEditing}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600" data-testid="job-title-error">{errors.jobTitle.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Bio
          </label>
          <textarea
            {...register('bio')}
            data-testid="bio-input"
            disabled={!isEditing}
            rows={4}
            className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600" data-testid="bio-error">{errors.bio.message}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              data-testid="cancel-edit-button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              data-testid="save-profile-button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </form>

      {/* Password Change Section */}
      {!isChangingPassword ? (
        <div className="flex justify-end">
          <button
            type="button"
            data-testid="change-password-button"
            onClick={() => setIsChangingPassword(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Change Password
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 mt-8 pt-8 border-t border-gray-600">
          <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
          
          <div>
            <label className="block text-sm font-medium text-white">
              Current Password
            </label>
            <input
              type="password"
              data-testid="current-password-input"
              {...registerPassword('currentPassword')}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600" data-testid="current-password-error">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              New Password
            </label>
            <input
              type="password"
              data-testid="new-password-input"
              {...registerPassword('newPassword')}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600" data-testid="new-password-error">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Confirm New Password
            </label>
            <input
              type="password"
              data-testid="confirm-password-input"
              {...registerPassword('confirmPassword')}
              className="mt-1 block w-full text-black px-2 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600" data-testid="confirm-password-error">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              data-testid="cancel-password-button"
              onClick={() => {
                setIsChangingPassword(false);
                passwordReset();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="update-password-button"
              disabled={updatePasswordMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {updatePasswordMutation.isPending ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Updating...</span>
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
