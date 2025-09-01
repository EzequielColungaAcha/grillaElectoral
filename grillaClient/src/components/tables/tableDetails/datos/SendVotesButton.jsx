import { GET_FACTION_CONFIG, SEND_VOTES } from '../../../../graphql/factions';
import { UPDATE_STATUS } from '../../../../graphql/tables';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { BsSend } from 'react-icons/bs';
import { FACTION_VOTES_SEND } from '../../../../graphql/subscription';
import { AuthContext } from '../../../../context/authContext';
import { useContext } from 'react';
import { useState } from 'react';
import { FormModal } from '../../../modals/FormModal';
import { toast } from 'keep-react';

export const SendVotesButton = ({ table }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    loading: getFactionConfigLoading,
    error,
    data,
    refetch,
  } = useQuery(GET_FACTION_CONFIG);

  const [sendVotes] = useMutation(SEND_VOTES);
  const [updateTable] = useMutation(UPDATE_STATUS);

  const { data: factionVotesSend } = useSubscription(FACTION_VOTES_SEND, {
    onData: ({ client, onData }) => {
      toast.success('Datos de votos enviados correctamente');
      setTimeout(() => {
        refetch();
      }, 2000);
    },
  });

  if (getFactionConfigLoading) return <span className='loader'></span>;
  if (error) return <p>Error...</p>;

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const records = [];

      // Process form data to create faction records
      Object.keys(formData).forEach((key) => {
        if (key.startsWith('faction_')) {
          const factionId = key.replace('faction_', '');
          const faction = data.factionsConfig.find((f) => f._id === factionId);
          if (faction) {
            records.push({
              config: factionId,
              votes: parseInt(formData[key]) || 0,
              table: table._id,
              name: faction.name,
            });
          }
        }
      });

      const response = await sendVotes({
        variables: {
          data: records,
          userName: user.name,
          userRol: user.rol,
          tableNumber: table.number,
        },
      });

      if (response.data.setMultipleFactionRecord) {
        await updateTable({
          variables: {
            id: table._id,
            number: table.number,
            status: 'DatosEnviados',
            userName: user.name,
            userRol: user.rol,
          },
        });
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error al enviar datos');
    } finally {
      setLoading(false);
    }
  };

  const createFormFields = () => {
    const intendencia = data.factionsConfig.filter((f) => {
      return f.position === 'intendencia';
    });
    const gobernacion = data.factionsConfig.filter((f) => {
      return f.position === 'gobernacion';
    });
    const presidencia = data.factionsConfig.filter((f) => {
      return f.position === 'presidencia';
    });

    const fields = [];

    // Add section headers and fields for each position
    if (intendencia.length > 0) {
      intendencia
        .sort((a, b) => (a.name > b.name || a.name == 'Blancos' ? 1 : -1))
        .forEach((faction) => {
          fields.push({
            name: `faction_${faction._id}`,
            label: `${faction.name} (Intendencia)`,
            type: 'number',
            defaultValue: '',
            min: 0,
          });
        });
    }

    if (gobernacion.length > 0) {
      gobernacion
        .sort((a, b) => (a.name > b.name || a.name == 'Blancos' ? 1 : -1))
        .forEach((faction) => {
          fields.push({
            name: `faction_${faction._id}`,
            label: `${faction.name} (Gobernación)`,
            type: 'number',
            defaultValue: '',
            min: 0,
          });
        });
    }

    if (presidencia.length > 0) {
      presidencia
        .sort((a, b) => (a.name > b.name || a.name == 'Blancos' ? 1 : -1))
        .forEach((faction) => {
          fields.push({
            name: `faction_${faction._id}`,
            label: `${faction.name} (Presidencia)`,
            type: 'number',
            defaultValue: '',
            min: 0,
          });
        });
    }

    return fields;
  };

  return (
    <>
      {data.factionsConfig.length < 1 ? (
        <button className='p-3 bg-zinc-600 rounded flex items-center gap-2 text-xl pointer-events-none'>
          No hay Partidos cargados
        </button>
      ) : (
        <button
          className='p-3 bg-zinc-600 hover:bg-zinc-500 rounded flex items-center gap-2 text-xl'
          onClick={() => setShowModal(true)}
        >
          <BsSend className='text-2xl' /> Enviar Datos de Votos
        </button>
      )}

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title='Envío de Votos Contados'
        fields={createFormFields()}
        loading={loading}
        submitText='Enviar Datos'
      />
    </>
  );
};
