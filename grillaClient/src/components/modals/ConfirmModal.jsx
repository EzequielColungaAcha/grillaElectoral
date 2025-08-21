import React from 'react';
import {
  Trash,
  Warning,
  ShieldWarning,
  CheckCircle,
  Info,
  X,
} from 'phosphor-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  noTrashIcon,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return noTrashIcon ? (
          <ShieldWarning size={24} className='text-red-500' />
        ) : (
          <Trash size={24} className='text-red-500' />
        );
      case 'success':
        return <CheckCircle size={24} className='text-green-500' />;
      case 'info':
        return <Info size={24} className='text-blue-500' />;
      default:
        return <Warning size={24} className='text-yellow-600' />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-yellow-700 hover:bg-yellow-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        onClick={onClose}
      ></div>
      <div className='relative bg-zinc-900 rounded-lg shadow-xl max-w-md w-full mx-4'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            {getIcon()}
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
          <div className='text-zinc-200 whitespace-pre-line'>{message}</div>
        </div>
        <div className='flex justify-end gap-3 p-6 border-t'>
          <button
            onClick={onClose}
            disabled={loading}
            className='px-4 py-2 border border-zinc-300 rounded-md text-zinc-300 hover:bg-zinc-200 hover:text-zinc-800 disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-zinc-100 rounded-md disabled:opacity-50 ${getConfirmButtonClass()}`}
          >
            {loading ? 'Cargando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
