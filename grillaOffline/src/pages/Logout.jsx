import { useContext } from 'react';
import { useAuth } from '../context/simpleAuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { URL } from '../config';

const MySwal = withReactContent(Swal);

export const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    MySwal.fire({
      title: `Cerrar Sesión?`,
      text: 'Esto eliminará todos los datos importados.',
      icon: 'warning',
      iconColor: '#d33',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#464646',
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Show loading while clearing database
        MySwal.fire({
          title: 'Cerrando sesión...',
          text: 'Limpiando base de datos...',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            MySwal.showLoading();
          },
        });

        try {
          await logout();
          MySwal.close();
          navigate(`${URL}/`);
        } catch (error) {
          console.error('Error during logout:', error);
          MySwal.close();
          navigate(`${URL}/`);
        }
      } else {
        navigate(`${URL}/`);
      }
    });
  };

  return (
    <div className='flex justify-center h-screen items-center'>
      <button
        className='bg-rose-800 px-10 py-5 flex items-center text-4xl uppercase font-bold leading-snug text-slate-200 hover:text-rose-800 hover:bg-slate-200'
        onClick={onLogout}
      >
        <span className='ml-2'>Cerrar Sesión</span>
      </button>
    </div>
  );
};
