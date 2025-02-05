import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FileUploadResponse } from '@/lib/api';

interface ExtractedDataModalProps {
  file: FileUploadResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtractedDataModal({
  file,
  isOpen,
  onClose,
}: ExtractedDataModalProps) {
  if (!file) return null;

  const renderExtractedData = () => {
    switch (file.type) {
      case 'pdf':
      case 'image':
        return (
          <div className="whitespace-pre-wrap font-mono text-sm">
            {file.extractedData?.text}
          </div>
        );
      case 'csv':
      case 'excel':
        const records = file.extractedData?.records || [];
        const firstRecord = records[0] || {};
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {Object.keys(firstRecord).map((header) => (
                    <th
                      key={header}
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {file.extractedData?.records?.map((record: any, index: number) => (
                  <tr key={index}>
                    {Object.values(record).map((value: any, i: number) => (
                      <td
                        key={i}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                )) || null}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>No data available</div>;
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Extracted Data from {file.originalName}
                    </Dialog.Title>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                      {renderExtractedData()}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
