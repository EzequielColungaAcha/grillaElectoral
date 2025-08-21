import React, { useState } from 'react';
import { X } from 'phosphor-react';
import {
  Select,
  SelectAction,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from 'keep-react';

export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields = [],
  submitText = 'Enviar',
  cancelText = 'Cancelar',
  loading = false,
}) => {
  const [formData, setFormData] = useState({});

  // Initialize form data with default values when modal opens or fields change
  React.useEffect(() => {
    if (isOpen && fields.length > 0) {
      const initialData = {};
      fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else if (
          field.type === 'select' &&
          field.options &&
          field.options.length > 0
        ) {
          initialData[field.name] = field.options[0].value;
        } else if (field.type === 'number') {
          initialData[field.name] = 0;
        } else if (field.type === 'color') {
          initialData[field.name] = '#ffffff';
        } else {
          initialData[field.name] = '';
        }
      });
      setFormData(initialData);
    }
  }, [isOpen, fields]);

  // Reset form data when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({});
    }
  }, [isOpen]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure all required fields are included
    const completeFormData = {};
    fields.forEach((field) => {
      if (formData[field.name] !== undefined) {
        completeFormData[field.name] = formData[field.name];
      } else if (field.defaultValue !== undefined) {
        completeFormData[field.name] = field.defaultValue;
      } else if (field.required) {
        // For required fields without values, use appropriate defaults
        if (field.type === 'number') {
          completeFormData[field.name] = 0;
        } else if (
          field.type === 'select' &&
          field.options &&
          field.options.length > 0
        ) {
          completeFormData[field.name] = field.options[0].value;
        } else {
          completeFormData[field.name] = '';
        }
      }
    });

    onSubmit(completeFormData);
  };

  const renderField = (field) => {
    const { name, label, type, options, defaultValue, ...props } = field;
    const currentValue =
      formData[name] !== undefined ? formData[name] : defaultValue || '';

    switch (type) {
      case 'select':
        return (
          <div key={name} className='space-y-2'>
            <label className='text-sm font-medium text-zinc-200'>
              {label}:
            </label>
            <Select
              value={currentValue}
              onValueChange={(v) => handleInputChange(name, v)}
              {...props}
            >
              <SelectAction className='w-full bg-zinc-800 border border-zinc-300 text-zinc-200 rounded-md'>
                <SelectValue placeholder={`Seleccionar ${label}`} />
              </SelectAction>

              <SelectContent className='bg-zinc-800 border border-zinc-300'>
                <SelectGroup>
                  {options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className='text-zinc-200 cursor-pointer'
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div key={name} className='space-y-2'>
            <label className='text-sm font-medium text-zinc-200'>
              {label}:
            </label>
            <input
              type='number'
              value={currentValue}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className='w-full px-3 py-2 border border-zinc-300 bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-100'
              {...props}
            />
          </div>
        );

      case 'color':
        return (
          <div key={name} className='space-y-2'>
            <div className='flex border-zinc-300 flex-col justify-center items-center mt-4 p-3 bg-zinc-800 rounded text-sm text-zinc-200 space-y-2'>
              <p className='font-medium mb-2'>Colores sugeridos:</p>
              <div className='flex gap-2'>
                <div
                  className='w-6 h-6 rounded'
                  style={{ backgroundColor: 'rgb(0, 184, 255)' }}
                  title='Celeste'
                ></div>
                <div
                  className='w-6 h-6 rounded'
                  style={{ backgroundColor: 'rgb(108, 76, 153)' }}
                  title='Violeta'
                ></div>
                <div
                  className='w-6 h-6 rounded'
                  style={{ backgroundColor: 'rgb(208, 55, 29)' }}
                  title='Rojo'
                ></div>
                <div
                  className='w-6 h-6 rounded'
                  style={{ backgroundColor: 'rgb(248, 203, 6)' }}
                  title='Amarillo'
                ></div>
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-zinc-200'>
                {label}:
              </label>
              <input
                type='color'
                value={currentValue || '#ffffff'}
                onChange={(e) => handleInputChange(name, e.target.value)}
                className='w-full h-10 rounded border border-zinc-300'
                {...props}
              />
            </div>
          </div>
        );

      default:
        return (
          <div key={name} className='space-y-2'>
            <label className='text-sm font-medium text-zinc-200'>
              {label}:
            </label>
            <input
              type={type || 'text'}
              value={currentValue}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className='w-full px-3 py-2 border bg-zinc-800 border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-100'
              {...props}
            />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        onClick={onClose}
      ></div>
      <div className='relative bg-zinc-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b'>
          <h3 className='text-lg font-semibold text-zinc-200'>{title}</h3>
          <button
            onClick={onClose}
            className='rounded-md p-1 hover:bg-zinc-800'
          >
            <X size={20} />
          </button>
        </div>
        <div className='p-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {fields.map(renderField)}
          </form>
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
            onClick={handleSubmit}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50'
          >
            {loading ? 'Cargando...' : submitText}
          </button>
        </div>
      </div>
    </div>
  );
};
