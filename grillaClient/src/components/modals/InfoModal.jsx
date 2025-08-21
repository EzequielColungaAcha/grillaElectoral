import React from 'react';
import { X, Info } from 'phosphor-react';

export const InfoModal = ({
  isOpen,
  onClose,
  title,
  children,
  showIcon = true,
  closeText = 'Cerrar',
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        onClick={onClose}
      ></div>
      <div className='relative bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            {showIcon && <Info size={24} className='text-blue-500' />}
            <h3 className='text-lg font-semibold text-zinc-200'>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className='rounded-md p-1 hover:bg-zinc-800'
          >
            <X size={20} />
          </button>
        </div>
        <div className='p-6'>
          <div className='text-zinc-200'>{children}</div>
        </div>
        <div className='flex justify-end p-6 border-t'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md'
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
};
