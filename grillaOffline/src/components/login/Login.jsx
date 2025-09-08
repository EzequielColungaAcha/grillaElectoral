import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../../context/dbContext';
import { useAuth } from '../../context/simpleAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { URL } from '../../config';

const MySwal = withReactContent(Swal);

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { importData } = useDB();
  const [loading, setLoading] = useState(false);

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      MySwal.fire({
        icon: 'error',
        title: 'Archivo inválido',
        text: 'Por favor selecciona un archivo JSON válido.',
      });
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Validate JSON structure
        if (!jsonData.tables || !Array.isArray(jsonData.tables)) {
          throw new Error('Estructura de archivo inválida');
        }

        await importData(jsonData);

        MySwal.fire({
          icon: 'success',
          title: 'Datos importados correctamente',
          text: 'Acceso concedido como administrador.',
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          login();
          navigate(URL);
        });
      } catch (error) {
        console.error('Error importing data:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Error al importar datos',
          text: 'El archivo JSON no tiene el formato correcto o está corrupto.',
        });
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      MySwal.fire({
        icon: 'error',
        title: 'Error al leer archivo',
        text: 'No se pudo leer el archivo seleccionado.',
      });
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className='h-full w-full py-3 flex flex-col justify-center sm:py-3'>
      <div className='relative py-3 sm:max-w-xl sm:mx-auto'>
        <div className='relative px-4 py-10 bg-slate-600 shadow-md sm:rounded-3xl sm:p-10 border-2 border-slate-400 shadow-slate-400'>
          <div className='max-w-md mx-auto'>
            <div>
              <h1 className='text-2xl font-semibold text-slate-100 mb-5 text-center'>
                Grilla Electoral - Modo Offline
              </h1>
            </div>
            <div className='divide-y divide-gray-200'>
              <div className='py-3 px-5 text-base leading-6 space-y-4 text-gray-50 sm:text-lg sm:leading-7'>
                <div className='text-center mb-6'>
                  <p className='text-slate-200 mb-4'>
                    Para acceder al sistema, importa un archivo JSON con los
                    datos electorales.
                  </p>
                  <p className='text-slate-300 text-sm mb-6'>
                    El archivo debe ser exportado desde la versión online de
                    Grilla Electoral.
                  </p>
                </div>

                <div className='relative flex flex-col items-center'>
                  <label
                    htmlFor='jsonFile'
                    className={`cursor-pointer bg-slate-800 hover:bg-slate-700 text-white rounded-md px-6 py-3 transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Importando...' : 'Seleccionar archivo JSON'}
                  </label>
                  <input
                    id='jsonFile'
                    type='file'
                    accept='.json'
                    onChange={handleFileImport}
                    disabled={loading}
                    className='hidden'
                  />
                </div>

                {loading && (
                  <div className='flex justify-center mt-4'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
                  </div>
                )}

                <div className='text-center mt-6'>
                  <p className='text-slate-300 text-xs'>
                    Una vez importado correctamente, tendrás acceso completo
                    como administrador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
