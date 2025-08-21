import { CREATE_FACTION_CONFIG } from '../../../graphql/factions';
import { useMutation } from '@apollo/client';
import { RiGroup2Fill } from 'react-icons/ri';
import { useState } from 'react';
import { FormModal } from '../../modals/FormModal';
import { toast } from 'keep-react';

export const AddFactionConfig = ({ disabled }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [createFactionConfig] = useMutation(CREATE_FACTION_CONFIG);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await createFactionConfig({
        variables: {
          name: formData.name,
          color: formData.color,
          position: formData.position,
        },
      });

      if (response.data.createFactionConfig._id) {
        toast.success('Partido creado correctamente');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al crear partido');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: 'name', label: 'Identificador', type: 'text', required: true },
    {
      name: 'position',
      label: 'Posición',
      type: 'select',
      options: [
        { value: 'intendencia', label: 'Intendencia' },
        { value: 'gobernacion', label: 'Gobernación' },
        { value: 'presidencia', label: 'Presidencia' },
      ],
      defaultValue: 'intendencia',
    },
    {
      name: 'color',
      label: 'Color del Partido',
      type: 'color',
      defaultValue: '#ffffff',
    },
  ];

  return (
    <>
      <button
        className='p-3 bg-zinc-600 rounded flex items-center gap-2 disabled:hidden hover:bg-zinc-500'
        onClick={() => setShowModal(true)}
        disabled={disabled}
      >
        <RiGroup2Fill className='text-xl' /> Añadir Partido
      </button>

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title='Añadir Partido / Candidato'
        fields={formFields}
        loading={loading}
        submitText='Crear'
      />
    </>
  );
};
