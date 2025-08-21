import React, { useState } from 'react';
import { X, Upload, FileText } from 'phosphor-react';

export const FileUploadModal = ({
  isOpen,
  onClose,
  onFileSelect,
  title,
  description,
  acceptedTypes = '.csv',
  submitText = 'Subir archivo',
  cancelText = 'Cancelar',
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        onClick={closeModal}
      ></div>
      <div className='relative bg-zinc-900 rounded-lg shadow-xl max-w-md w-full mx-4'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <Upload size={24} className='text-zinc-200' />
            <h3 className='text-lg font-semibold text-zinc-200'>{title}</h3>
          </div>
          <button
            onClick={closeModal}
            className='rounded-md p-1 hover:bg-zinc-800'
          >
            <X size={20} />
          </button>
        </div>
        <div className='p-6'>
          <div className='space-y-4'>
            {description && (
              <div className='p-3 bg-zinc-800 border border-zinc-300 rounded-md'>
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-zinc-400 bg-zinc-50'
                  : 'border-zinc-300 hover:border-zinc-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className='flex items-center justify-center gap-2'>
                  <FileText size={24} className='text-green-500' />
                  <span className='text-zinc-200'>{selectedFile.name}</span>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Upload size={32} className='mx-auto text-zinc-400' />
                  <p className='text-zinc-200'>
                    Arrastra un archivo aquí o{' '}
                    <label className='text-zinc-300 hover:text-zinc-600 cursor-pointer underline'>
                      selecciona uno
                      <input
                        type='file'
                        accept={acceptedTypes}
                        onChange={(e) =>
                          e.target.files[0] &&
                          handleFileSelect(e.target.files[0])
                        }
                        className='hidden'
                      />
                    </label>
                  </p>
                  <p className='text-sm text-zinc-400'>
                    Tipos aceptados: {acceptedTypes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex justify-end gap-3 p-6 border-t'>
          <button
            onClick={closeModal}
            className='px-4 py-2 border border-zinc-300 rounded-md text-zinc-700 hover:bg-zinc-50'
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50'
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};
