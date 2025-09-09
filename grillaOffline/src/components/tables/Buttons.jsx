import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Link } from 'react-router-dom';
import { TiArrowBackOutline } from 'react-icons/ti';
import { useAuth } from '../../context/simpleAuthContext';
import { useContext, useState } from 'react';
import { useDB } from '../../context/dbContext';
import { URL } from '../../config';
import { ConfirmModal } from '../modals/ConfirmModal';

export const ButtonCloseTable = ({ table, search }) => {
  const { user } = useAuth();
  const { updateRecord } = useDB();
  const [showConfirm, setShowConfirm] = useState(false);

  const updateStatus = async (status) => {
    await updateRecord('tables', {
      ...table,
      status,
    });
  };

  const handleConfirm = () => {
    search('');
    table.factions.length == 0
      ? updateStatus('Cerrada')
      : updateStatus('DatosEnviados');
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
  const { user } = useAuth();
  const { updateRecord } = useDB();
  const [showConfirm, setShowConfirm] = useState(false);

  const updateStatus = async () => {
    await updateRecord('tables', {
      ...table,
      status: 'Abierta',
    });
  };

  const handleConfirm = () => {
    updateStatus();
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
    <Link to={`${URL}/mesas`}>
      <button className='bg-sky-900 hover:bg-sky-800 flex items-center text-white px-3 py-2 mb-1 text-2xl'>
        <TiArrowBackOutline /> Volver
      </button>
    </Link>
  );
};
