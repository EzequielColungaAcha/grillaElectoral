import { FACTION_DELETE } from '../../../../graphql/factions';
import { useMutation } from '@apollo/client';
import { UPDATE_STATUS } from '../../../../graphql/tables';
import { useState } from 'react';
import { ConfirmModal } from '../../../modals/ConfirmModal';

export const ResetTableVotes = ({ table, disabled }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteFactions] = useMutation(FACTION_DELETE);
  const [updateStatus] = useMutation(UPDATE_STATUS);

  const handleConfirm = () => {
    const status = table.status == 'Abierta' ? 'Abierta' : 'Cerrada';
    deleteFactions({
      variables: {
        id: table._id,
        status,
      },
    });
    setShowConfirm(false);
  };

  return disabled ? (
    <button className='bg-gray-400 py-2 px-5 pointer-events-none bg-opacity-10'>
      Reset Votaciones
    </button>
  ) : (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className='bg-orange-700 py-2 px-5 hover:bg-orange-600'
      >
        Reset Votaciones
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={`¿Eliminar votaciones de Mesa ${table.number}?`}
        message={`¡ATENCIÓN! Asegúrese de tener respaldo del recuento de votos.\n\nEsta acción eliminará todas las votaciones registradas para esta mesa.`}
        type='danger'
        confirmText='Eliminar'
        cancelText='Cancelar'
      />
    </>
  );
};
