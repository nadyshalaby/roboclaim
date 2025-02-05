import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { files } from '@/lib/api';
import FileList from '../FileList';

// Mock the API calls
vi.mock('@/lib/api', () => ({
  files: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Mocked Date'),
}));

const mockFiles = [
  {
    id: '1',
    originalName: 'test.pdf',
    type: 'pdf',
    status: 'completed',
    createdAt: '2025-01-28T14:30:00.000Z',
    extractedData: {
      text: 'Test PDF content',
    },
  },
  {
    id: '2',
    originalName: 'test.csv',
    type: 'csv',
    status: 'processing',
    createdAt: '2025-01-28T14:35:00.000Z',
  },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('FileList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('displays loading state', () => {
    (files.getAll as any).mockImplementation(() => new Promise(() => {}));
    renderWithQueryClient(<FileList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays empty state when no files', async () => {
    (files.getAll as any).mockResolvedValue([]);
    renderWithQueryClient(<FileList />);
    await waitFor(() => {
      expect(screen.getByText('No files uploaded yet')).toBeInTheDocument();
    });
  });

  it('displays list of files', async () => {
    (files.getAll as any).mockResolvedValue(mockFiles);
    renderWithQueryClient(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });

  it('shows view data button only for completed files', async () => {
    (files.getAll as any).mockResolvedValue(mockFiles);
    renderWithQueryClient(<FileList />);

    await waitFor(() => {
      const viewDataButtons = screen.getAllByText('View Data');
      expect(viewDataButtons).toHaveLength(1);
    });
  });

  it('handles file deletion', async () => {
    (files.getAll as any).mockResolvedValue(mockFiles);
    (files.delete as any).mockResolvedValue({});
    
    renderWithQueryClient(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[1]); // Click delete button

    await waitFor(() => {
      expect(files.delete).toHaveBeenCalledWith('1');
    });
  });

  it('opens modal when view data is clicked', async () => {
    (files.getAll as any).mockResolvedValue(mockFiles);
    renderWithQueryClient(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Data'));

    await waitFor(() => {
      expect(screen.getByText('Extracted Data from test.pdf')).toBeInTheDocument();
      expect(screen.getByText('Test PDF content')).toBeInTheDocument();
    });
  });
});
