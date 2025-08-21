import { CREATE_PERSON } from '../../graphql/persons';
import { useMutation } from '@apollo/client';
import { BsFillPersonPlusFill } from 'react-icons/bs';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/authContext';
import { FormModal as KeepFormModal } from '../modals/FormModal';
import { toast } from 'keep-react';

export const PersonFormModal = ({ tableId, tableNumber }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: ['getTable'],
  });

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await addPerson({
        variables: {
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          dni: formData.dni || '',
          vote: false,
          order: parseInt(formData.order) || 0,
          address: '',
          message: '',
          affiliate: false,
          referer: formData.referer || '',
          tableId,
          tableNumber,
          userName: user.name,
          userRol: user.rol,
        },
      });

      if (response.data.createPerson._id) {
        toast.success('Votante añadido correctamente');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al añadir votante');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: 'firstName', label: 'Nombre', type: 'text', required: true },
    { name: 'lastName', label: 'Apellido', type: 'text', required: true },
    { name: 'dni', label: 'DNI', type: 'text', required: true },
    { name: 'order', label: 'Orden', type: 'number', required: true },
    {
      name: 'table',
      label: 'Mesa',
      type: 'number',
      defaultValue: tableNumber,
      disabled: true,
    },
  ];

  return (
    <>
      <button
        className='p-3 bg-zinc-600 hover:bg-zinc-700 rounded flex items-center gap-2'
        onClick={() => setShowModal(true)}
      >
        <BsFillPersonPlusFill /> Añadir votante
      </button>

      <KeepFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title='Añadir votante'
        fields={formFields}
        loading={loading}
      />
    </>
  );
};
