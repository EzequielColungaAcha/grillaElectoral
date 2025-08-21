import { UPDATE_PERSON } from '../../../../graphql/persons';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { FormModal } from '../../../modals/FormModal';
import { toast } from 'keep-react';

export const EditPersonButton = ({ person }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [updatePerson] = useMutation(UPDATE_PERSON);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await updatePerson({
        variables: {
          id: person._id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dni: formData.dni,
          vote: formData.vote === 'true',
          order: parseInt(formData.order),
          address: formData.address,
          message: formData.message,
          affiliate: formData.affiliate === 'true',
          referer: formData.referer,
          driver: formData.driver,
          // Pass original values for change tracking
          originalFirstName: person.firstName,
          originalLastName: person.lastName,
          originalDni: person.dni,
          originalVote: person.vote,
          originalOrder: person.order,
          originalAddress: person.address,
          originalMessage: person.message,
          originalAffiliate: person.affiliate,
          originalReferer: person.referer,
          originalDriver: person.driver,
        },
      });

      if (response.data.updatePerson._id) {
        toast.success('Votante actualizado correctamente');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al actualizar votante');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: 'firstName',
      label: 'Nombre',
      type: 'text',
      defaultValue: person.firstName || '',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
      defaultValue: person.lastName || '',
      required: true,
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      defaultValue: person.dni || '',
      required: true,
    },
    {
      name: 'order',
      label: 'Orden',
      type: 'number',
      defaultValue: person.order || 0,
      required: true,
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'text',
      defaultValue: person.address || '',
    },
    {
      name: 'message',
      label: 'Mensaje',
      type: 'text',
      defaultValue: person.message || '',
    },
    {
      name: 'affiliate',
      label: 'Afiliado',
      type: 'select',
      options: [
        { value: 'false', label: '-' },
        { value: 'true', label: 'Afiliado' },
      ],
      defaultValue: person.affiliate ? 'true' : 'false',
      required: true,
    },
    {
      name: 'vote',
      label: 'Voto',
      type: 'select',
      options: [
        { value: 'false', label: 'No Votó' },
        { value: 'true', label: 'Votó' },
      ],
      defaultValue: person.vote ? 'true' : 'false',
      required: true,
    },
    {
      name: 'referer',
      label: 'Referente',
      type: 'text',
      defaultValue: person.referer || '',
    },
    {
      name: 'driver',
      label: 'Chofer',
      type: 'text',
      defaultValue: person.driver || '',
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
        title='Editar Votante'
        fields={formFields}
        loading={loading}
        submitText='Guardar cambios'
      />
    </>
  );
};
