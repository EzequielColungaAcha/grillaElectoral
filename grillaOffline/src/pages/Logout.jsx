import { useAuth } from '../context/simpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { URL } from '../config';

export const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const onLogout = () => {
    logout();
    navigate(`${URL}/`);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    navigate(`${URL}/`);
  };

  return (
    <>
      <div className='flex justify-center h-screen items-center'>
        <button
          className='bg-rose-800 px-10 py-5 flex items-center text-4xl uppercase font-bold leading-snug text-zinc-200 hover:text-rose-800 hover:bg-zinc-200'
          onClick={() => setShowConfirm(true)}
        >
          <span className='ml-2'>Cerrar Sesión</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={handleCancel}
        onConfirm={onLogout}
        title='¿Cerrar Sesión?'
        message={
          'Esto eliminará todos los datos importados.\n¿Estás seguro de que deseas cerrar la sesión?'
        }
        type='warning'
        confirmText='Cerrar'
        cancelText='Cancelar'
      />
    </>
  );
};
