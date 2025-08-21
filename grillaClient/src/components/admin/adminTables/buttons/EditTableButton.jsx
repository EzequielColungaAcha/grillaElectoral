import { UPDATE_TABLE } from '../../../../graphql/tables';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { FormModal } from '../../../modals/FormModal';
import { toast } from 'keep-react';

export const EditTableButton = ({ table }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [updateTable] = useMutation(UPDATE_TABLE);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      let tableNumber = parseInt(formData.tableNumber);
      if (isNaN(tableNumber)) {
        tableNumber = table.number;
      }

      const response = await updateTable({
        variables: {
          id: table._id,
          number: tableNumber,
          description: formData.tableDescription || '',
          status: formData.status,
        },
      });

      if (response.data.updateTable._id) {
        toast.success('Mesa actualizada correctamente');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al actualizar mesa');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Abierta', label: 'Abierta' },
    ...(table.factions == 0
      ? [{ value: 'Cerrada', label: 'Cerrada' }]
      : [{ value: 'DatosEnviados', label: 'Datos Enviados' }]),
  ];

  const formFields = [
    {
      name: 'tableNumber',
      label: 'Número de mesa',
      type: 'number',
      defaultValue: table.number,
      min: 1,
      required: true,
    },
    {
      name: 'tableDescription',
      label: 'Descripción (opcional)',
      type: 'text',
      defaultValue: table.description || '',
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      options: statusOptions,
      defaultValue: table.status,
      required: true,
    },
  ];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className='bg-sky-800 py-2 px-5 hover:bg-sky-600'
      >
        Editar
      </button>

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={`Editar Mesa ${table.number}`}
        fields={formFields}
        loading={loading}
        submitText='Realizar cambios'
      />
    </>
  );
};
