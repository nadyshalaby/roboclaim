import { render, screen, fireEvent } from '@testing-library/react';
import ExtractedDataModal from '../ExtractedDataModal';

const mockPdfFile = {
  id: '1',
  originalName: 'test.pdf',
  type: 'pdf',
  status: 'completed',
  createdAt: '2025-01-28T14:30:00.000Z',
  extractedData: {
    text: 'Test PDF content',
  },
};

const mockCsvFile = {
  id: '2',
  originalName: 'test.csv',
  type: 'csv',
  status: 'completed',
  createdAt: '2025-01-28T14:35:00.000Z',
  extractedData: {
    records: [
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' },
    ],
  },
};

describe('ExtractedDataModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when file is null', () => {
    const { container } = render(
      <ExtractedDataModal file={null} isOpen={true} onClose={onClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders PDF content correctly', () => {
    render(
      <ExtractedDataModal file={mockPdfFile} isOpen={true} onClose={onClose} />
    );

    expect(screen.getByText('Extracted Data from test.pdf')).toBeInTheDocument();
    expect(screen.getByText('Test PDF content')).toBeInTheDocument();
  });

  it('renders CSV content correctly', () => {
    render(
      <ExtractedDataModal file={mockCsvFile} isOpen={true} onClose={onClose} />
    );

    expect(screen.getByText('Extracted Data from test.csv')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ExtractedDataModal file={mockPdfFile} isOpen={true} onClose={onClose} />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <ExtractedDataModal file={mockPdfFile} isOpen={true} onClose={onClose} />
    );

    // Click the backdrop (the div with the overlay styles)
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });
});
