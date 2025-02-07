import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { files, FileUploadResponse } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  DocumentIcon,
  PhotoIcon,
  TableCellsIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ExtractedDataModal from './ExtractedDataModal';
import { socketService } from '@/lib/socket';
import { ApiError } from '@/types/api';

function getFileIcon(type: FileUploadResponse['type']) {
  switch (type) {
    case 'pdf':
      return <DocumentIcon className="h-6 w-6" />;
    case 'image':
      return <PhotoIcon className="h-6 w-6" />;
    case 'csv':
    case 'excel':
      return <TableCellsIcon className="h-6 w-6" />;
    default:
      return <DocumentIcon className="h-6 w-6" />;
  }
}

function getStatusColor(status: FileUploadResponse['status']) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function FileList() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<FileUploadResponse | null>(null);

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['files'],
    queryFn: () => files.getAll(),
    // Refresh data every 5 seconds as a fallback
    refetchInterval: 5000,
    throwOnError: (error: ApiError | Error) => {
      const msg = (error as ApiError).response?.data?.message || 'Failed to fetch files';
      toast.error(msg);
      return true;
    },    
  });

  const fileList = response?.files || [];

  const deleteMutation = useMutation({
    mutationFn: files.delete,
    onSuccess: () => {
      toast.success('File deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    },
  });

  useEffect(() => {
    const connectSocket = () => {
      try {
        socketService.connect();
        console.log('Socket connected successfully');
      } catch (error) {
        console.error('Socket connection failed:', error);
        // Retry connection after 5 seconds
        setTimeout(connectSocket, 5000);
      }
    };

    const handleFileStatus = async (data: {
      fileId: string;
      status: FileUploadResponse['status'];
      data?: Record<string, unknown>;
    }) => {
      console.log('Received file status update:', data);
      
      try {
        // Force a fresh fetch immediately
        await refetch();
        console.log('Files refetched successfully');

        // Update the cache with the latest data
        queryClient.setQueryData(['files'], (oldData: any) => {
          console.log('Current data in cache:', oldData);
          
          if (!oldData || !oldData.files) {
            console.warn('No existing data in cache');
            return { files: [], meta: oldData?.meta || {} };
          }

          const newFiles = oldData.files.map((file: FileUploadResponse) => {
            if (file.id === data.fileId) {
              const updatedFile = {
                ...file,
                status: data.status,
                extractedData: data.data,
                errorMessage: data.data?.error as string | undefined,
              };
              console.log('Updated file:', updatedFile);
              return updatedFile;
            }
            return file;
          });

          console.log('New file list:', newFiles);
          return {
            ...oldData,
            files: newFiles,
          };
        });
      } catch (error) {
        console.error('Error updating files:', error);
        toast.error('Failed to update files list');
      }

      // Show toast notifications for status changes
      switch (data.status) {
        case 'completed':
          toast.dismiss(`processing-${data.fileId}`); // Dismiss the loading toast
          toast.success(`File processing completed: ${data.fileId}`);
          break;
        case 'failed':
          toast.dismiss(`processing-${data.fileId}`); // Dismiss the loading toast
          toast.error(`File processing failed: ${data.fileId}`);
          break;
        case 'processing':
          toast.loading(`Processing file: ${data.fileId}`, {
            id: `processing-${data.fileId}`, // Add an ID to the toast
          });
          break;
      }
    };

    // Setup socket event listener for file status updates
    socketService.addListener('fileStatus', handleFileStatus);
    
    return () => {
      socketService.removeListener('fileStatus', handleFileStatus);
    };
  }, [queryClient, refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!fileList?.length) {
    return <div className="text-center text-gray-500">No files uploaded yet</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {fileList.map((file) => (
          <div
            key={file.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="text-gray-500">{getFileIcon(file.type)}</div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {file.originalName}
                </h3>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      file.status
                    )}`}
                  >
                    {file.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(file.createdAt), 'PPp')}
                  </span>
                </div>
                {file.errorMessage && (
                  <p className="mt-1 text-xs text-red-600">{file.errorMessage}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {file.status === 'completed' && (
                <button
                  onClick={() => setSelectedFile(file)}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  View Data
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(file.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ExtractedDataModal
        file={selectedFile}
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </>
  );
}
