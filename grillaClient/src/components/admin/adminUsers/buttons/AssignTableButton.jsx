import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_USER_TABLE_ASSIGNMENT } from '../../../../graphql/users';
import { GET_TABLES } from '../../../../graphql/tables';
import { useState } from 'react';
import { FormModal } from '../../../modals/FormModal';
import { toast } from 'keep-react';

export const AssignTableButton = ({ userD }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: tablesData } = useQuery(GET_TABLES);
  const [updateUserTableAssignment] = useMutation(UPDATE_USER_TABLE_ASSIGNMENT, {
    refetchQueries: ['usersQuery'],
  });

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await updateUserTableAssignment({
        variables: {
          id: userD._id,
          assignedTableId: formData.assignedTableId && formData.assignedTableId !== 'none' ? formData.assignedTableId : null,
        },
      });

      if (response.data.updateUserTableAssignment._id) {
        toast.success('Asignación de mesa actualizada correctamente');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al actualizar asignación de mesa');
    } finally {
      setLoading(false);
    }
  };

  const createFormFields = () => {
    if (!tablesData?.tables) return [];

    const tableOptions = [
      { value: 'none', label: 'Fiscal General (todas las mesas)' },
      ...tablesData.tables.map(table => ({
        value: table._id,
        label: `Mesa ${table.number}${table.description ? ` - ${table.description}` : ''}`
      }))
    ];

    return [
      {
        name: 'assignedTableId',
        label: 'Mesa Asignada',
        type: 'select',
        options: tableOptions,
        defaultValue: userD.assignedTable?._id || 'none',
        required: false,
      },
    ];
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className='bg-blue-800 py-2 px-5 hover:bg-blue-600'
      >
        Asignar Mesa
      </button>

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={`Asignar Mesa - ${userD.name}`}
        fields={createFormFields()}
        loading={loading}
        submitText='Actualizar Asignación'
      />
    </>
  );
};