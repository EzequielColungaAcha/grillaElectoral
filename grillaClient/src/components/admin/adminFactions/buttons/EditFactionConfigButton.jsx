import { UPDATE_FACTION_CONFIG } from '../../../../graphql/factions';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { FormModal } from '../../../modals/FormModal';
import { toast } from 'keep-react';

export const EditFactionConfigButton = ({ factionConfig }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [updateFactionConfig] = useMutation(UPDATE_FACTION_CONFIG);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await updateFactionConfig({
        variables: {
          id: factionConfig._id,
          name: formData.name,
          color: formData.color,
          position: formData.position,
        },
      });

      if (response.data.updateFactionConfig._id) {
        toast.success('Partido actualizado correctamente');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al actualizar partido');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: 'name',
      label: 'Nombre del Partido',
      type: 'text',
      defaultValue: factionConfig.name || '',
      required: true,
    },
    {
      name: 'position',
      label: 'Posición',
      type: 'select',
      options: [
        { value: 'intendencia', label: 'Intendencia' },
        { value: 'gobernacion', label: 'Gobernación' },
        { value: 'presidencia', label: 'Presidencia' },
      ],
      defaultValue: factionConfig.position || 'intendencia',
      required: true,
    },
    {
      name: 'color',
      label: 'Color del Partido',
      type: 'color',
      defaultValue: factionConfig.color || '#ffffff',
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
        title={`Editar Lista ${factionConfig.name}`}
        fields={formFields}
        loading={loading}
        submitText='Realizar cambios'
      />
    </>
  );
};
