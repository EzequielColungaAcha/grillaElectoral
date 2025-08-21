import { GET_TABLE_VOTES, UPDATE_VOTES } from '../../../../graphql/factions';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { BsSendCheck } from 'react-icons/bs';
import {
  FACTION_VOTES_UPDATE,
  TABLE_CHANGED,
} from '../../../../graphql/subscription';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../../context/authContext';
import { useState } from 'react';
import { FormModal } from '../../../modals/FormModal';
import { toast } from 'keep-react';

export const EditVotesButton = ({ table }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const {
    loading: getTableVotesLoading,
    error,
    data,
    refetch,
  } = useQuery(GET_TABLE_VOTES, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
  });

  const [updateVotes] = useMutation(UPDATE_VOTES);

  const { data: tableChanged } = useSubscription(TABLE_CHANGED, {
    onData: ({ client, onData }) => {
      toast.info('Mesa actualizada');
      setTimeout(() => {
        refetch();
      }, 2000);
    },
  });

  const { data: factionVotesUpdate } = useSubscription(FACTION_VOTES_UPDATE, {
    onData: ({ client, onData }) => {
      toast.success('Datos de votos actualizados correctamente');
      setTimeout(() => {
        refetch();
      }, 2000);
    },
  });

  if (getTableVotesLoading) return <span className='loader'></span>;
  if (error) return <p>Error...</p>;

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const records = [];

      // Process form data to create faction records
      Object.keys(formData).forEach((key) => {
        if (key.startsWith('faction_')) {
          const factionId = key.replace('faction_', '');
          const faction = data.table.factions.find((f) => f._id === factionId);
          if (faction) {
            records.push({
              _id: factionId,
              votes: parseInt(formData[key]) || 0,
              name: faction.config.name,
            });
          }
        }
      });

      const response = await updateVotes({
        variables: {
          data: records,
          userName: user.name,
          userRol: user.rol,
          tableNumber: table.number,
        },
      });

      if (response.data.updateMultipleFactionRecord) {
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al actualizar datos');
    } finally {
      setLoading(false);
    }
  };

  const createFormFields = () => {
    const intendencia = data.table.factions.filter((f) => {
      return f.config.position === 'intendencia';
    });
    const gobernacion = data.table.factions.filter((f) => {
      return f.config.position === 'gobernacion';
    });
    const presidencia = data.table.factions.filter((f) => {
      return f.config.position === 'presidencia';
    });

    const fields = [];

    // Add fields for each faction with current votes
    if (intendencia.length > 0) {
      intendencia
        .sort((a, b) =>
          a.config.name > b.config.name || a.config.name == 'Blancos' ? 1 : -1
        )
        .forEach((faction) => {
          fields.push({
            name: `faction_${faction._id}`,
            label: `${faction.config.name} (Intendencia)`,
            type: 'number',
            defaultValue: faction.votes,
            min: 0,
          });
        });
    }

    if (gobernacion.length > 0) {
      gobernacion
        .sort((a, b) =>
          a.config.name > b.config.name || a.config.name == 'Blancos' ? 1 : -1
        )
        .forEach((faction) => {
          fields.push({
            name: `faction_${faction._id}`,
            label: `${faction.config.name} (Gobernación)`,
            type: 'number',
            defaultValue: faction.votes,
            min: 0,
          });
        });
    }

    if (presidencia.length > 0) {
      presidencia
        .sort((a, b) =>
          a.config.name > b.config.name || a.config.name == 'Blancos' ? 1 : -1
        )
        .forEach((faction) => {
          fields.push({
            name: `faction_${faction._id}`,
            label: `${faction.config.name} (Presidencia)`,
            type: 'number',
            defaultValue: faction.votes,
            min: 0,
          });
        });
    }

    return fields;
  };

  return (
    <>
      <button
        className='p-3 bg-zinc-600 hover:bg-zinc-500 rounded flex items-center gap-2 text-xl'
        onClick={() => setShowModal(true)}
      >
        <BsSendCheck className='text-2xl' /> Editar Datos de Votos
      </button>

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title='Editar los Votos Contados'
        fields={createFormFields()}
        loading={loading}
        submitText='Enviar Datos Editados'
      />
    </>
  );
};
