import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { files } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function FileUpload() {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: files.upload,
    onSuccess: () => {
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadMutation.mutate(file);
      });
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-500'
      }`}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? 'Drop the files here...'
          : 'Drag and drop files here, or click to select files'}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Supported files: PDF, Images (JPG, PNG), CSV, Excel (XLSX)
      </p>
      <p className="mt-1 text-xs text-gray-500">Max file size: 5MB</p>
    </div>
  );
}
