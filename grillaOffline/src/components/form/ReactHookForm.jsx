import { BsFillPersonPlusFill } from 'react-icons/bs';
import { useContext, useState } from 'react';
import { useAuth } from "../../context/simpleAuthContext";
import { useDB } from "../../context/dbContext";
import { FormModal as KeepFormModal } from '../modals/FormModal';

export const FormModal = ({ tableId, tableNumber }) => {
  const { user } = useAuth();
  const { addRecord } = useDB();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const addPerson = async (personData) => {
    return await addRecord('persons', personData);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await addPerson({
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
      });

      if (response._id) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error adding person:', error);
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