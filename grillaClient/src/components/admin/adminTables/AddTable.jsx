import { CREATE_TABLE } from '../../../graphql/tables';
import { useMutation } from '@apollo/client';
import { GiTable } from 'react-icons/gi';
import { useState } from 'react';
import { FormModal } from '../../modals/FormModal';
import { toast } from 'keep-react';

export const AddTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addTable] = useMutation(CREATE_TABLE);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await addTable({
        variables: {
          number: parseInt(formData.tableNumber) || 0,
          description: formData.tableDescription || '',
          status: 'Abierta',
        },
      });

      if (response.data.createTable._id) {
        toast.success('Mesa creada correctamente');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al crear mesa');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: 'tableNumber',
      label: 'Número de mesa',
      type: 'number',
      required: true,
    },
    { name: 'tableDescription', label: 'Descripción (opcional)', type: 'text' },
  ];

  return (
    <>
      <button
        className='py-3 px-5 bg-zinc-600 flex justify-center gap-2 hover:bg-zinc-500'
        onClick={() => setShowModal(true)}
      >
        <GiTable className='text-xl' /> Añadir Mesa
      </button>

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title='Añadir Mesa'
        fields={formFields}
        loading={loading}
        submitText='Crear'
      />
    </>
  );
};
