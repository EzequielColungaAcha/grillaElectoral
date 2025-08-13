import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
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

export const EditVotesButton = ({ table }) => {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const { loading, error, data, refetch } = useQuery(GET_TABLE_VOTES, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
  });

  const [updateVotes] = useMutation(UPDATE_VOTES);

  const MySwal = withReactContent(Swal);

  const { data: tableChanged } = useSubscription(TABLE_CHANGED, {
    onData: ({ client, onData }) => {
      let timerInterval;
      MySwal.fire({
        title: 'Actualizando Mesa...',
        html: '<b></b> para finalizar la actualización.',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          MySwal.showLoading();
          const b = MySwal.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
            b.textContent = MySwal.getTimerLeft();
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === MySwal.DismissReason.timer) {
          refetch();
        }
      });
    },
  });

  const { data: factionVotesUpdate } = useSubscription(FACTION_VOTES_UPDATE, {
    onData: ({ client, onData }) => {
      let timerInterval;
      MySwal.fire({
        title: 'Actualizando Datos de Votos...',
        html: '<b></b> para finalizar la actualización.',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          MySwal.showLoading();
          const b = MySwal.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
            b.textContent = MySwal.getTimerLeft();
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === MySwal.DismissReason.timer) {
          refetch();
        }
      });
    },
  });

  if (loading) return <span className='loader'></span>;
  if (error) {
    console.log(error);
    return <p>Error...</p>;
  }

  const showModal = () => {
    const intendencia = data.table.factions.filter((f) => {
      return f.config.position === 'intendencia';
    });
    const gobernacion = data.table.factions.filter((f) => {
      return f.config.position === 'gobernacion';
    });
    const presidencia = data.table.factions.filter((f) => {
      return f.config.position === 'presidencia';
    });
    MySwal.fire({
      title: `Editar los Votos Contados`,
      html: (
        <form className='flex flex-col gap-3 overflow-hidden'>
          <h2>Intendencia</h2>
          {intendencia
            .sort((a, b) => (a.name > b.name || a.name == 'Blancos' ? 1 : -1))
            .map((faction) => (
              <label key={faction._id} className='flex justify-between'>
                <div className='w-2/3 flex flex-wrap items-center'>
                  <span
                    className='text-3xl m-0'
                    style={{ color: `${faction.config.color}` }}
                  >
                    •
                  </span>
                  {faction.config.name}:
                </div>
                <input
                  id={`factionVotes`}
                  type='number'
                  name={faction.config.name}
                  data-id={faction._id}
                  data-name={faction.config.name}
                  defaultValue={faction.votes}
                  className='border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/3'
                />
              </label>
            ))}
          <h2>Gobernación</h2>
          {gobernacion
            .sort((a, b) => (a.name > b.name || a.name == 'Blancos' ? 1 : -1))
            .map((faction) => (
              <label key={faction._id} className='flex justify-between'>
                <div className='w-2/3 flex flex-wrap items-center'>
                  <span
                    className='text-3xl m-0'
                    style={{ color: `${faction.config.color}` }}
                  >
                    •
                  </span>
                  {faction.config.name}:
                </div>
                <input
                  id={`factionVotes`}
                  type='number'
                  name={faction.config.name}
                  data-id={faction._id}
                  data-name={faction.config.name}
                  defaultValue={faction.votes}
                  className='border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/3'
                />
              </label>
            ))}
          <h2>Presidencia</h2>
          {presidencia
            .sort((a, b) => (a.name > b.name || a.name == 'Blancos' ? 1 : -1))
            .map((faction) => (
              <label key={faction._id} className='flex justify-between'>
                <div className='w-2/3 flex flex-wrap items-center'>
                  <span
                    className='text-3xl m-0'
                    style={{ color: `${faction.config.color}` }}
                  >
                    •
                  </span>
                  {faction.config.name}:
                </div>
                <input
                  id={`factionVotes`}
                  type='number'
                  name={faction.config.name}
                  data-id={faction._id}
                  data-name={faction.config.name}
                  defaultValue={faction.votes}
                  className='border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/3'
                />
              </label>
            ))}
        </form>
      ),
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Enviar Datos Editados',
      cancelButtonText: 'Cerrar',
      cancelButtonColor: '#464646',
      showLoaderOnConfirm: true,
      reverseButtons: true,
      preConfirm: () => {
        const records = [];

        [...document.querySelectorAll('#factionVotes')].map((input) => {
          const faction = {
            _id: input.dataset.id,
            votes: input.valueAsNumber,
            name: input.dataset.name,
          };
          records.push(faction);
        });
        updateVotes({
          variables: {
            data: records,
            userName: user.name,
            userRol: user.rol,
            tableNumber: table.number,
          },
        })
          .then((response) => {
            if (!response.data.updateMultipleFactionRecord) {
              throw new Error(response.statusText);
            }
            return;
          })
          .catch((error) => {
            Swal.showValidationMessage(`Error`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  return (
    <button
      className='p-3 bg-slate-600 hover:bg-slate-500 rounded flex items-center gap-2 text-xl'
      onClick={showModal}
    >
      <BsSendCheck className='text-2xl' /> Editar Datos de Votos
    </button>
  );
};
