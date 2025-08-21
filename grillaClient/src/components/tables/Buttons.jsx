import { UPDATE_STATUS } from '../../graphql/tables';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { TiArrowBackOutline } from 'react-icons/ti';
import { AuthContext } from '../../context/authContext';
import { useContext, useState } from 'react';
import { ConfirmModal } from '../modals/ConfirmModal';

export const ButtonCloseTable = ({ table, search }) => {
  const { user } = useContext(AuthContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updateStatus] = useMutation(UPDATE_STATUS, {
    refetchQueries: ['getTable'],
  });

  const handleConfirm = () => {
    search('');
    table.factions.length == 0
      ? updateStatus({
          variables: {
            id: table._id,
            number: table.number,
            status: 'Cerrada',
            userName: user.name,
            userRol: user.rol,
          },
        })
      : updateStatus({
          variables: {
            id: table._id,
            number: table.number,
            status: 'DatosEnviados',
            userName: user.name,
            userRol: user.rol,
          },
        });
    setShowConfirm(false);
  };

  return (
    <>
      <button
        className='text-center bg-red-800 hover:bg-red-900 px-3 py-2 mb-1 text-2xl'
        onClick={() => setShowConfirm(true)}
      >
        Cerrar Mesa
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={`¿Deseas cerrar la mesa ${table.number}?`}
        message='Esta acción cambiará el estado de la mesa a cerrada.'
        type='danger'
        confirmText='Sí, cerrar'
        cancelText='Cancelar'
        noTrashIcon={true}
      />
    </>
  );
};

export const ButtonOpenTable = ({ table }) => {
  const { user } = useContext(AuthContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updateStatus] = useMutation(UPDATE_STATUS, {
    refetchQueries: ['getTable'],
  });

  const handleConfirm = () => {
    updateStatus({
      variables: {
        id: table._id,
        number: table.number,
        status: 'Abierta',
        userName: user.name,
        userRol: user.rol,
      },
    });
    setShowConfirm(false);
  };

  return (
    <>
      <button
        className='text-center bg-blue-600 hover:bg-blue-700 px-3 py-2 mb-1 text-2xl'
        onClick={() => setShowConfirm(true)}
      >
        Abrir Mesa {table.number}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={`¿Deseas abrir la mesa ${table.number}?`}
        message='Esta acción cambiará el estado de la mesa a abierta.'
        type='info'
        confirmText='Sí, abrir'
        cancelText='Cancelar'
      />
    </>
  );
};

export const ButtonBackToTables = () => {
  return (
    <Link to='/mesas'>
      <button className='bg-zinc-600 hover:bg-zinc-700 flex items-center text-white px-3 py-2 mb-1 text-2xl'>
        <TiArrowBackOutline /> Volver
      </button>
    </Link>
  );
};
