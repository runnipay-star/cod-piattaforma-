import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  disableClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, disableClose = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={disableClose ? undefined : onClose}>
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl p-8 m-4 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
            {!disableClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
            )}
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
